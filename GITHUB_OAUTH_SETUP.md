# GitHub OAuth Setup Guide

## 🚀 Quick Setup (From Scratch)

### Prerequisites
- Docker and Docker Compose installed
- GitHub account

### Step 1: Create GitHub OAuth Application
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: VersionIntel
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`
4. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Environment Variables
1. Copy `env.example` to `.env`
2. Update these values in `.env`:
   ```bash
   GITHUB_CLIENT_ID=your_actual_client_id_here
   GITHUB_CLIENT_SECRET=your_actual_client_secret_here
   REACT_APP_GITHUB_CLIENT_ID=your_actual_client_id_here
   ```

### Step 3: Run Setup Script

**Windows:**
```cmd
setup-github-oauth.bat
```

**Linux/Mac:**
```bash
chmod +x setup-github-oauth.sh
./setup-github-oauth.sh
```

### Step 4: Access VersionIntel
1. Visit: http://localhost:3000
2. Click "Continue with GitHub"
3. Authorize the application
4. You're logged in! 🎉

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

```bash
# 1. Stop any existing containers
docker-compose down -v

# 2. Build with latest changes
docker-compose build --no-cache

# 3. Start services
docker-compose up -d

# 4. Check status
docker-compose ps
```

## 🧪 Testing

- **Frontend**: http://localhost:3000 (GitHub login page)
- **Backend Health**: http://localhost:8000/health
- **API**: http://localhost:8000/api/

## 🔍 Troubleshooting

### Common Issues

**Issue**: GitHub OAuth shows "Application not found"
**Solution**: Check your GitHub Client ID in `.env` files

**Issue**: Services not starting
**Solution**: Run `docker-compose logs [service_name]` to check logs

**Issue**: Frontend shows old login page
**Solution**: Clear browser cache or rebuild frontend:
```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Useful Commands

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Restart a service
docker-compose restart [service_name]

# Check service status
docker-compose ps

# Stop all services
docker-compose down

# Complete cleanup (removes volumes)
docker-compose down -v
```

## 🎯 What's Automated

✅ **Database Migration**: GitHub OAuth fields added automatically  
✅ **User Account Linking**: Existing users linked by email  
✅ **Environment Setup**: Docker containers configured properly  
✅ **Security**: CSRF protection and secure token handling  
✅ **Error Handling**: Graceful OAuth failure handling  

## 📋 Architecture

- **Frontend**: React app with GitHub OAuth integration
- **Backend**: Flask API with GitHub OAuth endpoints
- **Database**: PostgreSQL with GitHub user fields
- **Authentication**: JWT tokens + GitHub OAuth
- **Security**: State parameters, HTTPS ready

Your VersionIntel installation is now ready for production use with GitHub OAuth! 🚀