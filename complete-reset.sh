#!/bin/bash

# VersionIntel Database Reset & Complete Fix
# ==========================================

set -e

echo "🔧 VersionIntel COMPLETE DATABASE RESET"
echo "======================================="
echo ""

echo "⚠️  This will completely reset the database and rebuild everything!"
echo "All existing data will be LOST!"
echo ""
read -p "Continue? (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Reset cancelled"
    exit 0
fi

echo ""
echo "🛑 Stopping all services..."
docker-compose -f docker-compose.production.yml down --volumes --remove-orphans

echo "🗄️ Removing database volume..."
docker volume rm versionintel_postgres_data 2>/dev/null || true

echo "🧹 Removing all images..."
docker rmi -f versionintel_backend versionintel_frontend 2>/dev/null || true

echo "🧹 Cleaning Docker system..."
docker system prune -f

echo "🔨 Rebuilding services..."
docker-compose -f docker-compose.production.yml build --no-cache

echo "🗄️ Starting database first..."
docker-compose -f docker-compose.production.yml up -d db

echo "⏳ Waiting for database to initialize..."
sleep 15

echo "🚀 Starting backend..."
docker-compose -f docker-compose.production.yml up -d backend

echo "⏳ Waiting for backend to initialize..."
sleep 15

echo "🎨 Starting frontend..."
docker-compose -f docker-compose.production.yml up -d frontend

echo "⏳ Final wait for all services..."
sleep 10

echo ""
echo "📊 Final Status:"
docker ps

echo ""
echo "📋 Backend logs (last 10 lines):"
docker logs versionintel-backend-prod --tail=10

echo ""
echo "✅ COMPLETE RESET FINISHED!"
echo ""
echo "🌐 Access:"
echo "   Frontend: http://172.17.14.65:3000"
echo "   Backend:  http://172.17.14.65:8000"
echo ""
echo "🔑 Default Login:"
echo "   Username: admin"
echo "   Password: Admin@123"