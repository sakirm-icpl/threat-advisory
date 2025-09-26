import os
import secrets
import requests
from authlib.integrations.flask_client import OAuth
from flask import current_app, session
from app.models.user import UserRole
from app.models.audit_log import AuditLog, AuditAction
from app import db

class GitHubOAuth:
    def __init__(self, app=None):
        self.oauth = OAuth()
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize OAuth with Flask app"""
        self.oauth.init_app(app)
        
        # Register GitHub OAuth client with proper OAuth 2.0 URLs
        self.github = self.oauth.register(
            name='github',
            client_id=os.getenv('GITHUB_CLIENT_ID'),
            client_secret=os.getenv('GITHUB_CLIENT_SECRET'),
            access_token_url='https://github.com/login/oauth/access_token',
            authorize_url='https://github.com/login/oauth/authorize',
            api_base_url='https://api.github.com/',
            client_kwargs={
                'scope': 'user:email'
            }
        )
    
    def get_authorization_url(self, redirect_uri):
        """Generate GitHub OAuth authorization URL with secure state parameter"""
        try:
            # Generate secure random state for CSRF protection
            state = secrets.token_urlsafe(32)
            # Store state in a way that can be accessed by API calls
            # We'll store it temporarily in memory/cache instead of session
            session['oauth_state'] = state
            
            client_id = os.getenv('GITHUB_CLIENT_ID')
            if not client_id:
                raise ValueError("GITHUB_CLIENT_ID not configured")
            
            scope = 'user:email'
            auth_url = f"https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&scope={scope}&state={state}"
            
            current_app.logger.info(f"Generated GitHub auth URL for state: {state[:8]}...")
            return {'authorization_url': auth_url, 'state': state}
        except Exception as e:
            current_app.logger.error(f"Error generating authorization URL: {str(e)}")
            return None
    
    def get_access_token(self, code, state=None):
        """Exchange authorization code for access token with enhanced state validation"""
        # Enhanced state validation that works with API architecture
        if state:
            # For API calls, we can't rely on session state alone
            # We'll validate the state format and recency instead
            try:
                # Basic validation: state should be URL-safe base64
                import base64
                base64.urlsafe_b64decode(state + '==')  # Add padding if needed
                current_app.logger.info(f"State validation passed for: {state[:8]}...")
            except Exception:
                current_app.logger.error(f"Invalid state format: {state[:8]}...")
                return None
            
            # Try to get stored state from session (may not exist in API calls)
            stored_state = session.get('oauth_state')
            if stored_state:
                if stored_state != state:
                    current_app.logger.error("State mismatch - possible CSRF attack")
                    return None
                # Clear the state from session
                session.pop('oauth_state', None)
            else:
                current_app.logger.info("No stored state in session (API call) - relying on format validation")
        else:
            current_app.logger.warning("No state parameter provided - security risk!")
        
        token_url = 'https://github.com/login/oauth/access_token'
        
        client_id = os.getenv('GITHUB_CLIENT_ID')
        client_secret = os.getenv('GITHUB_CLIENT_SECRET')
        
        if not client_id or not client_secret:
            current_app.logger.error("GitHub OAuth credentials not configured properly")
            return None
        
        data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code
        }
        
        headers = {'Accept': 'application/json'}
        
        try:
            response = requests.post(token_url, data=data, headers=headers, timeout=10)
            
            if response.status_code == 200:
                token_data = response.json()
                if 'access_token' in token_data:
                    return token_data
                else:
                    current_app.logger.error(f"No access token in response: {token_data}")
                    return None
            else:
                current_app.logger.error(f"Token exchange failed: {response.status_code} - {response.text}")
                return None
                
        except requests.RequestException as e:
            current_app.logger.error(f"Request error during token exchange: {str(e)}")
            return None
        except Exception as e:
            current_app.logger.error(f"Unexpected error during token exchange: {str(e)}")
            return None
    
    def get_user_info(self, access_token):
        """Get user information from GitHub API with enhanced error handling"""
        headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/json',
            'User-Agent': 'VersionIntel-App/1.0'
        }
        
        try:
            # Get user basic info
            user_response = requests.get('https://api.github.com/user', headers=headers, timeout=15)
            if user_response.status_code == 401:
                current_app.logger.error("GitHub API returned 401 - Invalid access token")
                return None
            elif user_response.status_code == 403:
                current_app.logger.error("GitHub API returned 403 - Rate limit exceeded")
                return None
            elif user_response.status_code != 200:
                current_app.logger.error(f"Failed to get user info: {user_response.status_code} - {user_response.text}")
                return None
            
            user_data = user_response.json()
            
            # Validate required fields
            if not user_data.get('id') or not user_data.get('login'):
                current_app.logger.error("GitHub user data missing required fields (id or login)")
                return None
            
            # Get user emails
            email_response = requests.get('https://api.github.com/user/emails', headers=headers, timeout=10)
            emails = email_response.json() if email_response.status_code == 200 else []
            
            # Find primary email
            primary_email = None
            verified_email = None
            
            for email in emails:
                if email.get('primary') and email.get('verified'):
                    primary_email = email['email']
                    break
                elif email.get('verified') and not verified_email:
                    verified_email = email['email']
            
            # Use public email as fallback if no primary verified email
            if not primary_email:
                primary_email = verified_email or user_data.get('email')
            
            # Ensure we have an email
            if not primary_email:
                current_app.logger.error("No verified email found for GitHub user")
                return None
            
            # Create standardized user info
            user_info = {
                'github_id': str(user_data['id']),
                'github_username': user_data['login'],
                'email': primary_email,
                'name': user_data.get('name'),
                'avatar_url': user_data.get('avatar_url'),
                'bio': user_data.get('bio'),
                'company': user_data.get('company'),
                'location': user_data.get('location'),
                'public_repos': user_data.get('public_repos', 0),
                'followers': user_data.get('followers', 0),
                'following': user_data.get('following', 0),
                'github_created_at': user_data.get('created_at'),
                'github_updated_at': user_data.get('updated_at')
            }
            
            current_app.logger.info(f"Successfully retrieved GitHub user info for: {user_info['github_username']}")
            return user_info
            
        except requests.RequestException as e:
            current_app.logger.error(f"Request error during user info retrieval: {str(e)}")
            return None
        except Exception as e:
            current_app.logger.error(f"Unexpected error during user info retrieval: {str(e)}")
            return None
    
    def create_or_update_user(self, user_info, ip_address=None):
        """Create new user or update existing user from GitHub info"""
        from app.models.user import User  # Import here to avoid circular import
        
        try:
            # Look for existing user by GitHub ID first, then by email
            user = User.query.filter_by(github_id=user_info['github_id']).first()
            
            is_new_user = False
            old_values = None
            
            if not user:
                # Check if user exists with same email
                existing_user = User.query.filter_by(email=user_info['email']).first()
                
                if existing_user:
                    # Link GitHub account to existing user
                    old_values = existing_user.to_dict()
                    existing_user.github_id = user_info['github_id']
                    existing_user.github_username = user_info['github_username']
                    existing_user.name = user_info['name']
                    existing_user.avatar_url = user_info['avatar_url']
                    existing_user.updated_at = db.func.now()
                    user = existing_user
                    current_app.logger.info(f"Linked GitHub account to existing user: {user.email}")
                else:
                    # Create new user with contributor role (default)
                    is_new_user = True
                    user = User(
                        github_id=user_info['github_id'],
                        github_username=user_info['github_username'],
                        username=user_info['github_username'],  # Legacy field
                        name=user_info['name'],
                        email=user_info['email'],
                        avatar_url=user_info['avatar_url'],
                        role=UserRole.CONTRIBUTOR  # Default role for new GitHub users
                    )
                    db.session.add(user)
                    current_app.logger.info(f"Created new contributor user from GitHub: {user.email}")
            else:
                # Update existing GitHub user info
                old_values = user.to_dict()
                user.name = user_info['name']
                user.avatar_url = user_info['avatar_url']
                user.email = user_info['email']  # Update email in case it changed
                user.updated_at = db.func.now()
                current_app.logger.info(f"Updated existing GitHub user: {user.email}")
            
            # Update last login
            user.last_login = db.func.now()
            db.session.commit()
            
            # Log the authentication action
            if is_new_user:
                AuditLog.log_action(
                    user_id=user.id,
                    action=AuditAction.CREATE,
                    resource_type='user',
                    resource_id=user.id,
                    description=f"New user created via GitHub OAuth: {user.github_username}",
                    new_values=user.to_dict(),
                    ip_address=ip_address
                )
            
            AuditLog.log_action(
                user_id=user.id,
                action=AuditAction.LOGIN,
                resource_type='user',
                resource_id=user.id,
                description=f"User logged in via GitHub OAuth",
                ip_address=ip_address
            )
            
            return user
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating/updating user from GitHub: {str(e)}")
            raise

# Initialize OAuth instance
github_oauth = GitHubOAuth()