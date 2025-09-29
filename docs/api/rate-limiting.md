# API Rate Limiting

This document describes the rate limiting policies and mechanisms implemented in the VersionIntel API.

## Overview

Rate limiting is implemented to ensure fair usage of the API, prevent abuse, and maintain service availability for all users. Different rate limits apply based on user authentication status and role.

## Rate Limit Policies

### Anonymous Users
- **Limit**: 100 requests per hour
- **Applies to**: All endpoints accessed without authentication
- **Purpose**: Prevent abuse of public endpoints

### Authenticated Users
- **Limit**: 1000 requests per hour
- **Applies to**: All endpoints accessed with valid JWT token
- **Purpose**: Provide adequate access for normal usage while preventing abuse

### Admin Users
- **Limit**: 5000 requests per hour
- **Applies to**: All endpoints accessed by admin users
- **Purpose**: Allow administrative operations and integrations

## Rate Limit Headers

All API responses include rate limit information in the following headers:

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Limit` | Maximum number of requests allowed in the current window | `1000` |
| `X-RateLimit-Remaining` | Number of requests remaining in the current window | `999` |
| `X-RateLimit-Reset` | Unix timestamp when the rate limit window resets | `1695741000` |

## Rate Limit Response

When a rate limit is exceeded, the API returns a 429 (Too Many Requests) status code with the following response:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again later.",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "reset_time": "2025-09-27T11:00:00Z"
    }
  },
  "timestamp": "2025-09-27T10:30:00Z"
}
```

## Rate Limit Window

Rate limits are applied using a sliding window algorithm with the following durations:

- **Hourly Window**: Rate limits reset every hour (3600 seconds)
- **Daily Window**: Some administrative endpoints may have daily limits

## Endpoint-Specific Limits

Some endpoints have stricter rate limits due to resource constraints or external service limitations:

### CVE Search Endpoints
- **Limit**: 100 requests per hour per user
- **Endpoints**: 
  - `/api/cve/search/*`
  - `/search/cve/*`

### AI Remediation Endpoints
- **Limit**: 50 requests per hour per user
- **Endpoints**:
  - `/api/cve/ai/remediation/*`

### Bulk Operations
- **Limit**: 10 requests per hour per user
- **Endpoints**:
  - `/bulk/*`

## Implementation Details

### Rate Limiting Algorithm

VersionIntel uses a token bucket algorithm for rate limiting:

1. Each user has a token bucket with a maximum capacity equal to their rate limit
2. Tokens are added to the bucket at a fixed rate (e.g., 1000 tokens per hour for authenticated users)
3. Each request consumes one token from the bucket
4. If the bucket is empty, requests are rejected with a 429 status

### Storage

Rate limit data is stored in memory for performance, with periodic persistence to ensure consistency across application instances in containerized deployments.

### IP-Based Rate Limiting

For anonymous requests, rate limits are applied per IP address to prevent abuse.

## Client Implementation Guidelines

### Checking Rate Limits

Clients should always check rate limit headers to avoid exceeding limits:

```javascript
const response = await fetch('/api/products');
const limit = response.headers.get('X-RateLimit-Limit');
const remaining = response.headers.get('X-RateLimit-Remaining');
const reset = response.headers.get('X-RateLimit-Reset');

console.log(`Rate limit: ${remaining}/${limit}, resets at ${new Date(reset * 1000)}`);
```

### Handling Rate Limit Errors

Implement exponential backoff when encountering rate limit errors:

```javascript
async function makeRequestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        if (i === maxRetries) throw new Error('Rate limit exceeded');
        
        // Get reset time from header
        const resetTime = response.headers.get('X-RateLimit-Reset');
        const waitTime = Math.max(0, (resetTime * 1000) - Date.now()) + 1000;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, waitTime * Math.pow(2, i)));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### Proactive Rate Limit Management

Monitor remaining requests and proactively pause operations when limits are low:

```javascript
class RateLimitAwareClient {
  constructor() {
    this.remaining = Infinity;
    this.resetTime = 0;
  }
  
  async makeRequest(url, options) {
    // Check if we're close to rate limit
    if (this.remaining < 10) {
      const waitTime = Math.max(0, this.resetTime - Date.now());
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    const response = await fetch(url, options);
    
    // Update rate limit info
    this.remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
    this.resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0') * 1000;
    
    return response;
  }
}
```

## Monitoring and Logging

Rate limit events are logged for monitoring and abuse detection:

- Exceeded rate limits
- Suspicious request patterns
- IP addresses with repeated violations

Administrators can view rate limit statistics in the admin dashboard.

## Abuse Prevention

### Automatic Blocking

IP addresses that repeatedly exceed rate limits may be temporarily blocked:

- **First violation**: Warning logged
- **Second violation**: 1 hour block
- **Third violation**: 24 hour block
- **Subsequent violations**: Permanent block (requires admin intervention)

### Exception Requests

Legitimate use cases requiring higher rate limits can request exceptions by contacting administrators.

## Troubleshooting

### Common Issues

1. **Unexpected Rate Limit Errors**
   - Check if multiple applications are sharing the same IP
   - Verify authentication tokens are valid
   - Contact administrators if limits seem incorrect

2. **Rate Limit Reset Time Issues**
   - Reset times are in Unix timestamp format
   - Account for time zone differences in client applications

3. **Inconsistent Rate Limits**
   - Rate limits are per-instance in containerized deployments
   - Load balancing may cause apparent inconsistencies

### Debugging Rate Limits

Administrators can check rate limit status for specific users or IPs through the admin API:

```bash
# Check rate limit for a specific user
GET /admin/rate-limit/user/{user_id}

# Check rate limit for a specific IP
GET /admin/rate-limit/ip/{ip_address}
```

## Configuration

Rate limits can be configured through environment variables:

```bash
# Rate limits
ANONYMOUS_RATE_LIMIT=100
AUTHENTICATED_RATE_LIMIT=1000
ADMIN_RATE_LIMIT=5000

# Endpoint-specific limits
CVE_SEARCH_RATE_LIMIT=100
AI_REMEDIATION_RATE_LIMIT=50
BULK_OPERATION_RATE_LIMIT=10
```

## Future Improvements

Planned enhancements to rate limiting include:

- Per-endpoint configurable limits
- Webhook notifications for rate limit violations
- Dashboard visualization of rate limit usage
- Adaptive rate limiting based on system load