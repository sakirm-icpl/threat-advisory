#!/bin/bash

# VersionIntel Deployment Script
# This script automates the deployment process

set -e

echo "🚀 VersionIntel Deployment Script"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "📍 Detected server IP: $SERVER_IP"

# Check if frontend/.env exists
if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend/.env file..."
    echo "REACT_APP_API_URL=http://$SERVER_IP:8000" > frontend/.env
    echo "✅ Created frontend/.env with API URL: http://$SERVER_IP:8000"
else
    echo "✅ frontend/.env already exists"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose down --volumes 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "🎉 Deployment completed!"
echo "=================================="
echo "📱 Frontend: http://$SERVER_IP:3000"
echo "🔧 Backend API: http://$SERVER_IP:8000"
echo "📚 API Docs: http://$SERVER_IP:8000/docs"
echo "💚 Health Check: http://$SERVER_IP:8000/health"
echo ""
echo "🔐 Default login credentials:"
echo "   Username: admin"
echo "   Password: Admin@1234"
echo ""
echo "⚠️  IMPORTANT: Change the default password after first login!"
echo ""
echo "📝 For Markdown usage guide, see: MARKDOWN_GUIDE.md" 