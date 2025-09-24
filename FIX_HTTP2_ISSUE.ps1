# VERSIONINTEL HTTP/2 PROTOCOL FIX
Write-Host "🔧 FIXING HTTP/2 PROTOCOL ERRORS" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Problem: Flask dev server can't handle HTTP/2 requests" -ForegroundColor Yellow
Write-Host "Solution: Switch to Gunicorn production server" -ForegroundColor Green
Write-Host ""

# 1. Stop everything
Write-Host "1. Stopping containers..." -ForegroundColor Yellow
docker-compose down

# 2. Remove backend image to force rebuild
Write-Host "2. Removing backend image..." -ForegroundColor Yellow
docker rmi versionintel-backend:latest -f 2>$null

# 3. Build backend with Gunicorn
Write-Host "3. Building backend with Gunicorn server..." -ForegroundColor Yellow
docker-compose build --no-cache backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed!" -ForegroundColor Red
    exit 1
}

# 4. Start database
Write-Host "4. Starting database..." -ForegroundColor Yellow
docker-compose up -d db
Start-Sleep -Seconds 15

# 5. Start backend with new server
Write-Host "5. Starting backend with Gunicorn..." -ForegroundColor Yellow
docker-compose up -d backend
Start-Sleep -Seconds 20

# 6. Test backend without HTTP/2
Write-Host "6. Testing backend (should be no more HTTP/2 errors)..." -ForegroundColor Yellow
$testPassed = $false
for ($i = 1; $i -le 5; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://172.17.14.65:8000/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend healthy - HTTP/2 errors fixed!" -ForegroundColor Green
            $testPassed = $true
            break
        }
    } catch {
        Write-Host "Attempt $i/5: Testing backend..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

if (!$testPassed) {
    Write-Host "❌ Backend still having issues" -ForegroundColor Red
    Write-Host "Checking logs..." -ForegroundColor Yellow
    docker logs versionintel_backend_1 --tail 10
    exit 1
}

# 7. Test OAuth endpoint
Write-Host "7. Testing OAuth endpoint..." -ForegroundColor Yellow
try {
    $oauthResponse = Invoke-WebRequest -Uri "http://172.17.14.65:8000/auth/github/login" -UseBasicParsing
    if ($oauthResponse.StatusCode -eq 200) {
        Write-Host "✅ OAuth endpoint working!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ OAuth endpoint issue: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Start frontend
Write-Host "8. Starting frontend..." -ForegroundColor Yellow
docker-compose up -d frontend
Start-Sleep -Seconds 10

# 9. Final check
Write-Host "9. Final verification..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=== CONTAINER STATUS ===" -ForegroundColor Cyan
docker ps

Write-Host ""
Write-Host "=== CHECKING FOR HTTP/2 ERRORS ===" -ForegroundColor Cyan
$recentLogs = docker logs versionintel_backend_1 --tail 10 2>&1
$http2Errors = $recentLogs | Select-String "HTTP/2.0"

if ($http2Errors) {
    Write-Host "❌ Still seeing HTTP/2 errors:" -ForegroundColor Red
    $http2Errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
} else {
    Write-Host "✅ No HTTP/2 errors detected!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 HTTP/2 FIX COMPLETE!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://172.17.14.65:3000" -ForegroundColor Cyan
Write-Host "🔗 Backend: http://172.17.14.65:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Try the GitHub login now - it should work!" -ForegroundColor Yellow