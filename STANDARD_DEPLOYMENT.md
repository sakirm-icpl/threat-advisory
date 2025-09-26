# VersionIntel Standard Deployment Guide

## 🎯 Overview

This guide explains how to deploy VersionIntel using proper environment variable management, following security best practices. All sensitive configuration is externalized to `.env` files rather than being hardcoded in the docker-compose file.

## 🏗️ Environment Variable Management

### Key Principles

1. **No Hardcoded Secrets**: All sensitive data is stored in `.env` files
2. **Configuration Externalization**: All configurable settings are in environment variables
3. **Environment Separation**: Different environments use different `.env` files
4. **Security by Default**: Sensitive data never committed to version control

### Environment Variables Structure

The deployment uses a single `.env` file at the root of the project that contains all configuration for all services:

```
.env                    # Main environment file (not committed)
env.example            # Template showing required variables
```

## 📁 File Structure

```
versionintel/
├── .env               # Your environment configuration (NOT COMMITTED)
├── env.example        # Template for environment variables
├── docker-compose.yml # Services configuration (uses .env)
├── deploy.sh          # Linux/Mac deployment script
├── deploy.bat         # Windows deployment script
└── ...
```

## ⚙️ Environment Variables Reference

### Database Configuration
```bash
# Database credentials
POSTGRES_USER=versionintel
POSTGRES_PASSWORD=A8k9mW2xVz7nQ3hR5tY8uP1
POSTGRES_DB=versionintel

# Database connection settings
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

### Security Configuration
```bash
# Application secrets (MUST BE CHANGED IN PRODUCTION)
SECRET_KEY=f2396f2c6c33c2bbd04bfdab89e05ab7ef7ca3087ea1107bfce9986d933c81d9
JWT_SECRET_KEY=219f5a91b1c116abeeca9a54a8420c50fd29bec2f1d58c24251e9f28661602a2
```

### Server Configuration
```bash
# Server hostname/IP
SERVER_HOST=172.17.14.65

# Port configuration
BACKEND_PORT=8000
FRONTEND_PORT=3000

# CORS settings
CORS_ORIGINS=http://172.17.14.65:3000,http://172.17.14.65:8000
```

### Application Settings
```bash
# Flask configuration
FLASK_ENV=production
FLASK_DEBUG=0
```

### GitHub OAuth Configuration
```bash
# OAuth credentials (get from GitHub Developer Settings)
GITHUB_CLIENT_ID=Iv23liB8Lv7RvC9iOhXz
GITHUB_CLIENT_SECRET=5fe963232ffef021cb88424b7ef828649d33422f
GITHUB_REDIRECT_URI=http://172.17.14.65:3000/auth/github/callback
```

### AI Services Configuration
```bash
# Google AI (Gemini) configuration
AI_PROVIDER=gemini
GOOGLE_API_KEY=AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA
GOOGLE_MODEL=gemini-2.0-flash
```

### Optional Services
```bash
# NVD API for CVE data (optional)
NVD_API_KEY=
```

## 🚀 Deployment Process

### 1. Prepare Environment File

Copy the example file and customize it:

```bash
# Copy template
cp env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

### 2. Verify Environment Variables

Check that all required variables are set:

```bash
# Linux/Mac
cat .env

# Windows
type .env
```

### 3. Run Deployment

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows:**
```cmd
deploy.bat
```

## 🔧 Deployment Scripts Functionality

### Clean Deployment Process

The deployment scripts perform these steps:

1. **Load Environment Variables**: Read configuration from `.env` file
2. **Clean Docker Resources**: Remove all existing containers, images, volumes, networks
3. **Build Services**: Create fresh Docker images using current code
4. **Start Services**: Launch containers with environment variables
5. **Verify Deployment**: Check service health and display access information

### Environment Variable Loading

**Linux/Mac (`deploy.sh`):**
```bash
# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | xargs)
    echo "✅ Environment variables loaded from .env file"
fi
```

**Windows (`deploy.bat`):**
```batch
REM Load environment variables
if exist ".env" (
    for /f "tokens=*" %%i in ('type .env') do (
        set "%%i"
    )
    echo SUCCESS: Environment variables loaded from .env file
)
```

## 🐳 Docker Compose Configuration

The `docker-compose.yml` file uses environment variables extensively:

### Database Service
```yaml
db:
  env_file:
    - .env
  environment:
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    POSTGRES_DB: ${POSTGRES_DB}
```

### Backend Service
```yaml
backend:
  env_file:
    - .env
  environment:
    - FLASK_ENV=${FLASK_ENV:-production}
    - SECRET_KEY=${SECRET_KEY}
    - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432}/${POSTGRES_DB}
    # ... other variables
```

### Frontend Service
```yaml
frontend:
  env_file:
    - .env
  environment:
    - REACT_APP_API_URL=http://${SERVER_HOST:-localhost}:${BACKEND_PORT:-8000}
    - REACT_APP_GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
```

## 🔐 Security Best Practices

### 1. Never Commit Secrets
- `.env` file is in `.gitignore`
- Only `env.example` is committed (without real values)
- All team members create their own `.env` file

### 2. Strong Secret Generation
Generate secure secrets for production:

```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"

# Generate JWT_SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Environment-Specific Configuration
Create different `.env` files for different environments:

```bash
.env.development    # Development settings
.env.staging        # Staging settings
.env.production     # Production settings
```

## 🌍 Production Deployment

### 1. Secure Environment File
```bash
# Create production environment file
cp env.example .env.production
# Edit with production values
```

### 2. Set Proper Permissions
```bash
# Restrict access to environment file
chmod 600 .env.production
```

### 3. Configure Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Enable SSL/TLS
Use Let's Encrypt or similar service to enable HTTPS.

## 🔄 Updating Configuration

### Modify Environment Variables
1. Edit `.env` file
2. Restart services:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Add New Variables
1. Add to `env.example` (as template)
2. Add to `.env` (with actual values)
3. Update `docker-compose.yml` to use the new variables
4. Redeploy services

## 📊 Monitoring Environment Variables

### View Current Variables
```bash
# View all environment variables in a container
docker-compose exec backend env

# View specific variable
docker-compose exec backend printenv SECRET_KEY
```

### Debug Configuration Issues
```bash
# Check if .env file is loaded
docker-compose config

# View effective configuration
docker-compose config --services
```

## 🚨 Troubleshooting

### Common Issues

**Environment Variables Not Loaded**
- Check `.env` file exists and is readable
- Verify variable names match between `.env` and `docker-compose.yml`
- Ensure no spaces around `=` in `.env` file

**Database Connection Issues**
- Verify `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` are correct
- Check `POSTGRES_HOST` matches service name in docker-compose
- Ensure database service is healthy

**GitHub OAuth Not Working**
- Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- Check `GITHUB_REDIRECT_URI` matches GitHub app configuration
- Ensure `SERVER_HOST` is accessible from internet

### Reset and Retry
If configuration issues occur:
```bash
# Clean deployment
./deploy.sh  # Linux/Mac
# OR
deploy.bat   # Windows
```

## 📈 Best Practices Summary

### ✅ DO
- Store all configuration in `.env` files
- Use descriptive variable names
- Provide defaults with `${VAR:-default}` syntax
- Document all variables in `env.example`
- Use strong, randomly generated secrets
- Restrict permissions on `.env` files

### ❌ DON'T
- Hardcode secrets in `docker-compose.yml`
- Commit `.env` files to version control
- Use weak or predictable secrets
- Share `.env` files between environments
- Use production secrets in development

## 🛠️ Advanced Configuration

### Multiple Environment Files
```bash
# Load specific environment
docker-compose --env-file .env.production up -d
```

### Override Variables
```bash
# Override specific variables
SECRET_KEY=custom_key docker-compose up -d
```

### Conditional Configuration
Use variable substitution with defaults:
```yaml
# In docker-compose.yml
environment:
  - FLASK_ENV=${FLASK_ENV:-development}
  - DEBUG=${FLASK_DEBUG:-0}
```

---

*"Security is not a product, but a process." - Bruce Schneier*

This standard deployment approach ensures VersionIntel can be securely deployed in any environment while maintaining configuration flexibility and security best practices.