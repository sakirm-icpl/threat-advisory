@echo off
REM Instant Fix for VersionIntel Production Issues
REM =============================================

echo [INFO] 🔧 Instant Fix - Stopping and Rebuilding...

REM Stop all services
docker-compose -f docker-compose.production.yml down

REM Remove old backend image to force rebuild
docker rmi versionintel_backend 2>nul

REM Rebuild backend with fixed Dockerfile
echo [INFO] Rebuilding backend with database fixes...
docker-compose -f docker-compose.production.yml build --no-cache backend

REM Start all services
echo [INFO] Starting services...
docker-compose -f docker-compose.production.yml up -d

echo [INFO] Waiting for services to start...
timeout /t 30 /nobreak >nul

echo [INFO] Checking service status...
docker-compose -f docker-compose.production.yml ps

echo [SUCCESS] 🎉 Fix applied! 
echo.
echo 🌐 Frontend: http://172.17.14.65:3000
echo 🔧 Backend:  http://172.17.14.65:8000
echo 📋 Admin:    admin / Admin@123
echo.
echo Check logs: docker-compose -f docker-compose.production.yml logs -f

pause