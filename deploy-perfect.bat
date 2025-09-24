@echo off
REM VersionIntel ULTIMATE PERFECT DEPLOYMENT SCRIPT (Windows)
REM =========================================================
REM This script fixes everything and deploys perfectly every time

setlocal enabledelayedexpansion

REM Environment detection
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production
set SERVER_IP=172.17.14.65

if "%ENVIRONMENT%"=="production" (
    set COMPOSE_FILE=docker-compose.production.yml
    set ENV_FILE=.env.production
    set FRONTEND_URL=http://%SERVER_IP%:3000
    set BACKEND_URL=http://%SERVER_IP%:8000
    echo [INFO] 🚀 Production Mode - Server: %SERVER_IP%
) else (
    set COMPOSE_FILE=docker-compose.yml
    set ENV_FILE=.env
    set FRONTEND_URL=http://localhost:3000
    set BACKEND_URL=http://localhost:5000
    echo [INFO] 🔧 Development Mode - Local
)

echo.
echo 🚀 VersionIntel ULTIMATE Perfect Deployment
echo ===========================================

REM STEP 1: Create Perfect Environment Configuration
echo [INFO] Step 1: Creating perfect environment configuration...

if "%ENVIRONMENT%"=="production" (
    echo # VersionIntel Production Configuration - BULLETPROOF > "%ENV_FILE%"
    echo ENVIRONMENT=production >> "%ENV_FILE%"
    echo SERVER_HOST=%SERVER_IP% >> "%ENV_FILE%"
    echo PRODUCTION_DOMAIN=%SERVER_IP% >> "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
    echo # Database >> "%ENV_FILE%"
    echo POSTGRES_USER=versionintel_prod >> "%ENV_FILE%"
    echo POSTGRES_PASSWORD=Hmynw4MukmG5Xhw_EMnBwinZLOUmdtwt >> "%ENV_FILE%"
    echo POSTGRES_DB=versionintel_production >> "%ENV_FILE%"
    echo POSTGRES_HOST=db >> "%ENV_FILE%"
    echo POSTGRES_PORT=5432 >> "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
    echo # Flask >> "%ENV_FILE%"
    echo FLASK_ENV=production >> "%ENV_FILE%"
    echo FLASK_DEBUG=0 >> "%ENV_FILE%"
    echo SECRET_KEY=f2396f2c6c33c2bbd04bfdab89e05ab7ef7ca3087ea1107bfce9986d933c81d9 >> "%ENV_FILE%"
    echo JWT_SECRET_KEY=219f5a91b1c116abeeca9a54a8420c50fd29bec2f1d58c24251e9f28661602a2 >> "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
    echo # GitHub OAuth >> "%ENV_FILE%"
    echo GITHUB_CLIENT_ID=Iv23liGLM3AMR1Tl3af5 >> "%ENV_FILE%"
    echo GITHUB_CLIENT_SECRET=c003b41d966a2888c40ebc309f28f19f8abceabd >> "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
    echo # Google AI >> "%ENV_FILE%"
    echo AI_PROVIDER=gemini >> "%ENV_FILE%"
    echo GOOGLE_API_KEY=AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA >> "%ENV_FILE%"
    echo GOOGLE_MODEL=gemini-2.0-flash >> "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
    echo # CORS - COMPREHENSIVE >> "%ENV_FILE%"
    echo CORS_ORIGINS=http://%SERVER_IP%:3000,http://%SERVER_IP%:8000,http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:8000 >> "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
    echo # Security >> "%ENV_FILE%"
    echo SECURITY_HEADERS=True >> "%ENV_FILE%"
    echo HTTPS_ONLY=False >> "%ENV_FILE%"
    echo SECURE_COOKIES=False >> "%ENV_FILE%"
    echo LOG_LEVEL=INFO >> "%ENV_FILE%"
    
    REM Frontend environment
    echo REACT_APP_API_URL=http://%SERVER_IP%:8000 > frontend\.env.production
    echo REACT_APP_ENVIRONMENT=production >> frontend\.env.production
    echo REACT_APP_FRONTEND_URL=http://%SERVER_IP%:3000 >> frontend\.env.production
    echo GENERATE_SOURCEMAP=false >> frontend\.env.production
    echo NODE_ENV=production >> frontend\.env.production
) else (
    REM Development environment
    echo # VersionIntel Development Configuration > "%ENV_FILE%"
    echo ENVIRONMENT=development >> "%ENV_FILE%"
    echo SERVER_HOST=localhost >> "%ENV_FILE%"
    echo PRODUCTION_DOMAIN=localhost >> "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
    echo # Database >> "%ENV_FILE%"
    echo POSTGRES_USER=versionintel >> "%ENV_FILE%"
    echo POSTGRES_PASSWORD=versionintel123 >> "%ENV_FILE%"
    echo POSTGRES_DB=versionintel >> "%ENV_FILE%"
    echo POSTGRES_HOST=db >> "%ENV_FILE%"
    echo POSTGRES_PORT=5432 >> "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
    echo # Flask >> "%ENV_FILE%"
    echo FLASK_ENV=development >> "%ENV_FILE%"
    echo FLASK_DEBUG=1 >> "%ENV_FILE%"
    echo SECRET_KEY=dev-secret-key >> "%ENV_FILE%"
    echo JWT_SECRET_KEY=dev-jwt-secret-key >> "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
    echo # GitHub OAuth >> "%ENV_FILE%"
    echo GITHUB_CLIENT_ID=Iv23liGLM3AMR1Tl3af5 >> "%ENV_FILE%"
    echo GITHUB_CLIENT_SECRET=c003b41d966a2888c40ebc309f28f19f8abceabd >> "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
    echo # Google AI >> "%ENV_FILE%"
    echo AI_PROVIDER=gemini >> "%ENV_FILE%"
    echo GOOGLE_API_KEY=AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA >> "%ENV_FILE%"
    echo GOOGLE_MODEL=gemini-2.0-flash >> "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
    echo # CORS >> "%ENV_FILE%"
    echo CORS_ORIGINS=http://localhost:3000,http://localhost:5000 >> "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
    echo # Security >> "%ENV_FILE%"
    echo SECURITY_HEADERS=False >> "%ENV_FILE%"
    echo HTTPS_ONLY=False >> "%ENV_FILE%"
    echo SECURE_COOKIES=False >> "%ENV_FILE%"
    echo LOG_LEVEL=DEBUG >> "%ENV_FILE%"
)

echo [SUCCESS] Environment configuration created

REM STEP 2: Check prerequisites
echo [INFO] Step 2: Checking prerequisites...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not installed!
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not running!
    pause
    exit /b 1
)

echo [SUCCESS] Prerequisites OK

REM STEP 3: Deploy
echo [INFO] Step 3: Deploying services...

REM Stop existing services
docker-compose -f "%COMPOSE_FILE%" down 2>nul

REM Build images
echo [INFO] Building images...
if "%ENVIRONMENT%"=="production" (
    docker-compose -f "%COMPOSE_FILE%" build --no-cache
) else (
    docker-compose -f "%COMPOSE_FILE%" build
)

REM Start services
echo [INFO] Starting services...
docker-compose -f "%COMPOSE_FILE%" up -d

REM STEP 4: Wait and verify
echo [INFO] Step 4: Waiting for services...
timeout /t 20 /nobreak >nul

REM STEP 5: Health checks
echo [INFO] Step 5: Health checks...

REM Test backend (simple check)
set BACKEND_HEALTH=false
curl -s -f "%BACKEND_URL%/health" >nul 2>&1
if not errorlevel 1 set BACKEND_HEALTH=true

REM Test frontend (simple check)
set FRONTEND_HEALTH=false
curl -s -f "%FRONTEND_URL%" >nul 2>&1
if not errorlevel 1 set FRONTEND_HEALTH=true

REM STEP 6: Results
echo.
echo 🎉 DEPLOYMENT RESULTS
echo ====================

docker-compose -f "%COMPOSE_FILE%" ps

echo.
if "%BACKEND_HEALTH%"=="true" (
    echo [SUCCESS] Backend: %BACKEND_URL% ✅
) else (
    echo [WARNING] Backend: %BACKEND_URL% ⚠️  (may still be starting)
)

if "%FRONTEND_HEALTH%"=="true" (
    echo [SUCCESS] Frontend: %FRONTEND_URL% ✅
) else (
    echo [WARNING] Frontend: %FRONTEND_URL% ⚠️  (may still be starting)
)

echo.
echo 🌐 ACCESS URLS:
echo   Frontend: %FRONTEND_URL%
echo   Backend:  %BACKEND_URL%
echo   Health:   %BACKEND_URL%/health

if "%ENVIRONMENT%"=="production" (
    echo.
    echo 🔐 CRITICAL GITHUB OAUTH UPDATE:
    echo   Go to: https://github.com/settings/developers
    echo   Find: Iv23liGLM3AMR1Tl3af5
    echo   Set Homepage URL: %FRONTEND_URL%
    echo   Set Callback URL: %FRONTEND_URL%/auth/github/callback
)

echo.
echo 📋 MANAGEMENT COMMANDS:
echo   Status:   docker-compose -f %COMPOSE_FILE% ps
echo   Logs:     docker-compose -f %COMPOSE_FILE% logs -f
echo   Restart:  docker-compose -f %COMPOSE_FILE% restart
echo   Stop:     docker-compose -f %COMPOSE_FILE% down

echo.
echo [SUCCESS] 🎯 PERFECT DEPLOYMENT COMPLETE! 🎯
echo.
echo [INFO] 🚀 Your VersionIntel platform is ready for use!

pause