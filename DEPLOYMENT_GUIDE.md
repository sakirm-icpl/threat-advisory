# VersionIntel Clean Deployment Guide

## 🎯 Overview

This guide explains how to deploy VersionIntel with a completely clean state, removing all existing Docker resources and starting fresh. This is the recommended approach for production deployments or when you want to ensure a clean slate.

## 🚀 Deployment Scripts

VersionIntel provides two deployment scripts for clean deployments:

### Windows
```cmd
deploy.bat
```

### Linux/Mac
```bash
./deploy.sh
```

## 🧹 What the Clean Deployment Does

The deployment scripts perform the following actions:

1. **Verify Docker Installation**
   - Checks that Docker and Docker Compose are installed
   - Ensures Docker daemon is running

2. **Clean All Docker Resources**
   - Stops all running containers
   - Removes all containers
   - Removes all images
   - Removes all volumes
   - Removes all networks
   - Prunes the entire Docker system

3. **Prepare Environment**
   - Creates/updates frontend environment file
   - Sets proper API URLs

4. **Build and Deploy**
   - Builds fresh backend and frontend images
   - Starts all services with clean state

## ▶️ Running Clean Deployment

### Prerequisites
- Docker Desktop (Windows) or Docker Engine (Linux/Mac)
- Docker Compose
- Git (to clone repository)

### Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd versionintel
   ```

2. **Run Deployment Script**

   **Windows:**
   ```cmd
   deploy.bat
   ```

   **Linux/Mac:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/apidocs/

## 🔧 Manual Clean Deployment

If you prefer to manually clean and deploy, follow these steps:

### 1. Clean Docker Resources
```bash
# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q)

# Remove all volumes
docker volume rm $(docker volume ls -q)

# Remove all networks
docker network rm $(docker network ls -q)

# Prune system
docker system prune -a -f

# Prune volumes
docker volume prune -f
```

### 2. Prepare Environment
```bash
# Create frontend .env if it doesn't exist
echo "REACT_APP_API_URL=http://localhost:8000" > frontend/.env
echo "REACT_APP_GITHUB_CLIENT_ID=Ov23licijFemPDL32cZK" >> frontend/.env
```

### 3. Build and Deploy
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Wait for services to be ready
sleep 30

# Check status
docker-compose ps
```

## 🔐 Default Credentials

After deployment, use these credentials to log in:

- **Username**: `admin`
- **Password**: `Admin@1234`

⚠️ **Important**: Change the default admin password immediately after first login!

## 🛠️ Configuration

### Environment Variables

The deployment scripts automatically configure these environment variables:

**Backend:**
- `FLASK_ENV=production`
- `SECRET_KEY` (auto-generated for clean deployment)
- `JWT_SECRET_KEY` (auto-generated for clean deployment)
- `DATABASE_URL=postgresql://postgres:postgres@db:5432/versionintel`

**Frontend:**
- `REACT_APP_API_URL=http://localhost:8000`

### Customizing Configuration

To customize the deployment:

1. Edit `docker-compose.yml` to change:
   - Passwords
   - Ports
   - Resource limits
   - Environment variables

2. Update `frontend/.env` to change:
   - API URL
   - GitHub Client ID

## 📊 Monitoring Deployment

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Health Checks
- Backend: http://localhost:8000/health
- Frontend: http://localhost:3000
- Metrics: http://localhost:8000/metrics

## 🚨 Troubleshooting

### Common Issues

**Docker Not Running**
- Ensure Docker Desktop is started (Windows)
- Start Docker service (Linux/Mac)

**Port Conflicts**
- Stop services using ports 3000/8000/5432
- Modify ports in `docker-compose.yml`

**Permission Denied**
- Run as administrator (Windows)
- Use `sudo` (Linux/Mac)
- Set execute permissions: `chmod +x deploy.sh`

**Build Failures**
- Check internet connection
- Verify Docker has enough resources
- Clear Docker cache: `docker system prune -a -f`

### Reset and Retry
If deployment fails, you can reset and try again:
```bash
# Clean everything
docker system prune -a -f
docker volume prune -f

# Run deployment again
./deploy.sh  # Linux/Mac
# OR
deploy.bat   # Windows
```

## 🏭 Production Deployment

For production deployments, make these additional changes:

### 1. Secure Environment Variables
```yaml
# In docker-compose.yml
environment:
  - SECRET_KEY=your-very-secure-secret-key-here
  - JWT_SECRET_KEY=your-very-secure-jwt-secret-here
  - POSTGRES_PASSWORD=your-secure-database-password
```

### 2. Configure SSL/TLS
- Set up reverse proxy (Nginx/Apache)
- Configure SSL certificates
- Update `REACT_APP_API_URL` to use HTTPS

### 3. Resource Limits
```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

### 4. Backup Strategy
```bash
#!/bin/bash
# Create automated backup script
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db pg_dump -U postgres versionintel > backup_$DATE.sql
```

## 📈 Performance Considerations

### Resource Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 2GB free space minimum

### Optimization Tips
- Use Docker volume for database persistence
- Monitor resource usage with `docker stats`
- Scale services as needed

## 🔄 Updating Deployment

To update an existing deployment:

1. **Pull latest changes**
   ```bash
   git pull
   ```

2. **Run clean deployment**
   ```bash
   ./deploy.sh  # Linux/Mac
   # OR
   deploy.bat   # Windows
   ```

⚠️ **Note**: Clean deployment will remove all existing data. For production updates, use standard deployment without cleaning.

## 🆘 Support

If you encounter issues:

1. Check service logs: `docker-compose logs -f`
2. Verify Docker installation and running status
3. Ensure ports 3000, 8000, and 5432 are available
4. Review the troubleshooting section above

For persistent issues, please provide:
- Error messages
- Docker version (`docker --version`)
- Operating system information
- Steps to reproduce the issue

---

*"A clean deployment is the best deployment."*

This clean deployment approach ensures VersionIntel starts with a fresh, consistent state, eliminating potential issues from previous deployments.