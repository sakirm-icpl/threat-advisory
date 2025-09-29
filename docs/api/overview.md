# API Overview

The VersionIntel API provides a comprehensive RESTful interface for version detection, vulnerability analysis, and user management. This document provides an overview of the API architecture, authentication, and core concepts.

## Base URL

```
http://your-server-ip:8000
```

## API Architecture

### RESTful Design Principles

The VersionIntel API follows RESTful conventions:

- **Resources**: Represent entities like users, products, vendors
- **HTTP Methods**: Standard methods (GET, POST, PUT, DELETE)
- **Status Codes**: Meaningful HTTP status codes
- **JSON**: Request and response format

### API Versioning

Currently, the API is version 1.0. Future versions will be accessible via URL path:

```
/api/v1/...  (current)
/api/v2/...  (future)
```

## Core Resources

### 1. Authentication
- `/auth/github` - GitHub OAuth authentication
- `/auth/token` - JWT token management
- `/auth/logout` - User logout

### 2. Users
- `/users` - User management (admin only)
- `/users/{id}` - Specific user operations
- `/profile` - Current user profile

### 3. Products
- `/products` - Product catalog
- `/products/{id}` - Specific product details
- `/products/search` - Product search

### 4. Vendors
- `/vendors` - Vendor listing
- `/vendors/{id}` - Vendor details

### 5. Detection Methods
- `/methods` - Version detection methods
- `/methods/{id}` - Specific method details

### 6. Setup Guides
- `/setup-guides` - Installation guides
- `/setup-guides/{id}` - Specific guide

### 7. CVE Data
- `/cve/search` - CVE vulnerability search
- `/cve/{id}` - Specific CVE details

### 8. Bulk Operations
- `/bulk/products` - Bulk product operations
- `/bulk/vendors` - Bulk vendor operations

## Request/Response Format

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

### Response Format
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

## Authentication

### GitHub OAuth Flow

1. **Initiate OAuth**: Redirect to `/auth/github`
2. **Callback Handling**: GitHub redirects to frontend with code
3. **Token Exchange**: Frontend exchanges code for JWT token
4. **API Access**: Include JWT token in Authorization header

### JWT Token Structure

```json
{
  "user_id": 123,
  "github_id": "12345678",
  "github_username": "username",
  "email": "user@example.com",
  "role": "ADMIN",
  "exp": 1695823800,
  "iat": 1695737400
}
```

### Token Usage

```http
GET /api/products
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Pagination

Large result sets are paginated using query parameters:

```http
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

## Filtering and Search

### Query Parameters
```http
GET /api/products?name=apache&version=2.4&vendor_id=1
```

### Search Endpoints
```http
GET /api/search?q=apache&type=product
GET /api/products/search?query=web server
```

### Advanced Filtering
```json
POST /api/products/filter
{
  "filters": {
    "name": {"operator": "contains", "value": "apache"},
    "version": {"operator": "gte", "value": "2.0"},
    "created_at": {"operator": "between", "value": ["2024-01-01", "2024-12-31"]}
  },
  "sort": [{"field": "name", "direction": "asc"}],
  "pagination": {"page": 1, "per_page": 20}
}
```

## Rate Limiting

API requests are rate-limited to ensure fair usage:

- **Anonymous users**: 100 requests/hour
- **Authenticated users**: 1000 requests/hour
- **Admin users**: 5000 requests/hour

### Rate Limit Headers
```http
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

## Content Types

### Supported Content Types
- `application/json` (default)
- `multipart/form-data` (file uploads)
- `application/x-www-form-urlencoded` (form submissions)

### File Upload
```http
POST /api/import/products
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="products.csv"
Content-Type: text/csv

...
```

## CORS Support

Cross-Origin Resource Sharing (CORS) is enabled for web applications:

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

## WebSocket Support (Future)

Real-time updates will be available via WebSocket connections:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

## API Documentation

### Interactive Documentation

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
```http
GET /api/openapi.json
```

## SDK and Client Libraries

### JavaScript/TypeScript
```bash
npm install @versionintel/api-client
```

```javascript
import { VersionIntelAPI } from '@versionintel/api-client';

const api = new VersionIntelAPI({
  baseURL: 'http://localhost:8000',
  token: 'your-jwt-token'
});

const products = await api.products.list();
```

### Python
```bash
pip install versionintel-api
```

```python
from versionintel_api import VersionIntelAPI

api = VersionIntelAPI(
    base_url='http://localhost:8000',
    token='your-jwt-token'
)

products = api.products.list()
```

### cURL Examples
```bash
# Get products
curl -H "Authorization: Bearer <token>" \
     http://localhost:8000/api/products

# Create product
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"name": "Apache", "version": "2.4.41"}' \
     http://localhost:8000/api/products
```

## Detailed Endpoints Reference

For a complete reference of all API endpoints, see the [Endpoints Reference](./endpoints.md) document.

## Testing the API

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-27T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "github_oauth": "healthy",
    "gemini_ai": "healthy"
  }
}
```

### API Test Collection

Postman collection available for download:
```http
GET /api/postman-collection.json
```

This API overview provides the foundation for integrating with VersionIntel's backend services. For detailed endpoint documentation, see the [Endpoints Reference](./endpoints.md).