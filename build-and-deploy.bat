@echo off
REM VersionIntel Build and Deploy Script for Windows
REM This script will first build the images and then deploy using those built images

echo VersionIntel Build and Deploy Script
echo ========================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed. Please install Docker first.
    echo    Visit: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Compose is not installed. Please install Docker Compose first.
    echo    Visit: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo SUCCESS: Docker and Docker Compose are installed

REM Ensure Docker daemon is running (start Docker Desktop if necessary)
echo Checking Docker daemon...
docker info >nul 2>&1
if not errorlevel 1 goto docker_ready

echo Docker daemon is not running. Attempting to start Docker Desktop...
if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
) else (
    echo ERROR: Docker Desktop not found at default path. Please start Docker Desktop manually, then re-run this script.
    echo        Download: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)
echo Waiting for Docker to start (timeout 120s)...
set /a _retries=0

:wait_docker
docker info >nul 2>&1
if not errorlevel 1 goto docker_ready
set /a _retries+=1
if %_retries% GEQ 24 goto docker_timeout
timeout /t 5 /nobreak >nul
goto wait_docker

:docker_timeout
echo ERROR: Docker daemon did not become ready in time.
echo        Ensure WSL 2 is installed and Docker Desktop is configured and running.
echo        Troubleshooting: https://docs.docker.com/desktop/troubleshoot/overview/
pause
exit /b 1

:docker_ready
echo SUCCESS: Docker daemon is running

REM Set server IP to localhost
set SERVER_IP=localhost
echo Using localhost for local development

REM Create frontend .env file if it doesn't exist
if not exist "frontend\.env" (
    echo Creating frontend environment file...
    echo REACT_APP_API_URL=http://%SERVER_IP%:8000 > frontend\.env
    echo SUCCESS: Frontend environment file created with IP: %SERVER_IP%
) else (
    echo SUCCESS: Frontend environment file already exists
    REM Update the API URL to use the correct IP
    powershell -Command "(Get-Content frontend\.env) -replace 'REACT_APP_API_URL=.*', 'REACT_APP_API_URL=http://%SERVER_IP%:8000' | Set-Content frontend\.env"
    echo SUCCESS: Updated frontend environment file with IP: %SERVER_IP%
)

REM Stop any existing containers
echo Stopping any existing containers...
docker-compose down --remove-orphans 2>nul

REM Clean up old images (optional)
echo Cleaning up old images...
docker system prune -f 2>nul

REM STEP 1: Build the images first
echo STEP 1: Building Docker images...
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

REM List the built images
echo Built images:
docker images | findstr versionintel

REM STEP 2: Deploy using the built images
echo.
echo STEP 2: Deploying services using built images...
docker-compose up -d

if errorlevel 1 (
    echo ERROR: Failed to start services with docker-compose.
    pause
    exit /b 1
)

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 15 /nobreak >nul

REM Check if services are running
echo Checking service status...
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo ERROR: Some services failed to start. Check logs with: docker-compose logs
    pause
    exit /b 1
) else (
    echo SUCCESS: All services are running successfully!
)

REM Wait a bit more for health checks
echo Waiting for health checks...
timeout /t 10 /nobreak >nul

REM Test health endpoints
echo Testing health endpoints...
curl -f http://%SERVER_IP%:8000/health >nul 2>&1
if errorlevel 1 (
    echo WARNING: Backend health check failed (this might be normal during startup)
) else (
    echo SUCCESS: Backend health check passed
)

curl -f http://%SERVER_IP%:3000 >nul 2>&1
if errorlevel 1 (
    echo WARNING: Frontend health check failed (this might be normal during startup)
) else (
    echo SUCCESS: Frontend health check passed
)

REM Display access information
echo.
echo SUCCESS: VersionIntel is now running!
echo ==================================
echo.
echo FRONTEND URL: http://%SERVER_IP%:3000
echo.
echo LOGIN CREDENTIALS:
echo    Username: admin
echo    Password: Admin@1234
echo.
echo Additional URLs:
echo    Backend API: http://%SERVER_IP%:8000
echo    API Documentation: http://%SERVER_IP%:8000/docs
echo    Health Check: http://%SERVER_IP%:8000/health
echo    Metrics: http://%SERVER_IP%:8000/metrics
echo.
echo IMPORTANT: Change the default admin password after first login!
echo.
echo Useful Commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo    Rebuild and deploy: build-and-deploy.bat
echo    Check status: docker-compose ps
echo    List images: docker images ^| findstr versionintel
echo.
echo Production Notes:
echo    - Change default passwords in docker-compose.yml
echo    - Update JWT_SECRET_KEY and SECRET_KEY
echo    - Configure SSL/TLS for production use
echo    - Set up proper firewall rules
echo.
echo SUCCESS: Build and deployment completed successfully!
echo.
echo Press any key to exit...
pause >nul
exit /b 0 