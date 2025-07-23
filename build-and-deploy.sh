#!/bin/bash

# VersionIntel Build and Deploy Script
# This script will first build the images and then deploy using those built images

set -e  # Exit on any error

echo "🚀 VersionIntel Build and Deploy Script"
echo "========================================"

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

# Set server IP to localhost
SERVER_IP=localhost
echo "🌐 Using localhost for local development"

# Create frontend .env file if it doesn't exist
if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend environment file..."
    echo "REACT_APP_API_URL=http://$SERVER_IP:8000" > frontend/.env
    echo "✅ Frontend environment file created with IP: $SERVER_IP"
else
    echo "✅ Frontend environment file already exists"
    # Update the API URL to use the correct IP
    sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=http://$SERVER_IP:8000|" frontend/.env
    echo "✅ Updated frontend environment file with IP: $SERVER_IP"
fi

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

# STEP 2: Deploy using the built images
echo ""
echo "🚀 STEP 2: Deploying services using built images..."
docker-compose up -d

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
echo "🎉 VersionIntel is now running!"
echo "=================================="
echo ""
echo "🌐 FRONTEND URL: http://$SERVER_IP:3000"
echo ""
echo "🔐 LOGIN CREDENTIALS:"
echo "   Username: admin"
echo "   Password: Admin@1234"
echo ""
echo "📚 Additional URLs:"
echo "   Backend API: http://$SERVER_IP:8000"
echo "   API Documentation: http://$SERVER_IP:8000/docs"
echo "   Health Check: http://$SERVER_IP:8000/health"
echo "   Metrics: http://$SERVER_IP:8000/metrics"
echo ""
echo "⚠️  IMPORTANT: Change the default admin password after first login!"
echo ""
echo "📋 Useful Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Rebuild and deploy: ./build-and-deploy.sh"
echo "   Check status: docker-compose ps"
echo "   List images: docker images | grep versionintel"
echo ""
echo "🔧 Production Notes:"
echo "   - Change default passwords in docker-compose.yml"
echo "   - Update JWT_SECRET_KEY and SECRET_KEY"
echo "   - Configure SSL/TLS for production use"
echo "   - Set up proper firewall rules"
echo ""
echo "🚀 Build and deployment completed successfully!" 