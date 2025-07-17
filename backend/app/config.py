import os

class Config:
    # Basic Flask configuration
    SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/versionintel")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwtsecretkey")
    JWT_ACCESS_TOKEN_EXPIRES = False  # Tokens don't expire for simplicity
    
    # CORS configuration - Allow common development and production origins
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://0.0.0.0:3000",
        "http://0.0.0.0:8000"
    ]
    
    # Swagger configuration
    SWAGGER = {
        "title": "VersionIntel API",
        "uiversion": 3,
        "info": {
            "title": "VersionIntel API",
            "description": "API for Version Detection Research Platform",
            "version": "1.0.0"
        }
    }
    
    # Security headers
    SECURITY_HEADERS = {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }