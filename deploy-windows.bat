@echo off
setlocal enabledelayedexpansion

REM VersionIntel Deployment Script for Windows
REM Configure SERVER_IP in .env file or set it as environment variable

echo.
echo ========================================
echo     VersionIntel Deployment Script     
echo           Windows Version             
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    echo    Visit: https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed.
    echo    Visit: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo [INFO] Docker and Docker Compose are installed

REM Check if Docker daemon is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon is not running. Please start Docker Desktop and re-run this script.
    pause
    exit /b 1
)

echo [SUCCESS] Docker daemon is running

REM Load environment variables
echo [INFO] Loading environment configuration...
if exist ".env" (
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a"=="#*" (
            set "%%a=%%b"
        )
    )
    echo [SUCCESS] Environment variables loaded from .env file
) else (
    echo [WARNING] No .env file found. Creating from template...
    if exist "env.example" (
        copy "env.example" ".env"
        echo [WARNING] Please edit .env file with your configuration before continuing
        echo Press any key when ready to continue...
        pause >nul
        for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
            if not "%%a"=="" if not "%%a"=="#*" (
                set "%%a=%%b"
            )
        )
    ) else (
        echo [ERROR] No env.example file found. Cannot create .env file.
        pause
        exit /b 1
    )
)

REM Set default values if not provided
if not defined SERVER_HOST set SERVER_HOST=localhost
if not defined BACKEND_PORT set BACKEND_PORT=8000
if not defined FRONTEND_PORT set FRONTEND_PORT=3000

set SERVER_IP=%SERVER_HOST%

echo [INFO] Using server IP: %SERVER_IP%
echo [INFO] Backend port: %BACKEND_PORT%
echo [INFO] Frontend port: %FRONTEND_PORT%

REM Clean Docker resources
echo.
echo ========================================
echo        CLEANING DOCKER RESOURCES
echo ========================================

echo [INFO] Stopping all containers...
for /f "tokens=*" %%i in ('docker ps -aq 2^>nul') do docker stop %%i >nul 2>&1

echo [INFO] Removing all containers...
for /f "tokens=*" %%i in ('docker ps -aq 2^>nul') do docker rm %%i >nul 2>&1

echo [INFO] Removing all images...
for /f "tokens=*" %%i in ('docker images -q 2^>nul') do docker rmi %%i >nul 2>&1

echo [INFO] Removing all volumes...
for /f "tokens=*" %%i in ('docker volume ls -q 2^>nul') do docker volume rm %%i >nul 2>&1

echo [INFO] Removing all networks...
for /f "tokens=*" %%i in ('docker network ls --format "{{.ID}}" 2^>nul') do (
    docker network inspect %%i >nul 2>&1 && (
        docker network rm %%i >nul 2>&1 || echo Network %%i in use, skipping...
    )
)

echo [INFO] Pruning system...
docker system prune -a -f

echo [INFO] Pruning volumes...
docker volume prune -f

echo [SUCCESS] All Docker resources cleaned

REM Configure frontend environment
echo [INFO] Configuring frontend environment...

echo REACT_APP_API_URL=http://%SERVER_IP%:%BACKEND_PORT% > frontend\.env
echo REACT_APP_GITHUB_CLIENT_ID=%GITHUB_CLIENT_ID% >> frontend\.env

echo [SUCCESS] Frontend environment configured

REM Build and deploy services
echo.
echo ========================================
echo     BUILDING AND DEPLOYING SERVICES
echo ========================================

echo [INFO] Building backend image...
docker-compose build backend
if errorlevel 1 (
    echo [ERROR] Failed to build backend image
    pause
    exit /b 1
)

echo [INFO] Building frontend image...
docker-compose build frontend
if errorlevel 1 (
    echo [ERROR] Failed to build frontend image
    pause
    exit /b 1
)

echo [SUCCESS] All images built successfully!

echo [INFO] Starting services...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready (30 seconds)...
timeout /t 30 /nobreak >nul

REM Check if services are running
echo [INFO] Checking service status...
docker-compose ps

REM Display deployment information
echo.
echo ========================================
echo        DEPLOYMENT COMPLETE!           
echo ========================================
echo.
echo 🌐 FRONTEND URL: http://%SERVER_IP%:%FRONTEND_PORT%
echo 🛠️  BACKEND API: http://%SERVER_IP%:%BACKEND_PORT%
echo 📚 API DOCS: http://%SERVER_IP%:%BACKEND_PORT%/apidocs/
echo 🏥 HEALTH CHECK: http://%SERVER_IP%:%BACKEND_PORT%/health
echo.
echo 🔐 DEFAULT LOGIN CREDENTIALS:
echo    Use GitHub OAuth login
echo.
echo 📋 Useful Commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo    Rebuild and deploy: deploy-windows.bat
echo.
echo 🎉 VersionIntel deployed successfully!
echo.

pause