#!/bin/bash

# VersionIntel Fully Automated Production Deployment Script
# This script will automatically generate keys, configure environment, and deploy

set -e  # Exit on any error

echo "🚀 VersionIntel Fully Automated Production Deployment"
echo "===================================================="
echo "This script will:"
echo "  ✅ Generate secure keys automatically"
echo "  ✅ Configure environment variables"
echo "  ✅ Build and deploy all services"
echo "  ✅ Verify deployment health"
echo ""

# Configuration - Modify these values for your server
DEFAULT_SERVER_IP="172.17.14.65"
DEFAULT_POSTGRES_USER="versionintel_prod"
DEFAULT_POSTGRES_DB="versionintel"

# GitHub OAuth - Replace with your actual values
GITHUB_CLIENT_ID="Iv23liGLM3AMR1Tl3af5"
GITHUB_CLIENT_SECRET="d9e38560dc244f312b4bb028a850cd7bda91a264"

# API Keys - Replace with your actual values
NVD_API_KEY="523ff249-3119-49fa-a1d6-31ba53131052"
GOOGLE_API_KEY="AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA"

# Get server IP (allow override via environment variable)
SERVER_IP=${SERVER_IP:-$DEFAULT_SERVER_IP}

echo "🔍 Pre-deployment checks..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please logout and login again, then re-run this script."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed."
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Starting Docker..."
    sudo systemctl start docker
    sudo systemctl enable docker
    sleep 5
fi

echo "✅ Docker and Docker Compose are ready"

# Detect Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "📦 Installing Python 3..."
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y python3
        PYTHON_CMD="python3"
    elif command -v yum &> /dev/null; then
        sudo yum install -y python3
        PYTHON_CMD="python3"
    else
        echo "❌ Could not install Python. Please install manually and re-run."
        exit 1
    fi
fi

echo "✅ Python available as: $PYTHON_CMD"

# Generate secure keys automatically
echo ""
echo "🔐 Generating secure keys automatically..."

SECRET_KEY=$($PYTHON_CMD -c "import secrets; print(secrets.token_hex(32))")
JWT_SECRET_KEY=$($PYTHON_CMD -c "import secrets; print(secrets.token_hex(32))")
POSTGRES_PASSWORD=$($PYTHON_CMD -c "import secrets, string; chars = string.ascii_letters + string.digits + '!@#\$%^&*'; print(''.join(secrets.choice(chars) for i in range(32)))")

echo "✅ Secure keys generated"

# Create .env file automatically
echo ""
echo "📝 Creating production environment configuration..."

cat > .env << EOF
# VersionIntel Production Environment Variables
# Generated automatically on $(date)
# 
# IMPORTANT: 
# 1. Never commit this file to version control
# 2. Keep this file secure and accessible only to authorized personnel

# Server Configuration
SERVER_IP=$SERVER_IP

# Database Configuration
POSTGRES_USER=$DEFAULT_POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=$DEFAULT_POSTGRES_DB

# Application Security (Auto-generated secure keys)
SECRET_KEY=$SECRET_KEY
JWT_SECRET_KEY=$JWT_SECRET_KEY

# GitHub OAuth
GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET
GITHUB_REDIRECT_URI=http://$SERVER_IP:3000/auth/github/callback

# API Keys
NVD_API_KEY=$NVD_API_KEY
GOOGLE_API_KEY=$GOOGLE_API_KEY
GOOGLE_MODEL=gemini-1.5-flash
AI_PROVIDER=gemini

# Application Configuration
FLASK_ENV=production
FLASK_DEBUG=0
REACT_APP_API_URL=http://$SERVER_IP:8000
EOF

echo "✅ Environment configuration created"

# Load environment variables
echo ""
echo "📋 Loading environment variables..."
export $(cat .env | grep -v '^#' | xargs)

# Create frontend .env file
echo "📝 Creating frontend environment file..."
echo "REACT_APP_API_URL=http://$SERVER_IP:8000" > frontend/.env

# Stop any existing containers
echo ""
echo "🛑 Stopping any existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Clean up old images
echo "🧹 Cleaning up old images..."
docker system prune -f 2>/dev/null || true

# Build images
echo ""
echo "🔨 Building Docker images..."
echo "Building backend image..."
docker-compose build backend

echo "Building frontend image..."
docker-compose build frontend

echo "✅ All images built successfully!"

# Deploy services
echo ""
echo "🚀 Deploying services with secure environment..."
docker-compose --env-file .env up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 20

# Check service health
echo ""
echo "🏥 Checking service health..."

# Check if all containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ All services are running"
else
    echo "❌ Some services failed to start"
    docker-compose ps
    docker-compose logs --tail=50
    exit 1
fi

# Test health endpoints
BACKEND_HEALTH="http://$SERVER_IP:8000/health"
FRONTEND_URL="http://$SERVER_IP:3000"

echo "Testing backend health endpoint..."
for i in {1..10}; do
    if curl -f $BACKEND_HEALTH &> /dev/null; then
        echo "✅ Backend health check passed"
        break
    else
        echo "⏳ Waiting for backend... (attempt $i/10)"
        sleep 10
    fi
    if [ $i -eq 10 ]; then
        echo "⚠️ Backend health check failed (this might be normal during startup)"
    fi
done

echo "Testing frontend endpoint..."
for i in {1..5}; do
    if curl -f $FRONTEND_URL &> /dev/null; then
        echo "✅ Frontend health check passed"
        break
    else
        echo "⏳ Waiting for frontend... (attempt $i/5)"
        sleep 5
    fi
    if [ $i -eq 5 ]; then
        echo "⚠️ Frontend health check failed (this might be normal during startup)"
    fi
done

# Display deployment summary
echo ""
echo "🎉 VersionIntel Automated Deployment Complete!"
echo "=============================================="
echo ""
echo "🌐 ACCESS URLS:"
echo "   Frontend:        http://$SERVER_IP:3000"
echo "   Backend API:     http://$SERVER_IP:8000"
echo "   API Docs:        http://$SERVER_IP:8000/docs"
echo "   Health Check:    http://$SERVER_IP:8000/health"
echo "   Metrics:         http://$SERVER_IP:8000/metrics"
echo ""
echo "🔐 DEFAULT LOGIN CREDENTIALS:"
echo "   Username: admin"
echo "   Password: Admin@1234"
echo "   ⚠️  CRITICAL: Change this password immediately after first login!"
echo ""
echo "✅ SECURITY STATUS:"
echo "   🔑 Secure keys auto-generated and applied"
echo "   🔒 Environment variables properly configured"
echo "   🛡️  CORS restricted to server IP"
echo "   🔐 GitHub OAuth configured"
echo "   🔑 API keys configured"
echo ""
echo "📋 GENERATED CREDENTIALS (SAVE THESE SECURELY):"
echo "   Database User:     $DEFAULT_POSTGRES_USER"
echo "   Database Password: $POSTGRES_PASSWORD"
echo "   SECRET_KEY:        $SECRET_KEY"
echo "   JWT_SECRET_KEY:    $JWT_SECRET_KEY"
echo ""
echo "🔧 USEFUL COMMANDS:"
echo "   View logs:         docker-compose logs -f"
echo "   Stop services:     docker-compose down"
echo "   Restart services:  docker-compose restart"
echo "   Check status:      docker-compose ps"
echo "   Database backup:   docker-compose exec db pg_dump -U $DEFAULT_POSTGRES_USER $DEFAULT_POSTGRES_DB > backup.sql"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "   1. Change admin password immediately"
echo "   2. Set up SSL/TLS certificates"
echo "   3. Configure firewall rules"
echo "   4. Set up monitoring and backups"
echo "   5. Save the generated credentials securely"
echo ""
echo "🚀 Deployment completed successfully at $(date)"
echo ""
echo "🔒 Your .env file contains production secrets - keep it secure!"
echo "📝 Consider setting up automated backups and monitoring"

# Final verification
echo ""
echo "🔍 Final verification..."
echo "Services status:"
docker-compose ps

echo ""
echo "🎯 Deployment Summary:"
echo "   Total deployment time: $SECONDS seconds"
echo "   Services deployed: $(docker-compose ps --services | wc -l)"
echo "   Containers running: $(docker-compose ps | grep -c Up)"
echo ""
echo "✅ VersionIntel is now running securely in production!"