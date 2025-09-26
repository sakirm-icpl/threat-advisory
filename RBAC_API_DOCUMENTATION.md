# VersionIntel RBAC & GitHub OAuth API Documentation

## 🔐 Authentication & Authorization System

VersionIntel now uses **GitHub OAuth 2.0** as the primary authentication method with **Role-Based Access Control (RBAC)** featuring two distinct roles:

- **Admin**: Full system access, user management, and system configuration
- **Contributor**: Default role, can read all data but only CRUD their own records

## 🚀 Quick Start

### 1. GitHub OAuth Login Flow

```bash
# Step 1: Initiate OAuth login
GET /auth/github/login?redirect_uri=http://localhost:3000/auth/callback

# Step 2: User authorizes on GitHub and gets redirected to callback
GET /auth/github/callback?code=oauth_authorization_code

# Step 3: Receive JWT tokens
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "github_username": "johndoe",
    "email": "john@example.com",
    "role": "contributor",
    "github_id": "12345678"
  }
}
```

### 2. Using JWT Tokens

Include the access token in all authenticated requests:

```bash
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## 📚 Authentication Endpoints

### `POST /auth/login`

**Legacy username/password login** (kept for backward compatibility)

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@1234"
  }'
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### `GET /auth/github/login`

**Primary authentication method** - Initiates GitHub OAuth flow

**Parameters:**
- `redirect_uri` (optional): Callback URI after authentication

```bash
curl http://localhost:8000/auth/github/login?redirect_uri=http://localhost:3000/auth/callback
```

**Response:**
```json
{
  "authorization_url": "https://github.com/login/oauth/authorize?client_id=...&redirect_uri=..."
}
```

### `GET /auth/github/callback`

Handles GitHub OAuth callback and issues JWT tokens

**Parameters:**
- `code` (required): OAuth authorization code from GitHub
- `error` (optional): OAuth error message if any

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": 1,
    "github_username": "johndoe",
    "email": "john@example.com",
    "role": "contributor",
    "github_id": "12345678",
    "display_name": "John Doe"
  }
}
```

### `POST /auth/refresh`

Refresh access token using refresh token

```bash
curl -X POST http://localhost:8000/auth/refresh \
  -H "Authorization: Bearer refresh_token_here"
```

### `GET /auth/me`

Get current user profile

```bash
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer access_token_here"
```

## 👑 Admin-Only Endpoints

All admin endpoints require `Authorization: Bearer admin_access_token`

### `GET /auth/users`

List all users in the system

```bash
curl http://localhost:8000/auth/users \
  -H "Authorization: Bearer admin_token"
```

**Response:**
```json
[
  {
    "id": 1,
    "github_username": "admin_user",
    "email": "admin@example.com",
    "role": "admin",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "github_username": "contributor_user",
    "email": "contributor@example.com",
    "role": "contributor",
    "is_active": true,
    "created_at": "2024-01-02T00:00:00Z",
    "last_login": "2024-01-14T15:45:00Z"
  }
]
```

### `POST /auth/users/{user_id}/promote`

Promote a contributor to admin role

```bash
curl -X POST http://localhost:8000/auth/users/2/promote \
  -H "Authorization: Bearer admin_token"
```

**Response:**
```json
{
  "message": "User promoted to admin successfully",
  "user": {
    "id": 2,
    "github_username": "contributor_user",
    "role": "admin"
  }
}
```

### `POST /auth/users/{user_id}/demote`

Demote an admin to contributor role

**⚠️ Safeguards:**
- Cannot demote yourself
- Cannot demote the last admin
- All role changes are logged in audit trail

```bash
curl -X POST http://localhost:8000/auth/users/2/demote \
  -H "Authorization: Bearer admin_token"
```

### `GET /auth/admin/audit-logs`

View audit logs for compliance and security tracking

**Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 50)
- `action`: Filter by action type
- `resource_type`: Filter by resource type
- `user_id`: Filter by user ID

```bash
curl "http://localhost:8000/auth/admin/audit-logs?page=1&per_page=20&action=PROMOTE_USER" \
  -H "Authorization: Bearer admin_token"
```

**Response:**
```json
{
  "audit_logs": [
    {
      "id": 1,
      "user_id": 1,
      "action": "PROMOTE_USER",
      "resource_type": "user",
      "resource_id": 2,
      "description": "Promoted user johndoe to admin",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 5,
    "per_page": 20,
    "total": 95,
    "has_next": true,
    "has_prev": false
  }
}
```

### `GET /auth/admin/system-stats`

Get system statistics and health metrics

```bash
curl http://localhost:8000/auth/admin/system-stats \
  -H "Authorization: Bearer admin_token"
```

**Response:**
```json
{
  "users": {
    "total": 25,
    "active": 23,
    "admins": 3,
    "contributors": 20,
    "github_authenticated": 22,
    "recent_logins_7d": 15
  },
  "audit": {
    "total_logs": 1250,
    "recent_logs_7d": 87
  },
  "generated_at": "2024-01-15T10:30:00Z"
}
```

## 🔒 RBAC Access Control

### Admin Role Capabilities
- ✅ **Full CRUD** on all entities (vendors, products, methods, setup guides)
- ✅ **User management** (promote, demote, create, delete users)
- ✅ **System administration** (view audit logs, system stats)
- ✅ **Bulk operations** (import/export data)
- ✅ **Access all endpoints** without ownership restrictions

### Contributor Role Capabilities
- ✅ **Read access** to all public data (vendors, products, methods, setup guides)
- ✅ **CRUD access** only on records they created (`created_by = user.id`)
- ❌ **Cannot** manage other users or access admin endpoints
- ❌ **Cannot** perform system administration tasks
- ✅ **Can** update their own profile information

### Ownership-Based Access Control

All entities now include a `created_by` field that tracks ownership:

```sql
-- Example: Products table with ownership
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    vendor_id INTEGER REFERENCES vendors(id),
    created_by INTEGER REFERENCES users(id),  -- Ownership tracking
    -- ... other fields
);
```

**Access Rules:**
- **Admins**: Can access any record regardless of `created_by`
- **Contributors**: Can only access records where `created_by = current_user.id`

## 🎯 Frontend Integration

### Role-Based UI Restrictions

The React frontend automatically adapts based on user role:

```javascript
// Example: Role-based component rendering
const AdminPanel = () => {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return <div>Access Denied: Admin privileges required</div>;
  }
  
  return (
    <div>
      <UserManagement />
      <SystemStats />
      <AuditLogs />
    </div>
  );
};
```

### GitHub OAuth Button

```javascript
// Login component with GitHub OAuth
const Login = () => {
  const handleGitHubLogin = () => {
    window.location.href = '/auth/github/login?redirect_uri=' + 
      encodeURIComponent(window.location.origin + '/auth/callback');
  };
  
  return (
    <div>
      <button onClick={handleGitHubLogin} className="github-login-btn">
        🐙 Login with GitHub
      </button>
    </div>
  );
};
```

## 🔍 Error Handling

### Common HTTP Status Codes

| Status | Description | Example |
|--------|-------------|---------|
| `200` | Success | Authentication successful |
| `400` | Bad Request | Missing required parameters |
| `401` | Unauthorized | Invalid or expired token |
| `403` | Forbidden | Insufficient permissions (role-based) |
| `404` | Not Found | User or resource not found |
| `409` | Conflict | Email/username already exists |
| `422` | Unprocessable Entity | Validation failed |
| `500` | Internal Server Error | Server-side error |

### Error Response Format

```json
{
  "error": "AUTHORIZATION_ERROR",
  "message": "Admin access required",
  "details": {
    "required_role": "admin",
    "current_role": "contributor"
  }
}
```

## 🛡️ Security Features

### GitHub OAuth Configuration
- **HTTPS enforced** in production
- **Verified email required** from GitHub
- **State parameter** for CSRF protection
- **Proper scopes** requested (`user:email`)

### JWT Token Security
- **Short-lived access tokens** (15 minutes)
- **Longer-lived refresh tokens** (7 days)
- **Secure HTTP-only cookies** option available
- **Token blacklisting** on logout

### Audit Logging
All sensitive actions are logged:
- User role changes (promote/demote)
- Admin operations
- Authentication events
- CRUD operations on sensitive resources

### Rate Limiting
- **Authentication endpoints**: 5 requests/minute
- **API endpoints**: 100 requests/minute per user
- **Admin endpoints**: 50 requests/minute per admin

## 🧪 Testing the API

### Authentication Flow Test

```bash
# 1. Check health
curl http://localhost:8000/health

# 2. Initiate GitHub OAuth (copy the authorization_url and visit in browser)
curl http://localhost:8000/auth/github/login

# 3. After GitHub authorization, you'll be redirected with a code
# Use that code in callback (replace YOUR_CODE)
curl "http://localhost:8000/auth/github/callback?code=YOUR_CODE"

# 4. Use the returned access_token for authenticated requests
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Admin Operations Test

```bash
# List all users (admin only)
curl http://localhost:8000/auth/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Promote a user (admin only)
curl -X POST http://localhost:8000/auth/users/2/promote \
  -H "Authorization: Bearer ADMIN_TOKEN"

# View audit logs (admin only)
curl http://localhost:8000/auth/admin/audit-logs \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 📊 Swagger/OpenAPI Documentation

The complete API documentation is available at:
- **Interactive Docs**: http://localhost:8000/apidocs/
- **OpenAPI Schema**: http://localhost:8000/apispec_1.json

The Swagger UI includes:
- ✅ Complete endpoint documentation
- ✅ Request/response schemas
- ✅ Authentication examples
- ✅ Role-based access indicators
- ✅ Try-it-out functionality

## 🔧 Configuration

### Environment Variables

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# RBAC Configuration
DEFAULT_ROLE=contributor
ADMIN_BOOTSTRAP_EMAIL=admin@example.com

# JWT Configuration
JWT_SECRET_KEY=your_super_secret_jwt_key
JWT_ACCESS_TOKEN_EXPIRES=900  # 15 minutes
JWT_REFRESH_TOKEN_EXPIRES=604800  # 7 days

# Security
ENABLE_LEGACY_AUTH=true  # Set to false to disable username/password
REQUIRE_EMAIL_VERIFICATION=false
ENABLE_AUDIT_LOGGING=true
```

This comprehensive RBAC system provides enterprise-grade authentication and authorization while maintaining ease of use through GitHub OAuth integration.