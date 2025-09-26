import os

class Config:
    # Basic Flask configuration
    SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@db:5432/versionintel")  # Supports both Docker and local
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwtsecretkey")
    JWT_ACCESS_TOKEN_EXPIRES = False  # Tokens don't expire for simplicity
    
    # GitHub OAuth configuration
    GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET", "")
    GITHUB_REDIRECT_URI = os.environ.get("GITHUB_REDIRECT_URI", "http://localhost:3000/auth/github/callback")
    
    # Security configuration
    ENFORCE_HTTPS = os.environ.get("ENFORCE_HTTPS", "false").lower() == "true"
    SESSION_COOKIE_SECURE = ENFORCE_HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # CORS configuration - Allow common development and production origins
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://0.0.0.0:3000",
        "http://0.0.0.0:8000",
        "http://172.17.14.65:3000",
        "http://172.17.14.65:8000",
        "https://versionintel.yourdomain.com",  # Add your production domain
    ]
    
    # RBAC Configuration
    DEFAULT_ROLE = "contributor"  # New users get contributor role by default
    ADMIN_BOOTSTRAP_EMAIL = os.environ.get("ADMIN_BOOTSTRAP_EMAIL", "admin@example.com")
    
    # Audit logging configuration
    AUDIT_LOG_RETENTION_DAYS = int(os.environ.get("AUDIT_LOG_RETENTION_DAYS", "365"))
    ENABLE_AUDIT_LOGGING = os.environ.get("ENABLE_AUDIT_LOGGING", "true").lower() == "true"
    
    # Rate limiting configuration
    RATELIMIT_STORAGE_URL = os.environ.get("REDIS_URL", "memory://")
    RATELIMIT_DEFAULT = "100 per hour"
    RATELIMIT_HEADERS_ENABLED = True
    
    # Feature flags
    ENABLE_LEGACY_AUTH = os.environ.get("ENABLE_LEGACY_AUTH", "true").lower() == "true"
    REQUIRE_EMAIL_VERIFICATION = os.environ.get("REQUIRE_EMAIL_VERIFICATION", "false").lower() == "true"
    
    # Swagger configuration
    SWAGGER = {
        "title": "VersionIntel API",
        "uiversion": 3,
        "info": {
            "title": "VersionIntel API",
            "description": "Version Detection Research Platform with GitHub OAuth and RBAC",
            "version": "2.0.0",
            "contact": {
                "name": "VersionIntel Team",
                "email": "support@versionintel.com"
            },
            "license": {
                "name": "MIT",
                "url": "https://opensource.org/licenses/MIT"
            }
        },
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'"
            }
        },
        "security": [
            {
                "Bearer": []
            }
        ],
        "host": "localhost:8000",
        "basePath": "/",
        "schemes": ["http", "https"],
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "tags": [
            {
                "name": "Authentication",
                "description": "GitHub OAuth and JWT authentication endpoints"
            },
            {
                "name": "Admin",
                "description": "Admin-only endpoints for user and system management"
            },
            {
                "name": "Vendors",
                "description": "Vendor management operations"
            },
            {
                "name": "Products",
                "description": "Product management operations"
            },
            {
                "name": "Methods",
                "description": "Detection method management operations"
            },
            {
                "name": "Setup Guides",
                "description": "Setup guide management operations"
            },
            {
                "name": "CVE",
                "description": "CVE integration and search operations"
            },
            {
                "name": "Bulk Operations",
                "description": "Import/export and bulk operations"
            }
        ]
    }
    
    # Security headers
    SECURITY_HEADERS = {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }

    # Development settings (only use when explicitly set)
    FLASK_ENV = os.environ.get('FLASK_ENV', 'production')
    FLASK_DEBUG = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
