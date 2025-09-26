@echo off
REM VersionIntel Clean Deployment Script for Windows
REM This script cleans all Docker resources and starts fresh deployment

echo ========================================
echo VersionIntel Clean Deployment Script
echo ========================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed. Please install Docker Desktop first.
    echo    Visit: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Compose is not installed.
    echo    Visit: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo SUCCESS: Docker and Docker Compose are installed

REM Ensure Docker daemon is running
echo Checking Docker daemon...
docker info >nul 2>&1
if not errorlevel 1 goto docker_ready

echo Docker daemon is not running. Please start Docker Desktop and re-run this script.
echo    Download: https://docs.docker.com/desktop/install/windows-install/
pause
exit /b 1

:docker_ready
echo SUCCESS: Docker daemon is running

REM Clean up everything
echo.
echo ========================================
echo CLEANING DOCKER RESOURCES
echo ========================================

echo Stopping all containers...
docker stop $(docker ps -aq) 2>nul

echo Removing all containers...
docker rm $(docker ps -aq) 2>nul

echo Removing all images...
docker rmi $(docker images -q) 2>nul

echo Removing all volumes...
docker volume rm $(docker volume ls -q) 2>nul

echo Removing all networks...
docker network rm $(docker network ls -q) 2>nul

echo Pruning system...
docker system prune -a -f

echo Pruning volumes...
docker volume prune -f

echo SUCCESS: All Docker resources cleaned

REM Set server IP to localhost
set SERVER_IP=localhost
echo Using localhost for local development

REM Create frontend .env file if it doesn't exist
if not exist "frontend\.env" (
    echo Creating frontend environment file...
    echo REACT_APP_API_URL=http://%SERVER_IP%:8000 > frontend\.env
    echo REACT_APP_GITHUB_CLIENT_ID=Ov23licijFemPDL32cZK >> frontend\.env
    echo SUCCESS: Frontend environment file created
) else (
    echo SUCCESS: Frontend environment file already exists
    REM Update the API URL to use the correct IP
    powershell -Command "(Get-Content frontend\.env) -replace 'REACT_APP_API_URL=.*', 'REACT_APP_API_URL=http://%SERVER_IP%:8000' | Set-Content frontend\.env"
    echo SUCCESS: Updated frontend environment file
)

REM Build and deploy
echo.
echo ========================================
echo BUILDING AND DEPLOYING SERVICES
echo ========================================

echo Building backend image...
docker-compose build backend

if errorlevel 1 (
    echo ERROR: Backend image build failed.
    pause
    exit /b 1
)

echo Building frontend image...
docker-compose build frontend

if errorlevel 1 (
    echo ERROR: Frontend image build failed.
    pause
    exit /b 1
)

echo SUCCESS: All images built successfully!

echo Starting services...
docker-compose up -d

if errorlevel 1 (
    echo ERROR: Failed to start services.
    pause
    exit /b 1
)

REM Wait for services to be ready
echo Waiting for services to be ready (30 seconds)...
timeout /t 30 /nobreak >nul

REM Check if services are running
echo Checking service status...
docker-compose ps

REM Display access information
echo.
echo ========================================
echo DEPLOYMENT COMPLETE
echo ========================================
echo.
echo 🌐 FRONTEND URL: http://%SERVER_IP%:3000
echo 🛠️  BACKEND API: http://%SERVER_IP%:8000
echo 📚 API DOCS: http://%SERVER_IP%:8000/docs
echo 🏥 HEALTH CHECK: http://%SERVER_IP%:8000/health
echo.
echo 🔐 DEFAULT LOGIN CREDENTIALS:
echo    Username: admin
echo    Password: Admin@1234
echo.
echo ⚠️  IMPORTANT: Change the default admin password after first login!
echo.
echo 📋 Useful Commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo    Rebuild and deploy: deploy.bat
echo.
echo SUCCESS: VersionIntel deployed successfully!
echo.
pause