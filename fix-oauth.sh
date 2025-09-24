#!/bin/bash

echo "🔧 Fixing VersionIntel OAuth Issues"
echo "=================================="

echo "1. Stopping existing containers..."
docker-compose down

echo "2. Removing old images..."
docker rmi versionintel-backend:latest versionintel-frontend:latest 2>/dev/null || true

echo "3. Rebuilding with fixes..."
docker-compose build --no-cache

echo "4. Starting services..."
docker-compose up -d

echo "5. Waiting for services to start..."
sleep 30

echo "6. Checking service health..."
docker ps

echo "7. Testing backend health..."
curl -f http://172.17.14.65:8000/health || echo "Backend not ready yet"

echo "8. Testing OAuth endpoint..."
curl -f http://172.17.14.65:8000/auth/github/login || echo "OAuth endpoint not ready yet"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Frontend: http://172.17.14.65:3000"
echo "🔗 Backend: http://172.17.14.65:8000"
echo ""
echo "If you still see issues, check the logs with:"
echo "  docker logs versionintel_backend_1"
echo "  docker logs versionintel_frontend_1"