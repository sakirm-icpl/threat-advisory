# VersionIntel Deployment Configuration Guide

This guide explains how to configure and deploy VersionIntel on different servers by simply changing the server IP and other configuration parameters.

## Quick Start

### For Linux/Mac
```bash
# 1. Copy environment template
cp env.example .env

# 2. Edit .env file with your server configuration
nano .env

# 3. Run deployment
./deploy-linux.sh
```

### For Windows
```batch
REM 1. Copy environment template
copy env.example .env

REM 2. Edit .env file with your server configuration
notepad .env

REM 3. Run deployment
deploy-windows.bat
```

## Configuration Parameters

### Required Configuration Changes

When deploying to a new server, you MUST update these parameters in the `.env` file:

#### 1. Server Configuration
```bash
# Change this to your server's IP address or domain
SERVER_HOST=172.17.14.65  # Replace with your server IP
```

#### 2. GitHub OAuth Configuration
```bash
# GitHub OAuth App credentials (create at: https://github.com/settings/developers)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://172.17.14.65:3000/auth/github/callback  # Update IP
```

#### 3. CORS Configuration
```bash
# Update CORS origins with your server IP
CORS_ORIGINS=http://172.17.14.65:3000,http://172.17.14.65:8000  # Update IP
```

#### 4. Security Keys
```bash
# Generate secure random keys
SECRET_KEY=your-very-secure-secret-key-here
JWT_SECRET_KEY=your-very-secure-jwt-secret-key-here
```

### Optional Configuration

#### Database Configuration
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres  # Change for production
POSTGRES_DB=versionintel
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

#### Port Configuration
```bash
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

#### AI Configuration
```bash
AI_PROVIDER=gemini
GOOGLE_API_KEY=your-google-api-key  # Optional but recommended
GOOGLE_MODEL=gemini-1.5-flash
```

#### NVD API Configuration
```bash
NVD_API_KEY=your-nvd-api-key  # Optional for higher rate limits
```

## Step-by-Step Server Migration

### 1. Prepare New Server

Ensure the following are installed on your target server:
- Docker (latest version)
- Docker Compose (latest version)
- Git

### 2. Clone Repository
```bash
git clone <your-repository-url>
cd versionintel
```

### 3. Configure Environment

#### Copy Template
```bash
cp env.example .env
```

#### Update Configuration
Edit `.env` file and update these critical settings:

1. **SERVER_HOST**: Your server's IP address or domain name
2. **GITHUB_CLIENT_ID** and **GITHUB_CLIENT_SECRET**: Your GitHub OAuth app credentials
3. **GITHUB_REDIRECT_URI**: Update with your server IP
4. **CORS_ORIGINS**: Update with your server IP
5. **SECRET_KEY** and **JWT_SECRET_KEY**: Generate secure random keys

#### Example Configuration for Server 192.168.1.100:
```bash
SERVER_HOST=192.168.1.100
GITHUB_CLIENT_ID=Iv23liB8Lv7RvC9iOhXz
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://192.168.1.100:3000/auth/github/callback
CORS_ORIGINS=http://192.168.1.100:3000,http://192.168.1.100:8000
SECRET_KEY=your-very-secure-secret-key-here
JWT_SECRET_KEY=your-very-secure-jwt-secret-key-here
```

### 4. Update GitHub OAuth App Settings

In your GitHub OAuth app settings (https://github.com/settings/developers):

1. **Homepage URL**: `http://your-server-ip:3000`
2. **Authorization callback URL**: `http://your-server-ip:3000/auth/github/callback`

### 5. Deploy Application

#### Linux/Mac:
```bash
./deploy-linux.sh
```

#### Windows:
```batch
deploy-windows.bat
```

### 6. Verify Deployment

After deployment, verify these URLs work:
- Frontend: `http://your-server-ip:3000`
- Backend API: `http://your-server-ip:8000`
- API Documentation: `http://your-server-ip:8000/apidocs/`
- Health Check: `http://your-server-ip:8000/health`

## Troubleshooting

### Common Issues

#### 1. Docker Permission Issues
```bash
# Linux: Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

#### 2. Port Already in Use
```bash
# Check what's using the port
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :8000

# Kill processes using the ports if needed
sudo kill -9 <PID>
```

#### 3. GitHub OAuth Issues
- Verify GitHub OAuth app settings match your server IP
- Check GITHUB_REDIRECT_URI in .env matches OAuth app callback URL
- Ensure CORS_ORIGINS includes your frontend URL

#### 4. Database Connection Issues
```bash
# Check if database container is running
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Deployment Scripts Features

#### Linux Script (deploy-linux.sh)
- Colored output for better readability
- Comprehensive error checking
- Automatic Docker cleanup
- Environment validation
- Service health checks

#### Windows Script (deploy-windows.bat)
- Windows-compatible commands
- Error handling with pause statements
- Automatic Docker cleanup
- Environment validation
- Service status verification

## Security Considerations

### Production Deployment

For production environments, update these settings:

```bash
# Environment
FLASK_ENV=production
FLASK_DEBUG=0

# Database
POSTGRES_PASSWORD=your-very-secure-password

# Security Keys (generate with openssl rand -hex 32)
SECRET_KEY=very-long-secure-random-string
JWT_SECRET_KEY=another-very-long-secure-random-string
```

### Firewall Configuration

Ensure these ports are open on your server:
- Port 3000: Frontend access
- Port 8000: Backend API access
- Port 5432: PostgreSQL (only if external access needed)

### SSL/HTTPS Setup

For production, consider setting up SSL/HTTPS:
1. Obtain SSL certificate
2. Configure reverse proxy (nginx/apache)
3. Update URLs in .env to use https://
4. Update GitHub OAuth app URLs to use https://

## Monitoring and Maintenance

### Useful Commands

```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update and redeploy
git pull
./deploy-linux.sh  # or deploy-windows.bat
```

### Backup and Recovery

```bash
# Backup database
docker-compose exec db pg_dump -U postgres versionintel > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres versionintel < backup.sql
```

This configuration guide ensures smooth deployment across different servers with minimal configuration changes.