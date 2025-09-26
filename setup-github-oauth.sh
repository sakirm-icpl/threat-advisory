#!/bin/bash

# VersionIntel GitHub OAuth Setup Script
# This script sets up VersionIntel with GitHub OAuth from scratch

echo "🚀 Setting up VersionIntel with GitHub OAuth..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update .env file with your GitHub OAuth credentials:"
    echo "   - GITHUB_CLIENT_ID=your_actual_client_id"
    echo "   - GITHUB_CLIENT_SECRET=your_actual_client_secret"
    echo "   - REACT_APP_GITHUB_CLIENT_ID=your_actual_client_id"
    echo ""
    echo "Press Enter after updating the .env file..."
    read -r
fi

# Check if frontend .env exists
if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend .env file..."
    echo "REACT_APP_API_URL=http://localhost:8000" > frontend/.env
    echo "REACT_APP_GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}" >> frontend/.env
fi

echo "🛑 Stopping any existing containers..."
docker-compose down -v

echo "🏗️  Building containers with latest changes..."
docker-compose build --no-cache

echo "🚀 Starting VersionIntel services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if all services are healthy
echo "🔍 Checking service health..."
if docker-compose ps | grep -q "unhealthy"; then
    echo "❌ Some services are not healthy. Checking logs..."
    docker-compose logs
    exit 1
fi

echo "✅ All services are running!"
echo ""
echo "🎉 VersionIntel with GitHub OAuth is ready!"
echo ""
echo "📋 Next steps:"
echo "1. Visit: http://localhost:3000"
echo "2. Click 'Continue with GitHub'"
echo "3. Authorize the application"
echo "4. You'll be logged into VersionIntel!"
echo ""
echo "🔧 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Health:   http://localhost:8000/health"
echo ""
echo "📊 Check service status: docker-compose ps"
echo "📝 View logs: docker-compose logs [service_name]"