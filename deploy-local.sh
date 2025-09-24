#!/bin/bash

# VersionIntel Local Deployment Script
# Usage: ./deploy-local.sh

set -e

echo "🚀 VersionIntel Local Deployment"
echo "================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ ERROR: Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Copy local environment configuration
if [ ! -f .env ]; then
    echo "📋 Creating .env from .env.local template..."
    cp .env.local .env
    echo "⚠️  Please update .env with your GitHub OAuth credentials"
else
    echo "✅ .env file exists"
fi

# Create frontend environment file
echo "📝 Creating frontend environment configuration..."
echo "REACT_APP_API_URL=http://localhost:8000" > frontend/.env

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Initialize database
echo "🗃️  Initializing database..."
docker-compose exec -T backend python -c "
from app import create_app, db
app = create_app()
with app.app_context():
    print('Creating database tables...')
    db.create_all()
    print('Database initialized successfully!')
" 2>/dev/null || echo "⚠️  Database may already be initialized"

# Show status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🎉 VersionIntel Local Deployment Complete!"
echo "=========================================="
echo "🌐 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:8000"
echo "🗃️  Database: localhost:5432"
echo ""
echo "📋 Useful Commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart:       docker-compose restart"
echo ""
echo "⚙️  Next Steps:"
echo "  1. Update .env with your GitHub OAuth credentials"
echo "  2. Access the application at http://localhost:3000"
echo "  3. Use 'Demo Account' or configure GitHub OAuth"