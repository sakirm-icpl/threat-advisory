import os

class Config:
    # Basic Flask configuration
    SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey")
    
    # Build DATABASE_URL from components
    POSTGRES_USER = os.environ.get("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB = os.environ.get("POSTGRES_DB", "versionintel")
    POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "db")
    POSTGRES_PORT = os.environ.get("POSTGRES_PORT", "5432")
    
    # Debug logging for database configuration
    print(f"[CONFIG] POSTGRES_USER: {POSTGRES_USER}")
    print(f"[CONFIG] POSTGRES_PASSWORD: {'*' * len(POSTGRES_PASSWORD) if POSTGRES_PASSWORD else 'None'}")
    print(f"[CONFIG] POSTGRES_DB: {POSTGRES_DB}")
    print(f"[CONFIG] POSTGRES_HOST: {POSTGRES_HOST}")
    
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", 
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )
    
    print(f"[CONFIG] Final DATABASE_URI: {SQLALCHEMY_DATABASE_URI[:50]}...")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwtsecretkey")
    JWT_ACCESS_TOKEN_EXPIRES = False  # Tokens don't expire for simplicity
    
    # GitHub OAuth configuration
    GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET")
    GITHUB_REDIRECT_URI = os.environ.get("GITHUB_REDIRECT_URI", "http://localhost:3000/auth/github/callback")
    
    # CORS configuration - Allow common development and production origins
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://0.0.0.0:3000",
        "http://0.0.0.0:8000",
        "http://172.17.14.65:3000",
        "http://172.17.14.65:8000"
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

