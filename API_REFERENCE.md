# VersionIntel API Reference

Complete API documentation for VersionIntel backend services.

## Base URL

```
http://localhost:8000
```

## Authentication

VersionIntel uses JWT (JSON Web Token) authentication.

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@1234"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

### Using Authentication
Include the JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

## Core Endpoints

### Health Check
```http
GET /health
```
Returns service health status.

### Metrics
```http
GET /metrics
```
Returns Prometheus metrics for monitoring.

## Vendor Management

### List Vendors
```http
GET /api/vendors
```

### Create Vendor
```http
POST /api/vendors
Content-Type: application/json

{
  "name": "Microsoft",
  "description": "Microsoft Corporation"
}
```

### Get Vendor
```http
GET /api/vendors/{id}
```

### Update Vendor
```http
PUT /api/vendors/{id}
Content-Type: application/json

{
  "name": "Microsoft Corp",
  "description": "Updated description"
}
```

### Delete Vendor
```http
DELETE /api/vendors/{id}
```

## Product Management

### List Products
```http
GET /api/products
```

### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "Windows Server",
  "vendor_id": 1,
  "category": "Operating System",
  "description": "Microsoft Windows Server"
}
```

### Get Product
```http
GET /api/products/{id}
```

### Update Product
```http
PUT /api/products/{id}
Content-Type: application/json

{
  "name": "Windows Server 2022",
  "category": "OS",
  "description": "Updated description"
}
```

### Delete Product
```http
DELETE /api/products/{id}
```

## Detection Methods

### List Methods
```http
GET /api/methods
```

### Create Method
```http
POST /api/methods
Content-Type: application/json

{
  "product_id": 1,
  "method_type": "banner_grab",
  "detection_logic": "Server: Microsoft-IIS/10.0",
  "python_regex": "Server: Microsoft-IIS/([0-9.]+)",
  "ruby_regex": "Server: Microsoft-IIS/([0-9.]+)",
  "authentication_required": false,
  "setup_instructions": "Connect to port 80 and check HTTP headers"
}
```

### Get Method
```http
GET /api/methods/{id}
```

### Update Method
```http
PUT /api/methods/{id}
```

### Delete Method
```http
DELETE /api/methods/{id}
```

## CVE Integration

### Search CVEs
```http
GET /api/cve/search?query=windows&limit=10
```

### Get CVE Details
```http
GET /api/cve/{cve_id}
```

**Example:**
```http
GET /api/cve/CVE-2023-1234
```

## Data Management

### Export Data
```http
GET /api/export?format=json
GET /api/export?format=csv
GET /api/export?format=pdf
```

### Import Data
```http
POST /api/import
Content-Type: multipart/form-data

file: <your-data-file>
format: json|csv
```

### Backup Database
```http
POST /api/backup
```

### Restore Database
```http
POST /api/restore
Content-Type: multipart/form-data

backup_file: <backup-file>
```

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Interactive Documentation

For interactive API testing, visit:
```
http://localhost:8000/docs
```

This provides a Swagger UI interface for testing all endpoints.

## SDK Examples

### Python Example
```python
import requests

# Login
response = requests.post('http://localhost:8000/auth/login', json={
    'username': 'admin',
    'password': 'Admin@1234'
})
token = response.json()['access_token']

# Use API
headers = {'Authorization': f'Bearer {token}'}
vendors = requests.get('http://localhost:8000/api/vendors', headers=headers)
print(vendors.json())
```

### JavaScript Example
```javascript
// Login
const loginResponse = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'Admin@1234'
  })
});
const { access_token } = await loginResponse.json();

// Use API
const vendorsResponse = await fetch('http://localhost:8000/api/vendors', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const vendors = await vendorsResponse.json();
console.log(vendors);
```

## Support

For API support:
1. Check the interactive documentation at `/docs`
2. Review error messages and status codes
3. Verify authentication tokens are valid
4. Ensure request format matches the specification