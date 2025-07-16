#!/bin/bash

# VersionIntel Deployment Script
# This script will set up and deploy the complete VersionIntel platform

set -e  # Exit on any error

echo "🚀 VersionIntel Deployment Script"
echo "=================================="

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

# Get the server IP address
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "🌐 Detected server IP: $SERVER_IP"

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

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

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
echo "🌐 Frontend: http://$SERVER_IP:3000"
echo "🔧 Backend API: http://$SERVER_IP:8000"
echo "📚 API Documentation: http://$SERVER_IP:8000/docs"
echo "💚 Health Check: http://$SERVER_IP:8000/health"
echo "📊 Metrics: http://$SERVER_IP:8000/metrics"
echo ""
echo "🔐 Default Login Credentials:"
echo "   Username: admin"
echo "   Password: Admin@1234"
echo ""
echo "⚠️  IMPORTANT: Change the default admin password after first login!"
echo ""
echo "📋 Useful Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update and rebuild: docker-compose up --build -d"
echo "   Check status: docker-compose ps"
echo ""
echo "🔧 Production Notes:"
echo "   - Change default passwords in docker-compose.yml"
echo "   - Update JWT_SECRET_KEY and SECRET_KEY"
echo "   - Configure SSL/TLS for production use"
echo "   - Set up proper firewall rules"
echo ""
echo "🚀 Deployment completed successfully!" 