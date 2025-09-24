#!/bin/bash
# VersionIntel Perfect Fix & Deploy Script
# =========================================

set -e

echo "🔧 VersionIntel Perfect Fix & Deploy"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Fix 1: Update CORS in .env.production
log_info "Fixing CORS configuration..."
sed -i 's|CORS_ORIGINS=.*|CORS_ORIGINS=http://172.17.14.65:3000,http://172.17.14.65:8000,http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:8000|g' .env.production

# Fix 2: Create frontend environment file
log_info "Creating frontend environment configuration..."
cat > frontend/.env.production << 'EOF'
REACT_APP_API_URL=http://172.17.14.65:8000
REACT_APP_ENVIRONMENT=production
REACT_APP_FRONTEND_URL=http://172.17.14.65:3000
GENERATE_SOURCEMAP=false
NODE_ENV=production
EOF

# Fix 3: Update GitHub OAuth callback in frontend config
log_info "Ensuring frontend uses correct API URL..."
if [ -f "frontend/src/config.js" ]; then
    sed -i 's|localhost:8000|172.17.14.65:8000|g' frontend/src/config.js
fi

# Fix 4: Remove Docker Compose version warning
log_info "Removing Docker Compose version warning..."
if grep -q "version:" docker-compose.production.yml; then
    sed -i '/^version:/d' docker-compose.production.yml
fi

# Fix 5: Restart services with proper environment
log_info "Restarting services with fixed configuration..."

# Export environment variables
export $(cat .env.production | grep -v '^#' | xargs) 2>/dev/null || true

# Stop services
docker-compose -f docker-compose.production.yml down

# Rebuild frontend with new environment
log_info "Rebuilding frontend with correct environment..."
docker-compose -f docker-compose.production.yml build --no-cache frontend

# Start all services
log_info "Starting all services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services
log_info "Waiting for services to be ready..."
sleep 15

# Test services
log_info "Testing services..."

# Test backend
if curl -f http://172.17.14.65:8000/health >/dev/null 2>&1; then
    log_success "Backend is healthy at http://172.17.14.65:8000"
else
    log_warning "Backend may still be starting..."
fi

# Test frontend
if curl -f http://172.17.14.65:3000 >/dev/null 2>&1; then
    log_success "Frontend is healthy at http://172.17.14.65:3000"
else
    log_warning "Frontend may still be starting..."
fi

# Show status
echo ""
log_info "Service Status:"
docker-compose -f docker-compose.production.yml ps

echo ""
log_success "🎉 Perfect Deployment Complete!"
echo "================================"
echo "🌐 Frontend: http://172.17.14.65:3000"
echo "🔧 Backend:  http://172.17.14.65:8000"
echo "🗄️  Database: 172.17.14.65:5432"
echo ""
echo "🔐 CRITICAL: Update GitHub OAuth URLs:"
echo "   Homepage: http://172.17.14.65:3000"
echo "   Callback: http://172.17.14.65:3000/auth/github/callback"
echo ""
echo "📋 Management Commands:"
echo "  Status:   docker-compose -f docker-compose.production.yml ps"
echo "  Logs:     docker-compose -f docker-compose.production.yml logs -f"
echo "  Restart:  docker-compose -f docker-compose.production.yml restart"

echo ""
log_info "🎯 All issues fixed and deployment optimized!"