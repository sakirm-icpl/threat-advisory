#!/bin/bash

# VersionIntel Quick Database Fix
# ===============================

set -e

echo "🔧 QUICK DATABASE FIX - Resetting database with correct credentials"
echo "=================================================================="

# Stop services
docker-compose -f docker-compose.production.yml down --volumes --remove-orphans

# Remove database volume to reset completely
docker volume rm versionintel_postgres_data 2>/dev/null || true

# Start database with fresh volume
docker-compose -f docker-compose.production.yml up -d db

# Wait for database initialization
echo "⏳ Waiting for database..."
sleep 15

# Start backend
docker-compose -f docker-compose.production.yml up -d backend

# Wait for backend
echo "⏳ Waiting for backend..."
sleep 15

# Start frontend
docker-compose -f docker-compose.production.yml up -d frontend

echo ""
echo "📊 Status:"
docker ps

echo ""
echo "✅ QUICK FIX COMPLETE!"
echo "Backend should now connect successfully to the database."
