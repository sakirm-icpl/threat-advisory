@echo off
echo === VersionIntel Production Fix Script ===
echo This will stop containers, rebuild backend with fixes, and restart

echo Stopping all containers...
docker-compose -f docker-compose.production.yml down

echo Removing old backend image...
docker rmi versionintel_backend 2>nul

echo Rebuilding backend with fixes...
docker-compose -f docker-compose.production.yml build --no-cache backend

echo Starting all services...
docker-compose -f docker-compose.production.yml up -d

echo Waiting for services to start...
timeout /t 10

echo === Container Status ===
docker ps

echo.
echo === Checking logs for any issues ===
docker-compose -f docker-compose.production.yml logs --tail=20

echo.
echo === Fix Complete ===
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Default admin credentials:
echo Username: admin
echo Password: Admin@123

pause