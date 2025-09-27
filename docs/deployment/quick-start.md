# Quick Start Guide

Get VersionIntel up and running in less than 10 minutes with this quick start guide.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 1.29 or higher)
- **Git** (for cloning the repository)

### Platform-Specific Prerequisites

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose git

# Enable Docker without sudo
sudo usermod -aG docker $USER
# Log out and log back in for changes to take effect
```

#### macOS
```bash
# Install Docker Desktop for Mac
# Download from: https://docs.docker.com/desktop/mac/

# Install via Homebrew (alternative)
brew install docker docker-compose git
```

#### Windows
```batch
REM Install Docker Desktop for Windows
REM Download from: https://docs.docker.com/desktop/windows/

REM Install Git for Windows
REM Download from: https://git-scm.com/download/win
```

## Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd versionintel
```

## Step 2: Configure Environment

### Create Environment File
```bash
# Copy the environment template
cp env.example .env
```

### Configure Required Settings

Edit the `.env` file and update these essential settings:

```bash
# Server Configuration (REQUIRED)
SERVER_HOST=localhost  # Change to your server IP for external access

# GitHub OAuth Configuration (REQUIRED)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback

# Security Keys (REQUIRED)
SECRET_KEY=your-very-secure-secret-key-here
JWT_SECRET_KEY=your-very-secure-jwt-secret-key-here

# Google AI Configuration (OPTIONAL but recommended)
GOOGLE_API_KEY=your-google-api-key

# Database Configuration (Optional - defaults work for development)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=versionintel
```

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: VersionIntel
   - **Homepage URL**: `http://localhost:3000` (or your server IP)
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
4. Copy the Client ID and Client Secret to your `.env` file

## Step 3: Deploy the Application

Choose your platform and run the appropriate deployment script:

### Linux/Mac
```bash
# Make the script executable
chmod +x deploy-linux.sh

# Run deployment
./deploy-linux.sh
```

### Windows
```batch
REM Run deployment
deploy-windows.bat
```

### Manual Deployment (Alternative)
```bash
# Build and start services
docker-compose up -d

# Wait for services to be ready
sleep 30

# Check service status
docker-compose ps
```

## Step 4: Verify Installation

### Check Service Status
```bash
docker-compose ps
```

You should see all services running:
```
        Name                      Command               State           Ports
-----------------------------------------------------------------------------------
versionintel_backend_1   python wsgi.py                   Up      0.0.0.0:8000->8000/tcp
versionintel_db_1        docker-entrypoint.sh postgres   Up      5432/tcp
versionintel_frontend_1  /docker-entrypoint.sh sh -c ...  Up      0.0.0.0:3000->80/tcp
```

### Access the Application

Open your web browser and navigate to:

- **Frontend**: `http://localhost:3000` (or `http://your-server-ip:3000`)
- **Backend API**: `http://localhost:8000` (or `http://your-server-ip:8000`)
- **API Documentation**: `http://localhost:8000/apidocs/`
- **Health Check**: `http://localhost:8000/health`

### Test Authentication

1. Click "Login with GitHub" on the frontend
2. Authorize the application with GitHub
3. You should be redirected back to the dashboard

## Step 5: Initial Configuration

### Create Admin User (Optional)

If you need to promote a user to admin role:

```bash
# Access the backend container
docker-compose exec backend bash

# Run the user management script
python -c "
from app import create_app, db
from app.models.user import User, UserRole

app = create_app()
with app.app_context():
    user = User.query.filter_by(github_username='your-github-username').first()
    if user:
        user.role = UserRole.ADMIN
        db.session.commit()
        print(f'User {user.github_username} promoted to admin')
    else:
        print('User not found')
"
```

## Troubleshooting

### Common Issues

#### Docker Permission Issues (Linux)
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, then test
docker ps
```

#### Port Already in Use
```bash
# Check what's using the port
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :8000

# Stop the process using the port
sudo kill -9 <PID>
```

#### Services Not Starting
```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Restart services
docker-compose restart
```

#### Database Connection Issues
```bash
# Reset database
docker-compose down
docker volume rm $(docker volume ls -q | grep versionintel)
docker-compose up -d
```

#### GitHub OAuth Issues
1. Verify GitHub OAuth app settings match your server configuration
2. Check that callback URL matches exactly
3. Ensure CLIENT_ID and CLIENT_SECRET are correct in `.env`

### Getting Help

#### View Service Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

#### Check Service Health
```bash
# Backend health check
curl http://localhost:8000/health

# Database connection test
docker-compose exec db psql -U postgres -d versionintel -c "SELECT 1;"
```

#### Reset Everything
```bash
# Stop all services
docker-compose down

# Remove all volumes (this will delete database data)
docker volume rm $(docker volume ls -q | grep versionintel)

# Remove all images
docker rmi $(docker images | grep versionintel | awk '{print $3}')

# Start fresh
./deploy-linux.sh  # or deploy-windows.bat
```

## Next Steps

Once VersionIntel is running successfully:

1. **Explore the Dashboard**: Navigate through the different sections
2. **Read the User Guide**: Check out the [User Guide](../user-guide/getting-started.md)
3. **API Documentation**: Explore the API at `http://localhost:8000/apidocs/`
4. **Configure Integrations**: Set up additional services like Google AI
5. **Backup Strategy**: Implement regular database backups

## Production Deployment

For production deployment, see the [Production Setup Guide](./production-setup.md) which covers:

- SSL/HTTPS configuration
- Database optimization
- Security hardening
- Monitoring and logging
- Backup and recovery
- Scaling considerations

## Configuration Reference

For detailed configuration options, see:
- [Environment Configuration](./environment-configuration.md)
- [Docker Deployment](./docker-deployment.md)
- [Troubleshooting Guide](./troubleshooting.md)

---

**Congratulations!** You now have VersionIntel running on your system. Start exploring the platform's capabilities through the web interface or API documentation.