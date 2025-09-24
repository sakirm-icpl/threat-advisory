#!/bin/bash

echo "🔧 Complete VersionIntel Rebuild with OAuth Fixes"
echo "=================================================="

echo "1. Stopping all containers..."
docker-compose down -v

echo "2. Removing old images and containers..."
docker rmi versionintel-backend:latest versionintel-frontend:latest 2>/dev/null || true
docker system prune -f

echo "3. Verifying environment variables..."
echo "POSTGRES_PASSWORD from .env: $(grep POSTGRES_PASSWORD .env | cut -d'=' -f2)"
echo "DATABASE_URL from .env: $(grep DATABASE_URL .env | cut -d'=' -f2)"

echo "4. Building backend with new environment..."
docker-compose build --no-cache backend

echo "5. Building frontend..."
docker-compose build --no-cache frontend

echo "6. Starting database first..."
docker-compose up -d db

echo "7. Waiting for database to be ready..."
sleep 15

echo "8. Starting backend..."
docker-compose up -d backend

echo "9. Waiting for backend to initialize..."
sleep 20

echo "10. Starting frontend..."
docker-compose up -d frontend

echo "11. Final check - container status:"
docker ps

echo "12. Testing backend health..."
curl -f http://172.17.14.65:8000/health && echo "✅ Backend healthy" || echo "❌ Backend not ready"

echo "13. Testing OAuth endpoint..."
curl -f http://172.17.14.65:8000/auth/github/login && echo "✅ OAuth endpoint ready" || echo "❌ OAuth not ready"

echo ""
echo "🎯 Rebuild complete!"
echo "🌐 Frontend: http://172.17.14.65:3000"
echo "🔗 Backend: http://172.17.14.65:8000"
echo ""
echo "If issues persist, check logs with:"
echo "  docker logs versionintel_backend_1"
echo "  docker logs versionintel_frontend_1"