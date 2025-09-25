# 🚀 VersionIntel Complete Deployment Guide

## 📋 Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows with WSL2
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Memory**: Minimum 2GB RAM, Recommended 4GB+
- **Storage**: Minimum 5GB free disk space

### Required Accounts
- **GitHub Account**: For OAuth authentication setup
- **Google Cloud Account**: (Optional) For AI features

## 🔧 Pre-Deployment Setup

### 1. GitHub OAuth Application Setup (REQUIRED)

GitHub OAuth is mandatory for user authentication. Follow these steps:

1. **Go to GitHub Developer Settings**
   ```
   https://github.com/settings/developers
   ```

2. **Create New OAuth App**
   - Click "New OAuth App"
   - Fill in the details:
     - **Application name**: `VersionIntel`
     - **Homepage URL**: `http://YOUR_SERVER_IP:3000`
     - **Authorization callback URL**: `http://YOUR_SERVER_IP:3000/auth/github/callback`

3. **Get Credentials**
   - Copy the **Client ID**
   - Generate and copy the **Client Secret**

### 2. Google AI Setup (Optional)

For AI-powered features:

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Create/Select Project**
   - Create new project or select existing
   - Enable "Generative AI API"

3. **Create API Key**
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the generated API key

## 🛠️ Deployment Steps

### Step 1: Clone Repository
```bash
# Clone the repository
git clone <repository-url>
cd versionintel

# Make scripts executable
chmod +x deploy.sh
chmod +x generate-secrets.sh
```

### Step 2: Generate Configuration
```bash
# Option A: Generate secure secrets automatically
./generate-secrets.sh > .env

# Option B: Copy template and edit manually
cp .env.template .env
nano .env
```

### Step 3: Configure Environment

Edit the `.env` file with your settings:

```bash
# Required Settings
SERVER_HOST=172.17.14.65          # Replace with your server IP
GITHUB_CLIENT_ID=your_client_id   # From GitHub OAuth setup
GITHUB_CLIENT_SECRET=your_secret  # From GitHub OAuth setup

# Optional Settings  
GOOGLE_API_KEY=your_api_key       # For AI features
```

**Important**: Update `SERVER_HOST` and `CORS_ORIGINS` with your actual server IP or domain.

### Step 4: Deploy Application
```bash
# Deploy with one command
./deploy.sh
```

The deployment script will:
- ✅ Validate configuration
- ✅ Stop existing containers
- ✅ Build fresh Docker images
- ✅ Start all services
- ✅ Perform health checks

### Step 5: Verify Deployment

Check that all services are running:
```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://YOUR_SERVER_IP:8000/health
curl http://YOUR_SERVER_IP:3000
```

## 🔐 Post-Deployment Setup

### 1. First Admin User

Since there's no default admin user, you need to:

1. **Login with GitHub**
   - Visit `http://YOUR_SERVER_IP:3000`
   - Click "Sign in with GitHub"
   - Complete OAuth flow

2. **Grant Admin Privileges**
   ```bash
   # Connect to database
   docker-compose exec db psql -U versionintel
   
   # Grant admin role to your GitHub username
   UPDATE users SET role='admin' WHERE github_username='your-github-username';
   \q
   ```

### 2. Security Checklist

- [ ] Updated `SERVER_HOST` in `.env`
- [ ] Updated `CORS_ORIGINS` in `.env`
- [ ] Generated strong secrets (32+ characters)
- [ ] GitHub OAuth configured with correct URLs
- [ ] Admin privileges granted to initial user
- [ ] `.env` file permissions secured (`chmod 600 .env`)

## 🌐 Access Points

After successful deployment:

- **Frontend**: `http://YOUR_SERVER_IP:3000`
- **Backend API**: `http://YOUR_SERVER_IP:8000`
- **Health Check**: `http://YOUR_SERVER_IP:8000/health`
- **API Documentation**: Available in the application

## 📊 Management Commands

### Service Management
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update application
git pull && ./deploy.sh
```

### Database Management
```bash
# Connect to database
docker-compose exec db psql -U versionintel

# Backup database
docker-compose exec db pg_dump -U versionintel versionintel > backup.sql

# Restore database
docker-compose exec -T db psql -U versionintel versionintel < backup.sql
```

### System Maintenance
```bash
# Full reset and redeploy
docker-compose down --volumes --remove-orphans
docker system prune -f
./deploy.sh

# View system resource usage
docker stats

# Clean up unused Docker resources
docker system prune -a
```

## 🆘 Troubleshooting

### Services Won't Start

1. **Check Docker Status**
   ```bash
   docker --version
   docker-compose --version
   systemctl status docker
   ```

2. **Check Logs**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs db
   ```

3. **Check Port Availability**
   ```bash
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :8000
   netstat -tulpn | grep :5432
   ```

### Database Issues

1. **Reset Database**
   ```bash
   docker-compose down --volumes
   docker volume rm versionintel_postgres_data
   ./deploy.sh
   ```

2. **Check Database Connection**
   ```bash
   docker-compose exec db pg_isready -U versionintel
   ```

### GitHub OAuth Issues

1. **Verify Configuration**
   - Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`
   - Verify callback URL in GitHub OAuth app settings
   - Ensure `CORS_ORIGINS` includes your domain

2. **Test OAuth Flow**
   - Check browser developer tools for errors
   - Verify redirect URLs match exactly

### Build Issues

1. **Clean Build**
   ```bash
   docker-compose down
   docker rmi versionintel_backend versionintel_frontend
   docker system prune -f
   ./deploy.sh
   ```

2. **Check Docker Resources**
   ```bash
   docker system df
   df -h
   ```

## 🔧 Advanced Configuration

### Custom Domain Setup

1. **Update Environment**
   ```bash
   SERVER_HOST=versionintel.yourdomain.com
   CORS_ORIGINS=https://versionintel.yourdomain.com
   ```

2. **Configure Reverse Proxy**
   - Set up nginx/apache reverse proxy
   - Configure SSL certificates
   - Update GitHub OAuth URLs

### Production Optimizations

1. **Resource Limits**
   ```yaml
   # Add to docker-compose.yml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 1G
             cpus: '0.5'
   ```

2. **Backup Strategy**
   ```bash
   # Automated daily backup
   0 2 * * * docker-compose exec db pg_dump -U versionintel versionintel > /backups/versionintel_$(date +%Y%m%d).sql
   ```

## ✅ Success Criteria

Your deployment is successful when:

- ✅ All containers show "healthy" status
- ✅ Frontend loads at `http://YOUR_SERVER_IP:3000`
- ✅ Backend responds at `http://YOUR_SERVER_IP:8000/health`
- ✅ GitHub OAuth login works
- ✅ Admin user can access all features
- ✅ Database is persistent across restarts

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review application logs
3. Check GitHub Issues for known problems
4. Verify all configuration requirements

---

**🎉 Congratulations! Your VersionIntel instance is now deployed and ready for production use!**