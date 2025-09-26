#!/bin/bash

# VersionIntel Clean Deployment Script for Linux/Mac
# This script cleans all Docker resources and starts fresh deployment

# Load environment variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Environment variables loaded from .env file"
else
    echo "⚠️  No .env file found. Using default values."
fi

echo "========================================"
echo "VersionIntel Clean Deployment Script"
echo "========================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Ensure Docker daemon is running
echo "🔍 Checking Docker daemon..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running. Please start Docker and re-run this script."
    exit 1
fi

echo "✅ Docker daemon is running"

# Clean up everything
echo ""
echo "========================================"
echo "CLEANING DOCKER RESOURCES"
echo "========================================"

echo "🛑 Stopping all containers..."
docker stop $(docker ps -aq) 2>/dev/null || true

echo "🗑️  Removing all containers..."
docker rm $(docker ps -aq) 2>/dev/null || true

echo "🧨 Removing all images..."
docker rmi $(docker images -q) 2>/dev/null || true

echo "🧹 Removing all volumes..."
docker volume rm $(docker volume ls -q) 2>/dev/null || true

echo "🕸️  Removing all networks..."
docker network rm $(docker network ls -q) 2>/dev/null || true

echo "✨ Pruning system..."
docker system prune -a -f

echo "📦 Pruning volumes..."
docker volume prune -f

echo "✅ All Docker resources cleaned"

# Set server IP from environment or default to localhost
SERVER_IP=${SERVER_HOST:-localhost}
echo "🌐 Using server IP: $SERVER_IP"

# Create frontend .env file if it doesn't exist
if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend environment file..."
    echo "REACT_APP_API_URL=http://$SERVER_IP:${BACKEND_PORT:-8000}" > frontend/.env
    echo "REACT_APP_GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}" >> frontend/.env
    echo "✅ Frontend environment file created"
else
    echo "✅ Frontend environment file already exists"
    # Update the API URL to use the correct IP
    sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=http://$SERVER_IP:${BACKEND_PORT:-8000}|" frontend/.env
    # Update the GitHub Client ID to match the main .env file
    sed -i "s|REACT_APP_GITHUB_CLIENT_ID=.*|REACT_APP_GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}|" frontend/.env
    echo "✅ Updated frontend environment file"
fi

# Build and deploy
echo ""
echo "========================================"
echo "BUILDING AND DEPLOYING SERVICES"
echo "========================================"

echo "🔨 Building backend image..."
docker-compose build backend

echo "🔨 Building frontend image..."
docker-compose build frontend

echo "✅ All images built successfully!"

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready (30 seconds)..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Display access information
echo ""
echo "========================================"
echo "DEPLOYMENT COMPLETE"
echo "========================================"
echo ""
echo "🌐 FRONTEND URL: http://$SERVER_IP:${FRONTEND_PORT:-3000}"
echo "🛠️  BACKEND API: http://$SERVER_IP:${BACKEND_PORT:-8000}"
echo "📚 API DOCS: http://$SERVER_IP:${BACKEND_PORT:-8000}/apidocs/"
echo "🏥 HEALTH CHECK: http://$SERVER_IP:${BACKEND_PORT:-8000}/health"
echo ""
echo "🔐 DEFAULT LOGIN CREDENTIALS:"
echo "   Username: admin"
echo "   Password: Admin@1234"
echo ""
echo "⚠️  IMPORTANT: Change the default admin password after first login!"
echo ""
echo "📋 Useful Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Rebuild and deploy: ./deploy.sh"
echo ""
echo "🎉 VersionIntel deployed successfully!"