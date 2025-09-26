#!/bin/bash
echo "VersionIntel Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "Health Checks:"
curl -s http://172.17.14.65:3000 > /dev/null && echo "✅ Frontend: OK" || echo "❌ Frontend: FAILED"
curl -s http://172.17.14.65:8000/health > /dev/null && echo "✅ Backend: OK" || echo "❌ Backend: FAILED"
docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U versionintel > /dev/null && echo "✅ Database: OK" || echo "❌ Database: FAILED"
