# VersionIntel API Documentation

Complete API reference for VersionIntel backend services.

## 📋 Table of Contents

1. [Base Information](#base-information)
2. [Authentication](#authentication)
3. [Health & Monitoring](#health--monitoring)
4. [Vendor Management](#vendor-management)
5. [Product Management](#product-management)
6. [Detection Methods](#detection-methods)
7. [CVE Integration](#cve-integration)
8. [Setup Guides](#setup-guides)
9. [User Management](#user-management)
10. [Bulk Operations](#bulk-operations)
11. [Error Handling](#error-handling)

## 🌐 Base Information

### Base URL
```
http://localhost:8000
```

### Content Type
All requests should include:
```
Content-Type: application/json
```

### Response Format
All responses follow this structure:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "total_results": 0,
  "page": 1,
  "per_page": 20
}
```

## 🔐 Authentication

VersionIntel uses **GitHub OAuth 2.0** as the primary authentication method with JWT tokens.

### GitHub OAuth Login (Recommended)

**Step 1: Initiate OAuth**
```http
GET /auth/github/login?redirect_uri=http://localhost:3000/auth/callback
```

**Step 2: Handle Callback**
```http
GET /auth/github/callback?code=oauth_authorization_code
```

**Response:**
```json
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

### Legacy Username/Password Login

**⚠️ Deprecated but available for backward compatibility**

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@1234"
}
```

### Using Authentication
Include the JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

### Token Refresh
```http
POST /auth/refresh
Authorization: Bearer <your-refresh-token>
```

## 🛡️ Role-Based Access Control (RBAC)

VersionIntel implements a 2-role RBAC system:

### **Admin Role**
- ✅ Full CRUD access to all entities
- ✅ User management (promote/demote contributors)
- ✅ System administration (audit logs, stats)
- ✅ Bulk operations

### **Contributor Role** (Default for new GitHub users)
- ✅ Read access to all public data
- ✅ CRUD access only to records they created (`created_by = user.id`)
- ❌ Cannot manage users or access admin endpoints

### Admin-Only Endpoints

#### List Users
```http
GET /auth/users
Authorization: Bearer <admin-token>
```

#### Promote User to Admin
```http
POST /auth/users/{user_id}/promote
Authorization: Bearer <admin-token>
```

#### Demote Admin to Contributor
```http
POST /auth/users/{user_id}/demote
Authorization: Bearer <admin-token>
```

#### View Audit Logs
```http
GET /auth/admin/audit-logs?page=1&per_page=50
Authorization: Bearer <admin-token>
```

#### System Statistics
```http
GET /auth/admin/system-stats
Authorization: Bearer <admin-token>
```

## 🏥 Health & Monitoring

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "nvd_api": "available"
  }
}
```

### Metrics
```http
GET /metrics
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "total_vendors": 150,
  "total_products": 1250,
  "total_methods": 890,
  "total_cves": 25000,
  "api_requests_today": 1250,
  "system_uptime": "7 days"
}
```

## 🏢 Vendor Management

### List Vendors
```http
GET /api/vendors
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `search` (optional): Search term for vendor name
- `sort_by` (optional): Sort field (name, created_at, updated_at)
- `sort_order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Apache Software Foundation",
      "description": "Open source software foundation",
      "website": "https://apache.org",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "product_count": 25
    }
  ],
  "total_results": 150,
  "page": 1,
  "per_page": 20
}
```

### Create Vendor
```http
POST /api/vendors
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Microsoft Corporation",
  "description": "Technology company",
  "website": "https://microsoft.com"
}
```

### Get Vendor
```http
GET /api/vendors/{id}
Authorization: Bearer <your-jwt-token>
```

### Update Vendor
```http
PUT /api/vendors/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Microsoft Corp",
  "description": "Updated description",
  "website": "https://microsoft.com"
}
```

### Delete Vendor
```http
DELETE /api/vendors/{id}
Authorization: Bearer <your-jwt-token>
```

## 📦 Product Management

### List Products
```http
GET /api/products
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `search` (optional): Search term for product name
- `vendor_id` (optional): Filter by vendor ID
- `category` (optional): Filter by category
- `sort_by` (optional): Sort field (name, vendor, created_at)
- `sort_order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Apache HTTP Server",
      "vendor_id": 1,
      "vendor_name": "Apache Software Foundation",
      "category": "Web Server",
      "description": "Popular web server software",
      "website": "https://httpd.apache.org",
      "latest_version": "2.4.57",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "method_count": 5
    }
  ],
  "total_results": 1250,
  "page": 1,
  "per_page": 20
}
```

### Create Product
```http
POST /api/products
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Apache Tomcat",
  "vendor_id": 1,
  "category": "Application Server",
  "description": "Java servlet container",
  "website": "https://tomcat.apache.org",
  "latest_version": "10.1.0"
}
```

### Get Product
```http
GET /api/products/{id}
Authorization: Bearer <your-jwt-token>
```

### Update Product
```http
PUT /api/products/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Apache Tomcat",
  "category": "Application Server",
  "description": "Updated description",
  "latest_version": "10.1.1"
}
```

### Delete Product
```http
DELETE /api/products/{id}
Authorization: Bearer <your-jwt-token>
```

## 🔍 Detection Methods

### List Detection Methods
```http
GET /api/methods
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `product_id` (optional): Filter by product ID
- `method_type` (optional): Filter by method type (banner, regex, api)
- `sort_by` (optional): Sort field (name, product, created_at)
- `sort_order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "HTTP Banner Detection",
      "product_id": 1,
      "product_name": "Apache HTTP Server",
      "method_type": "banner",
      "description": "Detect version from HTTP server header",
      "python_regex": "Server: Apache/([0-9.]+)",
      "ruby_regex": "Server: Apache/([0-9.]+)",
      "sample_output": "Server: Apache/2.4.57 (Unix)",
      "authentication_required": false,
      "port": 80,
      "protocol": "http",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total_results": 890,
  "page": 1,
  "per_page": 20
}
```

### Create Detection Method
```http
POST /api/methods
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "SSH Banner Detection",
  "product_id": 2,
  "method_type": "banner",
  "description": "Detect version from SSH banner",
  "python_regex": "SSH-2.0-OpenSSH_([0-9.]+)",
  "ruby_regex": "SSH-2.0-OpenSSH_([0-9.]+)",
  "sample_output": "SSH-2.0-OpenSSH_8.9p1",
  "authentication_required": false,
  "port": 22,
  "protocol": "ssh"
}
```

### Get Detection Method
```http
GET /api/methods/{id}
Authorization: Bearer <your-jwt-token>
```

### Update Detection Method
```http
PUT /api/methods/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Updated SSH Banner Detection",
  "description": "Updated description",
  "python_regex": "SSH-2.0-OpenSSH_([0-9.]+)",
  "sample_output": "SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1"
}
```

### Delete Detection Method
```http
DELETE /api/methods/{id}
Authorization: Bearer <your-jwt-token>
```

### Test Regex Pattern
```http
POST /api/methods/test-regex
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "python_regex": "Server: Apache/([0-9.]+)",
  "ruby_regex": "Server: Apache/([0-9.]+)",
  "sample_output": "Server: Apache/2.4.57 (Unix)",
  "expected_version": "2.4.57"
}
```

**Response:**
```json
{
  "success": true,
  "python_match": true,
  "ruby_match": true,
  "extracted_version": "2.4.57",
  "matches_expected": true
}
```

## 🛡️ CVE Integration

### Unified CVE Search
```http
GET /api/cve/search/unified
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `query` (required): Search query (CVE ID, vendor, product, or keyword)
- `limit` (optional): Number of results (default: 20, max: 100)
- `start_index` (optional): Starting index for pagination (default: 0)

**Examples:**
```bash
# Search by CVE ID
GET /api/cve/search/unified?query=CVE-2023-1234

# Search by vendor
GET /api/cve/search/unified?query=apache

# Search by vendor and product (explicit format)
GET /api/cve/search/unified?query=Ethereum@Go Ethereum

# Search by vendor and product (legacy format)
GET /api/cve/search/unified?query=apache tomcat

# Search by keyword
GET /api/cve/search/unified?query=remote code execution
```

**Response:**
```json
{
  "success": true,
  "search_type": "vendor_product",
  "search_params": {
    "vendor": "apache",
    "product": "tomcat",
    "method": "cpe_search"
  },
  "total_results": 45,
  "results": [
    {
      "id": "CVE-2023-1234",
      "description": "Apache Tomcat vulnerability description...",
      "severity": "HIGH",
      "cvss_score": 8.5,
      "published_date": "2023-01-01T00:00:00Z",
      "last_modified_date": "2023-01-15T00:00:00Z",
      "vendors_products": [
        {
          "vendor": "apache",
          "product": "tomcat",
          "version": "10.1.0"
        }
      ],
      "references": [
        {
          "url": "https://nvd.nist.gov/vuln/detail/CVE-2023-1234",
          "source": "NVD"
        }
      ]
    }
  ]
}
```

### Vendor-Only CVE Search
```http
GET /api/cve/search/vendor
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `vendor` (required): Vendor name
- `limit` (optional): Number of results (default: 20)
- `start_index` (optional): Starting index for pagination (default: 0)

### Vendor + Product CVE Search
```http
GET /api/cve/search/vendor-product
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `vendor` (required): Vendor name
- `product` (required): Product name
- `limit` (optional): Number of results (default: 20)
- `start_index` (optional): Starting index for pagination (default: 0)

### Keyword CVE Search
```http
GET /api/cve/search/keyword
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `keyword` (required): Search keyword
- `limit` (optional): Number of results (default: 20)
- `start_index` (optional): Starting index for pagination (default: 0)

### Get CVE Details
```http
GET /api/cve/{cve_id}
Authorization: Bearer <your-jwt-token>
```

## 📚 Setup Guides

### List Setup Guides
```http
GET /api/setup-guides
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `product_id` (optional): Filter by product ID
- `sort_by` (optional): Sort field (title, product, created_at)
- `sort_order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Apache HTTP Server Setup Guide",
      "product_id": 1,
      "product_name": "Apache HTTP Server",
      "content": "# Apache HTTP Server Setup\n\n## Prerequisites\n- Ubuntu 20.04+\n- Docker installed\n\n## Installation Steps\n1. Pull the image...",
      "docker_image": "httpd:2.4",
      "vm_requirements": "2GB RAM, 10GB storage",
      "estimated_time": "30 minutes",
      "difficulty": "beginner",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total_results": 150,
  "page": 1,
  "per_page": 20
}
```

### Create Setup Guide
```http
POST /api/setup-guides
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Nginx Setup Guide",
  "product_id": 3,
  "content": "# Nginx Setup Guide\n\n## Prerequisites\n- Ubuntu 20.04+\n\n## Installation\n1. Update system...",
  "docker_image": "nginx:latest",
  "vm_requirements": "1GB RAM, 5GB storage",
  "estimated_time": "20 minutes",
  "difficulty": "beginner"
}
```

### Get Setup Guide
```http
GET /api/setup-guides/{id}
Authorization: Bearer <your-jwt-token>
```

### Update Setup Guide
```http
PUT /api/setup-guides/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Updated Nginx Setup Guide",
  "content": "# Updated Nginx Setup Guide\n\n## New content...",
  "estimated_time": "25 minutes"
}
```

### Delete Setup Guide
```http
DELETE /api/setup-guides/{id}
Authorization: Bearer <your-jwt-token>
```

## 👥 User Management

### List Users
```http
GET /api/users
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `search` (optional): Search term for username or email
- `role` (optional): Filter by role (admin, user)
- `sort_by` (optional): Sort field (username, email, created_at)
- `sort_order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "last_login": "2024-01-15T10:30:00Z"
    }
  ],
  "total_results": 25,
  "page": 1,
  "per_page": 20
}
```

### Create User
```http
POST /api/users
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "user"
}
```

### Get User
```http
GET /api/users/{id}
Authorization: Bearer <your-jwt-token>
```

### Update User
```http
PUT /api/users/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "email": "updated@example.com",
  "role": "admin",
  "is_active": true
}
```

### Delete User
```http
DELETE /api/users/{id}
Authorization: Bearer <your-jwt-token>
```

### Change Password
```http
POST /api/users/{id}/change-password
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "current_password": "oldpassword",
  "new_password": "newsecurepassword123"
}
```

## 📦 Bulk Operations

### Export Data
```http
GET /api/export
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `format` (required): Export format (json, csv, docx, pdf)
- `type` (required): Data type (vendors, products, methods, all)
- `filters` (optional): JSON string of filters

**Examples:**
```bash
# Export all vendors as JSON
GET /api/export?format=json&type=vendors

# Export products as CSV
GET /api/export?format=csv&type=products

# Export all data as PDF
GET /api/export?format=pdf&type=all
```

### Import Data
```http
POST /api/import
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data

{
  "file": <file>,
  "type": "vendors",
  "overwrite": false
}
```

**Response:**
```json
{
  "success": true,
  "imported_count": 25,
  "skipped_count": 5,
  "errors": [
    {
      "row": 3,
      "error": "Vendor name already exists"
    }
  ]
}
```

### Bulk Delete
```http
POST /api/bulk-delete
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "type": "vendors",
  "ids": [1, 2, 3, 4, 5]
}
```

## ❌ Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "name": ["Name is required"],
      "email": ["Invalid email format"]
    }
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTHENTICATION_ERROR` | Invalid or missing authentication | 401 |
| `AUTHORIZATION_ERROR` | Insufficient permissions | 403 |
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT` | Resource conflict (e.g., duplicate) | 409 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

### Rate Limiting
- **Authentication endpoints**: 5 requests per minute
- **API endpoints**: 100 requests per minute per user
- **CVE search**: 50 requests per minute per user

### Pagination
All list endpoints support pagination with these parameters:
- `page`: Page number (starts from 1)
- `per_page`: Items per page (max 100)

**Response headers:**
```
X-Total-Count: 150
X-Page: 1
X-Per-Page: 20
X-Total-Pages: 8
```

## 🔧 Development

### API Versioning
Current API version: v1
- Base URL: `/api/v1/` (optional, defaults to `/api/`)
- Version header: `X-API-Version: 1`

### Testing
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test authentication
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@1234"}'

# Test protected endpoint
curl http://localhost:8000/api/vendors \
  -H "Authorization: Bearer <your-token>"
```

### SDK Examples
```python
import requests

# Base configuration
BASE_URL = "http://localhost:8000"
TOKEN = "your-jwt-token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Get vendors
response = requests.get(f"{BASE_URL}/api/vendors", headers=headers)
vendors = response.json()["data"]

# Create vendor
vendor_data = {
    "name": "New Vendor",
    "description": "Vendor description"
}
response = requests.post(f"{BASE_URL}/api/vendors", 
                        headers=headers, json=vendor_data)
```

```javascript
// JavaScript/Node.js example
const axios = require('axios');

const API_BASE = 'http://localhost:8000';
const TOKEN = 'your-jwt-token';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
    }
});

// Get vendors
const getVendors = async () => {
    const response = await api.get('/api/vendors');
    return response.data.data;
};

// Create vendor
const createVendor = async (vendorData) => {
    const response = await api.post('/api/vendors', vendorData);
    return response.data;
};
``` 