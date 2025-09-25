# GitHub OAuth Implementation for VersionIntel

## 🔧 BACKEND CHANGES (Flask/Python)

### 1. Install Required Dependencies

Add to `requirements.txt`:
```
authlib==1.2.1
requests==2.31.0
python-dotenv==1.0.0
```

### 2. Environment Configuration

Add to `.env` file:
```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/github/callback
# For production: https://yourdomain.com/auth/github/callback

# JWT Configuration (keep existing)
JWT_SECRET_KEY=your_jwt_secret
JWT_ACCESS_TOKEN_EXPIRES=3600
```

### 3. Update User Model

Modify `app/models/user.py`:
```python
from sqlalchemy.dialects.postgresql import UUID
import uuid

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    # GitHub OAuth fields (NEW)
    github_id = db.Column(db.String(50), unique=True, nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    github_username = db.Column(db.String(80), nullable=True)
    
    # Remove password_hash field since we're using OAuth
    # password_hash = db.Column(db.String(255), nullable=False)  # REMOVE THIS
    
    role = db.Column(db.String(20), default='user')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'username': self.username,
            'email': self.email,
            'github_username': self.github_username,
            'avatar_url': self.avatar_url,
            'role': self.role,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat()
        }
```

### 4. Create GitHub OAuth Service

Create `app/services/github_oauth.py`:
```python
import os
import requests
from authlib.integrations.flask_client import OAuth
from flask import current_app

class GitHubOAuth:
    def __init__(self, app=None):
        self.oauth = OAuth()
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        self.oauth.init_app(app)
        
        # Register GitHub OAuth client
        self.github = self.oauth.register(
            name='github',
            client_id=os.getenv('GITHUB_CLIENT_ID'),
            client_secret=os.getenv('GITHUB_CLIENT_SECRET'),
            server_metadata_url='https://api.github.com/.well-known/openid_configuration',
            client_kwargs={
                'scope': 'user:email'
            }
        )
    
    def get_authorization_url(self, redirect_uri):
        """Generate GitHub OAuth authorization URL"""
        return self.github.authorize_redirect(redirect_uri)
    
    def get_access_token(self, code):
        """Exchange authorization code for access token"""
        token_url = 'https://github.com/login/oauth/access_token'
        
        data = {
            'client_id': os.getenv('GITHUB_CLIENT_ID'),
            'client_secret': os.getenv('GITHUB_CLIENT_SECRET'),
            'code': code
        }
        
        headers = {'Accept': 'application/json'}
        response = requests.post(token_url, data=data, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        return None
    
    def get_user_info(self, access_token):
        """Get user information from GitHub API"""
        headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/json'
        }
        
        # Get user basic info
        user_response = requests.get('https://api.github.com/user', headers=headers)
        if user_response.status_code != 200:
            return None
        
        user_data = user_response.json()
        
        # Get user emails
        email_response = requests.get('https://api.github.com/user/emails', headers=headers)
        emails = email_response.json() if email_response.status_code == 200 else []
        
        # Find primary email
        primary_email = None
        for email in emails:
            if email.get('primary'):
                primary_email = email['email']
                break
        
        return {
            'github_id': str(user_data['id']),
            'username': user_data['login'],
            'email': primary_email or user_data.get('email'),
            'avatar_url': user_data.get('avatar_url'),
            'name': user_data.get('name'),
            'github_username': user_data['login']
        }

# Initialize OAuth
github_oauth = GitHubOAuth()
```

### 5. Update Authentication Routes

Replace `app/routes/auth.py`:
```python
from flask import Blueprint, request, jsonify, redirect, url_for, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token
from app.models.user import User
from app.services.github_oauth import github_oauth
from app import db
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/github/login', methods=['GET'])
def github_login():
    """Initiate GitHub OAuth login"""
    redirect_uri = request.args.get('redirect_uri', 'http://localhost:3000/auth/callback')
    return github_oauth.get_authorization_url(redirect_uri)

@auth_bp.route('/github/callback', methods=['GET'])
def github_callback():
    """Handle GitHub OAuth callback"""
    code = request.args.get('code')
    error = request.args.get('error')
    
    if error:
        return jsonify({'error': 'GitHub OAuth error', 'details': error}), 400
    
    if not code:
        return jsonify({'error': 'Authorization code not provided'}), 400
    
    try:
        # Exchange code for access token
        token_data = github_oauth.get_access_token(code)
        if not token_data or 'access_token' not in token_data:
            return jsonify({'error': 'Failed to get access token'}), 400
        
        # Get user info from GitHub
        user_info = github_oauth.get_user_info(token_data['access_token'])
        if not user_info:
            return jsonify({'error': 'Failed to get user information'}), 400
        
        # Find or create user
        user = User.query.filter_by(github_id=user_info['github_id']).first()
        
        if not user:
            # Check if user exists with same email
            existing_user = User.query.filter_by(email=user_info['email']).first()
            if existing_user:
                # Link GitHub account to existing user
                existing_user.github_id = user_info['github_id']
                existing_user.avatar_url = user_info['avatar_url']
                existing_user.github_username = user_info['github_username']
                existing_user.updated_at = datetime.utcnow()
                user = existing_user
            else:
                # Create new user
                user = User(
                    username=user_info['username'],
                    email=user_info['email'],
                    github_id=user_info['github_id'],
                    avatar_url=user_info['avatar_url'],
                    github_username=user_info['github_username'],
                    role='user'  # Default role
                )
                db.session.add(user)
        else:
            # Update existing GitHub user info
            user.avatar_url = user_info['avatar_url']
            user.email = user_info['email']
            user.updated_at = datetime.utcnow()
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate JWT tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        })
        
    except Exception as e:
        current_app.logger.error(f"GitHub OAuth error: {str(e)}")
        return jsonify({'error': 'Authentication failed'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_active:
        return jsonify({'error': 'User not found or inactive'}), 404
    
    return jsonify({'user': user.to_dict()})

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    """Refresh JWT access token"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_active:
        return jsonify({'error': 'User not found or inactive'}), 404
    
    new_token = create_access_token(identity=user_id)
    return jsonify({'access_token': new_token})

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client-side token removal)"""
    return jsonify({'message': 'Successfully logged out'})

# Remove old password-based routes:
# - /auth/login (POST)
# - /auth/register (POST) 
# - /auth/change-password (PUT)
```

### 6. Update Flask App Configuration

Modify `app/__init__.py`:
```python
from flask import Flask
from app.services.github_oauth import github_oauth

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    github_oauth.init_app(app)  # ADD THIS
    
    # Register blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    return app
```

### 7. Database Migration

Create migration script `migrations/add_github_oauth.sql`:
```sql
-- Add GitHub OAuth fields to users table
ALTER TABLE users 
ADD COLUMN github_id VARCHAR(50) UNIQUE,
ADD COLUMN avatar_url VARCHAR(255),
ADD COLUMN github_username VARCHAR(80);

-- Remove password_hash requirement (make nullable)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add indexes
CREATE UNIQUE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_github_username ON users(github_username);
```

## ⚛️ FRONTEND CHANGES (React)

### 8. Update Authentication Context

Modify `src/hooks/useAuth.js`:
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Verify token and get user info
      api.get('/auth/me')
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithGitHub = () => {
    // Redirect to GitHub OAuth
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'user:email';
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    window.location.href = githubAuthUrl;
  };

  const handleGitHubCallback = async (code) => {
    try {
      const response = await api.get(`/auth/github/callback?code=${code}`);
      const { access_token, refresh_token, user } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('GitHub auth callback error:', error);
      return { success: false, error: error.response?.data?.error || 'Authentication failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    // Optional: Call backend logout endpoint
    api.post('/auth/logout').catch(() => {});
  };

  const value = {
    user,
    loading,
    loginWithGitHub,
    handleGitHubCallback,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 9. Create GitHub Login Component

Create `src/components/GitHubLogin.js`:
```javascript
import React from 'react';
import { Github } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function GitHubLogin() {
  const { loginWithGitHub, loading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to VersionIntel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your GitHub account to continue
          </p>
        </div>
        
        <div className="mt-8">
          <button
            onClick={loginWithGitHub}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Github className="w-5 h-5 mr-2" />
            {loading ? 'Loading...' : 'Continue with GitHub'}
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to collaborate on security research
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 10. Create OAuth Callback Handler

Create `src/pages/AuthCallback.js`:
```javascript
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGitHubCallback } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setError('GitHub authentication was cancelled or failed');
      return;
    }

    if (!code) {
      setError('Invalid authentication response');
      return;
    }

    // Handle GitHub callback
    handleGitHubCallback(code)
      .then((result) => {
        if (result.success) {
          navigate('/dashboard', { replace: true });
        } else {
          setError(result.error);
        }
      })
      .catch(() => {
        setError('Authentication failed. Please try again.');
      });
  }, [searchParams, handleGitHubCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">Authentication Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          Completing authentication...
        </h2>
        <p className="mt-2 text-gray-600">
          Please wait while we verify your GitHub account
        </p>
      </div>
    </div>
  );
}
```

### 11. Environment Configuration

Create `.env` file in React root:
```bash
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
REACT_APP_API_BASE_URL=http://localhost:8000
```

### 12. Update App Routes

Modify `src/App.js`:
```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import GitHubLogin from './components/GitHubLogin';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<GitHubLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Add other protected routes */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

## 📋 IMPLEMENTATION CHECKLIST

### Backend Tasks:
- [ ] Install dependencies (`authlib`, `requests`)
- [ ] Set up GitHub OAuth app in GitHub Developer Settings
- [ ] Add environment variables for GitHub OAuth
- [ ] Update User model with GitHub fields
- [ ] Create GitHubOAuth service class
- [ ] Replace authentication routes
- [ ] Run database migration
- [ ] Test OAuth flow with Postman/curl

### Frontend Tasks:
- [ ] Update authentication context
- [ ] Create GitHub login component
- [ ] Create OAuth callback handler
- [ ] Add environment variables
- [ ] Update routing and protected routes
- [ ] Update user profile components to show GitHub info
- [ ] Test complete authentication flow

### GitHub OAuth App Setup:
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth app with:
   - Application name: "VersionIntel"
   - Homepage URL: "http://localhost:3000" (or your domain)
   - Authorization callback URL: "http://localhost:3000/auth/callback"
3. Copy Client ID and Client Secret to environment files

### Testing Checklist:
- [ ] GitHub OAuth authorization redirects correctly
- [ ] Callback handles success and error cases
- [ ] User data is properly stored/updated
- [ ] JWT tokens are generated correctly
- [ ] Protected routes work with new auth
- [ ] Logout clears tokens and redirects
- [ ] Profile shows GitHub avatar and username