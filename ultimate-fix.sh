#!/bin/bash

# VersionIntel ULTIMATE FIX Script
# =================================
# This fixes ALL current production issues

set -e

echo "🔧 VersionIntel ULTIMATE PRODUCTION FIX"
echo "======================================="
echo ""

# Stop everything
echo "🛑 Stopping all containers..."
docker-compose -f docker-compose.production.yml down --remove-orphans

# Remove ALL images to force clean rebuild
echo "🧹 Removing ALL images for clean rebuild..."
docker rmi -f $(docker images -q versionintel*) 2>/dev/null || true

# Clean up unused Docker resources
echo "🧹 Cleaning Docker system..."
docker system prune -f

# Rebuild ONLY backend first to test
echo "🔨 Rebuilding backend with fixes..."
docker-compose -f docker-compose.production.yml build --no-cache backend

# Start database first
echo "🗄️ Starting database..."
docker-compose -f docker-compose.production.yml up -d db

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Start backend
echo "🚀 Starting backend..."
docker-compose -f docker-compose.production.yml up -d backend

# Wait for backend
echo "⏳ Waiting for backend..."
sleep 15

# Check backend logs
echo "📋 Backend logs (last 20 lines):"
docker logs versionintel-backend-prod --tail=20

# Start frontend
echo "🎨 Starting frontend..."
docker-compose -f docker-compose.production.yml up -d frontend

# Final status
echo ""
echo "📊 Final Status:"
docker ps

echo ""
echo "✅ ULTIMATE FIX COMPLETE!"
echo ""
echo "🌐 Access:"
echo "   Frontend: http://172.17.14.65:3000"
echo "   Backend:  http://172.17.14.65:8000"
echo ""
echo "🔑 Login:"
echo "   Username: admin"
echo "   Password: Admin@123"