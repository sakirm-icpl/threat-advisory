#!/bin/bash

# VersionIntel GitHub OAuth Deployment Script
# ==========================================
# Universal deployment for any server

set -e

echo "🚀 VersionIntel GitHub OAuth Deployment"
echo "======================================"
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
    "GITHUB_CLIENT_ID"
    "GITHUB_CLIENT_SECRET"
)

echo "🔍 Validating configuration..."
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required variable $var is not set in .env"
        if [[ "$var" == "GITHUB_CLIENT_ID" || "$var" == "GITHUB_CLIENT_SECRET" ]]; then
            echo "   GitHub OAuth is required for authentication!"
            echo "   Set up at: https://github.com/settings/developers"
        fi
        exit 1
    fi
done
echo "✅ Configuration valid"
echo ""

# Stop existing containers and clean everything
echo "🛑 Stopping existing containers..."
docker-compose down --volumes --remove-orphans 2>/dev/null || true

# Complete Docker cleanup
echo "🧹 Performing complete Docker cleanup..."
echo "   Removing all VersionIntel containers..."
docker ps -a --filter "name=versionintel" -q | xargs -r docker rm -f 2>/dev/null || true

echo "   Removing all VersionIntel images..."
docker images --filter "reference=*versionintel*" -q | xargs -r docker rmi -f 2>/dev/null || true
docker images --filter "reference=versionintel_*" -q | xargs -r docker rmi -f 2>/dev/null || true

echo "   Removing VersionIntel volumes..."
docker volume ls --filter "name=versionintel" -q | xargs -r docker volume rm 2>/dev/null || true

echo "   Removing VersionIntel networks..."
docker network ls --filter "name=versionintel" -q | xargs -r docker network rm 2>/dev/null || true

echo "   Pruning unused Docker resources..."
docker system prune -f 2>/dev/null || true

echo "   Cleaning build cache..."
docker builder prune -f 2>/dev/null || true

echo "✅ Complete cleanup finished"

# Build and deploy with fresh build
echo "🔨 Building and deploying VersionIntel with fresh build..."
echo "   Building backend from scratch..."
echo "   Building frontend from scratch..."
echo "   Creating new containers..."
docker-compose up -d --build --force-recreate

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15
echo "   Checking backend health..."
for i in {1..12}; do
    if curl -f http://${SERVER_HOST:-localhost}:8000/health >/dev/null 2>&1; then
        echo "   ✅ Backend is healthy"
        break
    fi
    if [ $i -eq 12 ]; then
        echo "   ⚠️ Backend health check timeout"
    else
        echo "   Waiting for backend... ($i/12)"
        sleep 5
    fi
done

echo "   Checking frontend..."
for i in {1..6}; do
    if curl -f http://${SERVER_HOST:-localhost}:3000 >/dev/null 2>&1; then
        echo "   ✅ Frontend is accessible"
        break
    fi
    if [ $i -eq 6 ]; then
        echo "   ⚠️ Frontend accessibility check timeout"
    else
        echo "   Waiting for frontend... ($i/6)"
        sleep 5
    fi
done

echo ""
echo "📊 Deployment Status:"
docker-compose ps

echo ""
echo "📄 Recent logs:"
echo "Backend logs:"
docker-compose logs --tail=5 backend
echo ""
echo "Frontend logs:"
docker-compose logs --tail=5 frontend

echo ""
echo "✅ VersionIntel Deployed Successfully with Fresh Build!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://${SERVER_HOST:-localhost}:3000"
echo "   Backend:  http://${SERVER_HOST:-localhost}:8000"
echo "   Health:   http://${SERVER_HOST:-localhost}:8000/health"
echo ""
echo "🔑 Authentication:"
echo "   GitHub OAuth Only - No traditional login"
echo "   First user to login will need admin privileges granted manually"
echo ""
echo "📋 Management Commands:"
echo "   Status:   docker-compose ps"
echo "   Logs:     docker-compose logs -f"
echo "   Stop:     docker-compose down"
echo "   Restart:  docker-compose restart"
echo "   Clean:    docker-compose down --volumes && docker system prune -f"
echo ""
echo "🐞 Debug Commands:"
echo "   Backend logs:  docker-compose logs backend -f"
echo "   Frontend logs: docker-compose logs frontend -f"
echo "   Database logs: docker-compose logs db -f"