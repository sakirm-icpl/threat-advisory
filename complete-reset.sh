#!/bin/bash

echo "🔥 COMPLETE VERSIONINTEL SYSTEM RESET"
echo "====================================="

# Stop everything
echo "1. Stopping all containers..."
docker-compose down -v --remove-orphans

# Remove everything Docker related
echo "2. Cleaning Docker completely..."
docker system prune -af --volumes
docker rmi $(docker images -q) 2>/dev/null || true
docker volume prune -f

# Verify .env file
echo "3. Checking environment configuration..."
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Show current database config
echo "Current database config:"
grep -E "(POSTGRES_|DATABASE_)" .env

# Build fresh containers
echo "4. Building fresh containers..."
docker-compose build --no-cache --pull

# Start database only first
echo "5. Starting database..."
docker-compose up -d db

# Wait for database
echo "6. Waiting for database to initialize..."
sleep 20

# Check database is ready
echo "7. Testing database connection..."
docker-compose exec -T db psql -U versionintel_prod -d versionintel -c "SELECT 1;" || {
    echo "❌ Database connection failed"
    docker logs versionintel_db_1
    exit 1
}

# Start backend
echo "8. Starting backend..."
docker-compose up -d backend

# Wait for backend
echo "9. Waiting for backend to initialize..."
sleep 30

# Test backend
echo "10. Testing backend health..."
for i in {1..10}; do
    if curl -f http://172.17.14.65:8000/health 2>/dev/null; then
        echo "✅ Backend is healthy"
        break
    fi
    echo "Attempt $i/10: Backend not ready yet..."
    sleep 5
done

# Start frontend
echo "11. Starting frontend..."
docker-compose up -d frontend

# Final verification
echo "12. Final system check..."
sleep 10

echo "=== CONTAINER STATUS ==="
docker ps

echo "=== BACKEND LOGS ==="
docker logs versionintel_backend_1 --tail 10

echo "=== TESTING ENDPOINTS ==="
echo "Health check:"
curl -s http://172.17.14.65:8000/health | jq . 2>/dev/null || curl -s http://172.17.14.65:8000/health

echo -e "\nOAuth login endpoint:"
curl -s http://172.17.14.65:8000/auth/github/login | jq . 2>/dev/null || curl -s http://172.17.14.65:8000/auth/github/login

echo -e "\n🎯 SYSTEM READY!"
echo "🌐 Frontend: http://172.17.14.65:3000"
echo "🔗 Backend: http://172.17.14.65:8000"
echo "🗄️ Database: localhost:5432"