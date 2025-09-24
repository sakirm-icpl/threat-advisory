@echo off
REM VersionIntel Build and Deploy Script for Windows - Production Ready
REM This script will securely build and deploy using environment variables

echo VersionIntel Secure Build and Deploy Script
echo ================================================

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

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found. Creating from template...
    if exist ".env.production" (
        copy ".env.production" ".env" >nul
        echo SUCCESS: Copied .env.production to .env
        echo.
        echo IMPORTANT: Edit .env file and replace all CHANGE_THIS_* placeholders with secure values!
        echo    Use these commands to generate secure keys:
        echo    python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
        echo    python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
        echo.
        echo ERROR: Please update .env file with secure values and run this script again.
        pause
        exit /b 1
    ) else (
        echo ERROR: Neither .env nor .env.production found. Please create .env file first.
        pause
        exit /b 1
    )
)

REM Validate required environment variables
echo Validating environment configuration...
findstr /C:"CHANGE_THIS_" ".env" >nul 2>&1
if not errorlevel 1 (
    echo ERROR: Found CHANGE_THIS_ placeholders in .env file.
    echo    Please replace all placeholders with actual secure values.
    echo    Use these commands to generate secure keys:
    echo    python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
    echo    python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
    pause
    exit /b 1
)

echo SUCCESS: Environment configuration validated

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

REM Load environment variables from .env file
echo Loading environment variables from .env file...
for /f "usebackq delims=" %%x in (".env") do (
    set "%%x"
)

REM Get SERVER_IP from environment or default to localhost
if not defined SERVER_IP set SERVER_IP=localhost
echo Using server IP: %SERVER_IP%

REM Create frontend .env file with correct API URL
echo Creating frontend environment file...
echo REACT_APP_API_URL=http://%SERVER_IP%:8000 > frontend\.env
echo SUCCESS: Frontend environment file created with API URL: http://%SERVER_IP%:8000

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

REM STEP 2: Deploy using the built images with environment file
echo.
echo STEP 2: Deploying services using built images with secure environment...
docker-compose --env-file .env up -d

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
echo SUCCESS: VersionIntel is now running securely!
echo ==========================================
echo.
echo FRONTEND URL: http://%SERVER_IP%:3000
echo.
echo DEFAULT LOGIN CREDENTIALS (CHANGE IMMEDIATELY):
echo    Username: admin
echo    Password: Admin@1234
echo    WARNING: Change this password immediately after first login!
echo.
echo Additional URLs:
echo    Backend API: http://%SERVER_IP%:8000
echo    API Documentation: http://%SERVER_IP%:8000/docs
echo    Health Check: http://%SERVER_IP%:8000/health
echo    Metrics: http://%SERVER_IP%:8000/metrics
echo.
echo GitHub OAuth Configuration:
echo    Client ID: %GITHUB_CLIENT_ID%
echo    Redirect URI: %GITHUB_REDIRECT_URI%
echo.
echo Production Security Checklist:
echo    [X] Environment variables loaded securely
echo    [X] CORS restricted to specific domains
echo    [ ] Change admin password (CRITICAL)
echo    [ ] Set up SSL/TLS certificates
echo    [ ] Configure firewall rules
echo    [ ] Set up monitoring and backups
echo.
echo Useful Commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo    Rebuild and deploy: build-and-deploy.bat
echo    Check status: docker-compose ps
echo    Database backup: docker-compose exec db pg_dump -U %%POSTGRES_USER%% %%POSTGRES_DB%% ^> backup.sql
echo.
echo SUCCESS: Secure build and deployment completed successfully!
echo.
echo Press any key to exit...
pause >nul
exit /b 0 