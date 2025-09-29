# API Error Handling

This document describes how the VersionIntel API handles errors and the standard error response formats.

## Error Response Format

All API errors follow a consistent response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "field_name",
      "issue": "specific_issue_description"
    }
  },
  "timestamp": "2025-09-27T10:30:00Z"
}
```

### Error Fields

- **success**: Always false for error responses
- **error**: Object containing error details
  - **code**: Machine-readable error code
  - **message**: Human-readable error message
  - **details**: Optional additional details about the error
- **timestamp**: ISO 8601 timestamp when the error occurred

## HTTP Status Codes

The API uses standard HTTP status codes to indicate the result of requests:

| Status Code | Description | Usage |
|-------------|-------------|-------|
| 200 | OK | Successful GET, PUT requests |
| 201 | Created | Successful POST requests |
| 204 | No Content | Successful DELETE requests |
| 400 | Bad Request | Invalid request data or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Requested resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side errors |
| 503 | Service Unavailable | External service unavailable |

## Common Error Codes

### Authentication Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | No authentication token provided |
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `USER_NOT_FOUND` | 404 | Authenticated user not found in database |

### Validation Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Request data failed validation |
| `MISSING_REQUIRED_FIELD` | 400 | Required field is missing |
| `INVALID_FIELD_FORMAT` | 400 | Field value has invalid format |

### Resource Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `RESOURCE_CONFLICT` | 409 | Resource already exists |
| `INVALID_RESOURCE_ID` | 400 | Resource ID format is invalid |

### Rate Limiting Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests in time period |

### External Service Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `EXTERNAL_SERVICE_ERROR` | 503 | External service (GitHub, NVD, AI) unavailable |
| `GITHUB_API_ERROR` | 503 | GitHub API error |
| `NVD_API_ERROR` | 503 | NVD API error |
| `AI_SERVICE_ERROR` | 503 | AI service error |

## Validation Error Details

When validation fails, the error response includes detailed information about which fields failed validation:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "name",
        "issue": "Name is required"
      },
      {
        "field": "email",
        "issue": "Invalid email format"
      }
    ]
  },
  "timestamp": "2025-09-27T10:30:00Z"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Anonymous users**: 100 requests/hour
- **Authenticated users**: 1000 requests/hour
- **Admin users**: 5000 requests/hour

### Rate Limit Headers

All responses include rate limit information in headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1695741000
```

### Rate Limit Error Response

When rate limit is exceeded:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again later.",
    "details": {
      "reset_time": "2025-09-27T11:00:00Z"
    }
  },
  "timestamp": "2025-09-27T10:30:00Z"
}
```

## Client Error Handling

### Recommended Client Implementation

```javascript
// Example error handling in JavaScript
try {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    switch (error.error.code) {
      case 'VALIDATION_ERROR':
        // Handle validation errors
        displayValidationErrors(error.error.details);
        break;
      case 'AUTHENTICATION_REQUIRED':
        // Redirect to login
        redirectToLogin();
        break;
      case 'INSUFFICIENT_PERMISSIONS':
        // Show permission denied message
        showPermissionDenied();
        break;
      default:
        // Show generic error message
        showErrorMessage(error.error.message);
    }
    return;
  }
  
  const data = await response.json();
  // Handle successful response
} catch (error) {
  // Handle network errors
  showNetworkError();
}
```

## Troubleshooting

### Common Issues and Solutions

1. **401 Unauthorized**
   - Ensure JWT token is included in Authorization header
   - Check if token has expired (refresh if needed)
   - Verify token was obtained from successful authentication

2. **403 Forbidden**
   - Check user role and permissions
   - Contact administrator for role changes if needed

3. **422 Validation Error**
   - Check request data against API documentation
   - Ensure all required fields are provided
   - Validate field formats (email, URLs, etc.)

4. **500 Internal Server Error**
   - Check server logs for detailed error information
   - Report issue to development team with request details

5. **503 Service Unavailable**
   - External service (GitHub, NVD, AI) may be temporarily down
   - Retry request after a short delay
   - Check service status pages for known issues

### Debugging Tips

1. **Check Request Format**
   - Verify Content-Type header is set correctly
   - Ensure request body is valid JSON
   - Check field names and data types

2. **Verify Authentication**
   - Confirm JWT token is valid and not expired
   - Check if user has required permissions
   - Test with admin user if permission issues occur

3. **Review API Documentation**
   - Confirm endpoint URL is correct
   - Check required parameters and request format
   - Verify user has appropriate role for operation

4. **Use API Documentation UI**
   - Test requests using Swagger UI at `/apidocs/`
   - Compare working requests with failing ones
   - Check response examples for expected format