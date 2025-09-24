#!/bin/bash

echo "🔧 FIXING HTTP/2 PROTOCOL ERRORS"
echo "================================="
echo ""

echo "Problem: Flask dev server can't handle HTTP/2 requests"
echo "Solution: Switch to Gunicorn production server"
echo ""

# 1. Stop everything
echo "1. Stopping containers..."
docker-compose down

# 2. Remove backend image to force rebuild
echo "2. Removing backend image..."
docker rmi versionintel-backend:latest -f 2>/dev/null || true

# 3. Build backend with Gunicorn
echo "3. Building backend with Gunicorn server..."
docker-compose build --no-cache backend

if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi

# 4. Start database
echo "4. Starting database..."
docker-compose up -d db
sleep 15

# 5. Start backend with new server
echo "5. Starting backend with Gunicorn..."
docker-compose up -d backend
sleep 20

# 6. Test backend
echo "6. Testing backend (should be no more HTTP/2 errors)..."
for i in {1..5}; do
    if curl -f http://172.17.14.65:8000/health >/dev/null 2>&1; then
        echo "✅ Backend healthy - HTTP/2 errors fixed!"
        break
    else
        echo "Attempt $i/5: Testing backend..."
        sleep 3
    fi
done

# 7. Test OAuth endpoint
echo "7. Testing OAuth endpoint..."
if curl -f http://172.17.14.65:8000/auth/github/login >/dev/null 2>&1; then
    echo "✅ OAuth endpoint working!"
else
    echo "❌ OAuth endpoint still having issues"
fi

# 8. Start frontend
echo "8. Starting frontend..."
docker-compose up -d frontend
sleep 10

# 9. Final check
echo "9. Final verification..."
echo ""
echo "=== CONTAINER STATUS ==="
docker ps

echo ""
echo "=== CHECKING FOR HTTP/2 ERRORS ==="
if docker logs versionintel_backend_1 --tail 10 2>&1 | grep -q "HTTP/2.0"; then
    echo "❌ Still seeing HTTP/2 errors:"
    docker logs versionintel_backend_1 --tail 5 | grep "HTTP/2.0"
else
    echo "✅ No HTTP/2 errors detected!"
fi

echo ""
echo "🎯 HTTP/2 FIX COMPLETE!"
echo "🌐 Frontend: http://172.17.14.65:3000"
echo "🔗 Backend: http://172.17.14.65:8000"
echo ""
echo "Try the GitHub login now - it should work!"