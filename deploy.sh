#!/bin/bash

# VersionIntel Standard Deployment Script
# =======================================
# Universal deployment for any server

set -e

echo "🚀 VersionIntel Standard Deployment"
echo "==================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Environment file '.env' not found!"
    echo ""
    echo "Please create .env file first:"
    echo "  cp .env.template .env"
    echo "  nano .env  # Configure your settings"
    echo ""
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Load environment variables to validate
set -a
source .env
set +a

# Validate required variables
required_vars=(
    "POSTGRES_USER"
    "POSTGRES_PASSWORD" 
    "POSTGRES_DB"
    "SECRET_KEY"
    "JWT_SECRET_KEY"
)

echo "🔍 Validating configuration..."
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required variable $var is not set in .env"
        exit 1
    fi
done
echo "✅ Configuration valid"
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --volumes --remove-orphans 2>/dev/null || true

# Clean up old images
echo "🧹 Cleaning up old images..."
docker rmi versionintel_backend versionintel_frontend 2>/dev/null || true

# Build and deploy
echo "🔨 Building and deploying VersionIntel..."
docker-compose up -d --build

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 20

# Show status
echo ""
echo "📊 Deployment Status:"
docker-compose ps

echo ""
echo "✅ VersionIntel Deployed Successfully!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Health:   http://localhost:8000/health"
echo ""
echo "🔑 Default Admin Login:"
echo "   Username: admin"
echo "   Password: Admin@123"
echo ""
echo "📋 Management Commands:"
echo "   Status:   docker-compose ps"
echo "   Logs:     docker-compose logs -f"
echo "   Stop:     docker-compose down"
echo "   Restart:  docker-compose restart"