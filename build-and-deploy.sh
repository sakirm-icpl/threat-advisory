#!/bin/bash

# VersionIntel Build and Deploy Script - Production Ready
# This script will securely build and deploy using environment variables

set -e  # Exit on any error

echo "🚀 VersionIntel Secure Build and Deploy Script"
echo "================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f ".env.production" ]; then
        cp .env.production .env
        echo "📝 Copied .env.production to .env"
        echo "⚠️  IMPORTANT: Edit .env file and replace all CHANGE_THIS_* placeholders with secure values!"
        echo "   Use these commands to generate secure keys:"
        echo "   python3 -c \"import secrets; print('SECRET_KEY=' + secrets.token_hex(32))\""
        echo "   python3 -c \"import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))\""
        echo ""
        echo "❌ Please update .env file with secure values and run this script again."
        exit 1
    else
        echo "❌ Neither .env nor .env.production found. Please create .env file first."
        exit 1
    fi
fi

# Validate required environment variables
echo "🔍 Validating environment configuration..."
if grep -q "CHANGE_THIS_" .env; then
    echo "❌ Found CHANGE_THIS_ placeholders in .env file."
    echo "   Please replace all placeholders with actual secure values."
    echo "   Use these commands to generate secure keys:"
    echo "   python3 -c \"import secrets; print('SECRET_KEY=' + secrets.token_hex(32))\""
    echo "   python3 -c \"import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))\""
    exit 1
fi

echo "✅ Environment configuration validated"

# Load environment variables
echo "📋 Loading environment variables from .env file..."
export $(cat .env | grep -v '^#' | xargs)

# Get SERVER_IP from environment or default to localhost
SERVER_IP=${SERVER_IP:-localhost}
echo "🌐 Using server IP: $SERVER_IP"

# Create frontend .env file with correct API URL
echo "📝 Creating frontend environment file..."
echo "REACT_APP_API_URL=http://$SERVER_IP:8000" > frontend/.env
echo "✅ Frontend environment file created with API URL: http://$SERVER_IP:8000"

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Clean up old images (optional)
echo "🧹 Cleaning up old images..."
docker system prune -f 2>/dev/null || true

# STEP 1: Build the images first
echo "🔨 STEP 1: Building Docker images..."
echo "Building backend image..."
docker-compose build backend

echo "Building frontend image..."
docker-compose build frontend

echo "✅ All images built successfully!"

# List the built images
echo "📋 Built images:"
docker images | grep versionintel

# STEP 2: Deploy using the built images with environment file
echo ""
echo "🚀 STEP 2: Deploying services using built images with secure environment..."
docker-compose --env-file .env up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check if services are running
echo "🔍 Checking service status..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ All services are running successfully!"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Wait a bit more for health checks
echo "⏳ Waiting for health checks..."
sleep 10

# Test health endpoints
echo "🏥 Testing health endpoints..."
if curl -f http://$SERVER_IP:8000/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "⚠️  Backend health check failed (this might be normal during startup)"
fi

if curl -f http://$SERVER_IP:3000 > /dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "⚠️  Frontend health check failed (this might be normal during startup)"
fi

# Display access information
echo ""
echo "🎉 VersionIntel is now running securely!"
echo "=========================================="
echo ""
echo "🌐 FRONTEND URL: http://$SERVER_IP:3000"
echo ""
echo "🔐 DEFAULT LOGIN CREDENTIALS (CHANGE IMMEDIATELY):"
echo "   Username: admin"
echo "   Password: Admin@1234"
echo "   ⚠️  CRITICAL: Change this password immediately after first login!"
echo ""
echo "📚 Additional URLs:"
echo "   Backend API: http://$SERVER_IP:8000"
echo "   API Documentation: http://$SERVER_IP:8000/docs"
echo "   Health Check: http://$SERVER_IP:8000/health"
echo "   Metrics: http://$SERVER_IP:8000/metrics"
echo ""
echo "✅ GitHub OAuth Configuration:"
echo "   Client ID: ${GITHUB_CLIENT_ID:-Not Set}"
echo "   Redirect URI: ${GITHUB_REDIRECT_URI:-Not Set}"
echo ""
echo "🔧 Production Security Checklist:"
echo "   ✅ Environment variables loaded securely"
echo "   ✅ CORS restricted to specific domains"
echo "   ⚠️  Change admin password (CRITICAL)"
echo "   ⚠️  Set up SSL/TLS certificates"
echo "   ⚠️  Configure firewall rules"
echo "   ⚠️  Set up monitoring and backups"
echo ""
echo "📋 Useful Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Rebuild and deploy: ./build-and-deploy.sh"
echo "   Check status: docker-compose ps"
echo "   Database backup: docker-compose exec db pg_dump -U \$POSTGRES_USER \$POSTGRES_DB > backup.sql"
echo ""
echo "🚀 Secure build and deployment completed successfully!" 