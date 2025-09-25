#!/bin/bash

echo "=== VersionIntel Production Fix Script ==="
echo "This will stop containers, rebuild backend with fixes, and restart"

# Stop all containers
echo "Stopping all containers..."
docker-compose -f docker-compose.production.yml down

# Remove the problematic backend image
echo "Removing old backend image..."
docker rmi versionintel_backend 2>/dev/null || true

# Rebuild backend with no cache
echo "Rebuilding backend with fixes..."
docker-compose -f docker-compose.production.yml build --no-cache backend

# Start all services
echo "Starting all services..."
docker-compose -f docker-compose.production.yml up -d

# Wait a moment for startup
echo "Waiting for services to start..."
sleep 10

# Show status
echo "=== Container Status ==="
docker ps

echo ""
echo "=== Checking logs for any issues ==="
docker-compose -f docker-compose.production.yml logs --tail=20

echo ""
echo "=== Fix Complete ==="
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo ""
echo "Default admin credentials:"
echo "Username: admin"
echo "Password: Admin@123"