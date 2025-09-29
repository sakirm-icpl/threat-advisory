# API Endpoints Reference

This document provides a comprehensive reference for all VersionIntel API endpoints. The API follows RESTful conventions and uses JSON for request/response format.

## Base URL

```
http://your-server-ip:8000
```

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### GitHub OAuth Flow

1. **Initiate OAuth**: Redirect to `/auth/github/login`
2. **Callback Handling**: GitHub redirects to frontend with code
3. **Token Exchange**: Frontend exchanges code for JWT token
4. **API Access**: Include JWT token in Authorization header

## API Endpoints

### Authentication Endpoints

#### `POST /auth/login`
Legacy username/password login (deprecated - use GitHub OAuth instead)

#### `GET /auth/github/login`
Initiate GitHub OAuth login

#### `GET /auth/github/callback`
Handle GitHub OAuth callback

#### `POST /auth/refresh`
Refresh access token

#### `GET /auth/me`
Get current user profile

#### `PUT /auth/me`
Update current user profile

#### `POST /auth/me/change-password`
Change current user password

### User Management Endpoints (Admin Only)

#### `POST /auth/users`
Create new user

#### `GET /auth/users`
List all users

#### `POST /auth/users/{user_id}/promote`
Promote user to admin role

#### `POST /auth/users/{user_id}/demote`
Demote admin to contributor role

#### `DELETE /auth/users/{user_id}`
Delete user

#### `POST /auth/users/{user_id}/reset-password`
Reset user password

#### `GET /auth/admin/audit-logs`
Get audit logs

#### `GET /auth/admin/system-stats`
Get system statistics

### Dashboard Endpoints

#### `GET /dashboard/summary`
Get dashboard summary statistics

#### `GET /dashboard/recent-activity`
Get recent activity

### Vendor Endpoints

#### `POST /vendors`
Create new vendor

#### `GET /vendors`
List all vendors

#### `GET /vendors/{vendor_id}`
Get specific vendor

#### `PUT /vendors/{vendor_id}`
Update vendor

#### `DELETE /vendors/{vendor_id}`
Delete vendor

### Product Endpoints

#### `POST /products`
Create new product

#### `GET /products`
List products (optional vendor_id filter)

#### `GET /products/{product_id}`
Get specific product

#### `PUT /products/{product_id}`
Update product

#### `DELETE /products/{product_id}`
Delete product

### Detection Method Endpoints

#### `POST /methods`
Create new detection method

#### `GET /methods`
List detection methods (optional product_id and requires_auth filters)

#### `GET /methods/{method_id}`
Get specific detection method

#### `PUT /methods/{method_id}`
Update detection method

#### `DELETE /methods/{method_id}`
Delete detection method

### Setup Guide Endpoints

#### `POST /setup-guides`
Create new setup guide

#### `GET /setup-guides`
List setup guides (optional product_id filter)

#### `GET /setup-guides/{guide_id}`
Get specific setup guide

#### `PUT /setup-guides/{guide_id}`
Update setup guide

#### `DELETE /setup-guides/{guide_id}`
Delete setup guide

### Search Endpoints

#### `GET /search`
Unified search across all entities

#### `POST /search/advanced`
Advanced search with filters

#### `GET /search/cve/vendor-product`
Search for CVEs by vendor and product

#### `GET /search/cve/keyword`
Search for CVEs by keyword

### CVE Endpoints

#### `GET /api/cve/search/unified`
Unified search for CVEs by vendor, product, or CVE ID

#### `GET /api/cve/search/vendor`
Search for CVEs by vendor only

#### `GET /api/cve/search/vendor-product`
Search for CVEs by vendor and product name

#### `GET /api/cve/search/keyword`
Search for CVEs by keyword

#### `GET /api/cve/recent`
Get recent CVEs from the last N days

#### `GET /api/cve/stats`
Get CVE statistics and summary information

#### `GET /api/cve/details/{cve_id}`
Get detailed information for a specific CVE

#### `GET /api/cve/ai/remediation/{cve_id}`
Generate remediation and patching guidance for a CVE via LLM

### Bulk Operations Endpoints (Admin Only)

#### `POST /bulk/import-preview`
Preview what will be imported or replaced

#### `POST /bulk/import`
Import data from JSON

#### `GET /bulk/export`
Export all data as JSON

#### `GET /bulk/export-all`
Export all data in hierarchical format

#### `GET /bulk/export-vendor/{vendor_id}`
Export specific vendor data

#### `GET /bulk/export-product/{product_id}`
Export specific product data

#### `GET /bulk/export-all-complete`
Export all data in complete format with full relationships

### Regex Testing Endpoints

#### `POST /regex-test`
Test regular expressions against sample text

## Request/Response Format

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

### Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-09-27T10:30:00Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2025-09-27T10:30:00Z"
}
```

## Pagination

Large result sets are paginated using query parameters:

```
GET /api/products?page=2&per_page=50&sort=name&order=asc
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "per_page": 50,
      "total": 1250,
      "pages": 25,
      "has_prev": true,
      "has_next": true,
      "prev_num": 1,
      "next_num": 3
    }
  }
}
```

## Rate Limiting

API requests are rate-limited to ensure fair usage:

- **Anonymous users**: 100 requests/hour
- **Authenticated users**: 1000 requests/hour
- **Admin users**: 5000 requests/hour

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1695741000
```

## Error Handling

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_REQUIRED` | Authentication required |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `EXTERNAL_SERVICE_ERROR` | External service integration failed |
| `DATABASE_ERROR` | Database operation failed |

## Interactive Documentation

Swagger/OpenAPI documentation is available at:
```
http://your-server-ip:8000/apidocs/
```

### Swagger UI Features
- Interactive API testing
- Request/response examples
- Schema definitions
- Authentication testing

### OpenAPI Specification

Download the OpenAPI specification:
```
GET /api/openapi.json
```