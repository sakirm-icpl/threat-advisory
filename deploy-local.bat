@echo off
REM VersionIntel Local Deployment Script (Windows)
REM Usage: deploy-local.bat

echo 🚀 VersionIntel Local Deployment
echo =================================

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Copy local environment configuration
if not exist .env (
    echo 📋 Creating .env from .env.local template...
    copy .env.local .env >nul
    echo ⚠️  Please update .env with your GitHub OAuth credentials
) else (
    echo ✅ .env file exists
)

REM Create frontend environment file
echo 📝 Creating frontend environment configuration...
echo REACT_APP_API_URL=http://localhost:8000 > frontend\.env

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down >nul 2>&1

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up -d --build

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Initialize database
echo 🗃️  Initializing database...
docker-compose exec -T backend python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all(); print('Database initialized successfully!')" 2>nul || echo ⚠️  Database may already be initialized

REM Show status
echo.
echo 📊 Service Status:
docker-compose ps

echo.
echo 🎉 VersionIntel Local Deployment Complete!
echo ==========================================
echo 🌐 Frontend:  http://localhost:3000
echo 🔧 Backend:   http://localhost:8000
echo 🗃️  Database: localhost:5432
echo.
echo 📋 Useful Commands:
echo   View logs:     docker-compose logs -f
echo   Stop services: docker-compose down
echo   Restart:       docker-compose restart
echo.
echo ⚙️  Next Steps:
echo   1. Update .env with your GitHub OAuth credentials
echo   2. Access the application at http://localhost:3000
echo   3. Use 'Demo Account' or configure GitHub OAuth

pause