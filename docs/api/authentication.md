# API Authentication

This document describes the authentication mechanisms used in the VersionIntel API.

## Authentication Methods

VersionIntel supports two authentication methods:

1. **GitHub OAuth** (Recommended) - Primary authentication method
2. **Legacy Username/Password** (Deprecated) - For backward compatibility only

## GitHub OAuth Authentication

GitHub OAuth is the primary and recommended authentication method. It provides secure authentication using GitHub credentials.

### OAuth Flow

1. **Initiate Authentication**: Client requests `/auth/github/login`
2. **Redirect to GitHub**: Server returns GitHub OAuth URL
3. **User Authorization**: User authenticates with GitHub
4. **Callback**: GitHub redirects to `/auth/github/callback` with authorization code
5. **Token Exchange**: Server exchanges code for access token
6. **User Creation/Update**: Server creates or updates user record
7. **JWT Generation**: Server generates JWT tokens
8. **Client Usage**: Client uses JWT for subsequent API requests

### Initiate GitHub OAuth

```
GET /auth/github/login
```

Response:
```json
{
  "authorization_url": "https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&state=...",
  "state": "random_state_string"
}
```

### Handle OAuth Callback

```
GET /auth/github/callback?code=AUTH_CODE&state=STATE
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "github_id": "12345678",
    "github_username": "username",
    "email": "user@example.com",
    "role": "admin",
    "avatar_url": "https://avatars.githubusercontent.com/u/12345678?v=4"
  }
}
```

### Using JWT Tokens

Include the JWT token in the Authorization header for all authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refresh Token

Use the refresh token to obtain a new access token when it expires:

```
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

Response:
```json
{
  "access_token": "new_access_token_here"
}
```

## JWT Token Structure

JWT tokens contain the following claims:

```json
{
  "user_id": 123,
  "github_id": "12345678",
  "github_username": "username",
  "email": "user@example.com",
  "role": "admin",
  "exp": 1695823800,
  "iat": 1695737400
}
```

### Claims Explanation

- **user_id**: Internal user ID in VersionIntel
- **github_id**: GitHub user ID
- **github_username**: GitHub username
- **email**: User's email address
- **role**: User role (admin or contributor)
- **exp**: Expiration timestamp
- **iat**: Issued at timestamp

## User Roles and Permissions

### Admin Role

Admin users have full access to all API endpoints, including:
- User management
- System administration
- Audit logs
- Bulk operations

### Contributor Role

Contributor users have limited access to:
- Product management
- Vendor management
- Detection methods
- Setup guides

## Legacy Username/Password Authentication (Deprecated)

For backward compatibility, the API still supports username/password authentication, but this method is deprecated and should not be used for new implementations.

### Login

```
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@1234"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

## Security Considerations

### Token Storage

- Store JWT tokens securely (e.g., HTTP-only cookies)
- Never store tokens in localStorage or sessionStorage
- Use secure transport (HTTPS) for all API communications

### Token Expiration

- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Implement automatic token refresh in client applications

### CSRF Protection

The OAuth flow includes CSRF protection using state parameters. Always validate the state parameter in the callback.

## Troubleshooting

### Common Authentication Errors

| Error | HTTP Status | Description | Solution |
|-------|-------------|-------------|----------|
| Invalid token | 401 | JWT token is missing, invalid, or expired | Obtain a new token |
| Insufficient permissions | 403 | User lacks required role/permissions | Contact administrator |
| OAuth error | 400 | GitHub OAuth flow failed | Retry authentication |
| User not found | 404 | User account doesn't exist | Contact administrator |

### Rate Limiting

Authentication endpoints are subject to rate limiting:
- 10 login attempts per hour per IP address
- 100 OAuth initiations per hour per user

Exceeding these limits will result in a 429 (Too Many Requests) response.