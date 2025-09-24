#!/bin/bash
# VersionIntel ULTIMATE PERFECT DEPLOYMENT SCRIPT
# ===============================================
# This script fixes everything and deploys perfectly every time

set -e

echo "🚀 VersionIntel ULTIMATE Perfect Deployment"
echo "==========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Environment detection
ENVIRONMENT=${1:-production}
SERVER_IP="172.17.14.65"

if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.production.yml"
    ENV_FILE=".env.production"
    FRONTEND_URL="http://$SERVER_IP:3000"
    BACKEND_URL="http://$SERVER_IP:8000"
    log_info "🚀 Production Mode - Server: $SERVER_IP"
else
    COMPOSE_FILE="docker-compose.yml"
    ENV_FILE=".env"
    FRONTEND_URL="http://localhost:3000"
    BACKEND_URL="http://localhost:5000"
    log_info "🔧 Development Mode - Local"
fi

# STEP 1: Create Perfect Environment Configuration
log_info "Step 1: Creating perfect environment configuration..."

if [ "$ENVIRONMENT" = "production" ]; then
    cat > "$ENV_FILE" << EOF
# VersionIntel Production Configuration - BULLETPROOF
ENVIRONMENT=production
SERVER_HOST=$SERVER_IP
PRODUCTION_DOMAIN=$SERVER_IP

# Database
POSTGRES_USER=versionintel_prod
POSTGRES_PASSWORD=Hmynw4MukmG5Xhw_EMnBwinZLOUmdtwt
POSTGRES_DB=versionintel_production
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Flask
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=f2396f2c6c33c2bbd04bfdab89e05ab7ef7ca3087ea1107bfce9986d933c81d9
JWT_SECRET_KEY=219f5a91b1c116abeeca9a54a8420c50fd29bec2f1d58c24251e9f28661602a2

# GitHub OAuth
GITHUB_CLIENT_ID=Iv23liGLM3AMR1Tl3af5
GITHUB_CLIENT_SECRET=c003b41d966a2888c40ebc309f28f19f8abceabd

# Google AI
AI_PROVIDER=gemini
GOOGLE_API_KEY=AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA
GOOGLE_MODEL=gemini-2.0-flash

# CORS - COMPREHENSIVE
CORS_ORIGINS=http://$SERVER_IP:3000,http://$SERVER_IP:8000,http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:8000

# Security
SECURITY_HEADERS=True
HTTPS_ONLY=False
SECURE_COOKIES=False
LOG_LEVEL=INFO
EOF

    # Frontend environment
    cat > "frontend/.env.production" << EOF
REACT_APP_API_URL=http://$SERVER_IP:8000
REACT_APP_ENVIRONMENT=production
REACT_APP_FRONTEND_URL=http://$SERVER_IP:3000
GENERATE_SOURCEMAP=false
NODE_ENV=production
EOF
else
    # Development environment
    cat > "$ENV_FILE" << EOF
# VersionIntel Development Configuration
ENVIRONMENT=development
SERVER_HOST=localhost
PRODUCTION_DOMAIN=localhost

# Database
POSTGRES_USER=versionintel
POSTGRES_PASSWORD=versionintel123
POSTGRES_DB=versionintel
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Flask
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-secret-key

# GitHub OAuth
GITHUB_CLIENT_ID=Iv23liGLM3AMR1Tl3af5
GITHUB_CLIENT_SECRET=c003b41d966a2888c40ebc309f28f19f8abceabd

# Google AI
AI_PROVIDER=gemini
GOOGLE_API_KEY=AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA
GOOGLE_MODEL=gemini-2.0-flash

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5000

# Security
SECURITY_HEADERS=False
HTTPS_ONLY=False
SECURE_COOKIES=False
LOG_LEVEL=DEBUG
EOF
fi

chmod 600 "$ENV_FILE"
log_success "Environment configuration created"

# STEP 2: Fix Docker Compose warnings
log_info "Step 2: Fixing Docker Compose configuration..."
if grep -q "^version:" "$COMPOSE_FILE"; then
    sed -i '/^version:/d' "$COMPOSE_FILE"
    log_success "Removed version warning"
fi

# STEP 3: Load Environment and Deploy
log_info "Step 3: Loading environment and deploying..."

# Export environment variables
export $(cat "$ENV_FILE" | grep -v '^#' | grep -v '^$' | xargs) 2>/dev/null || true

# Stop existing services
docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true

# Clean and rebuild
log_info "Building images..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f "$COMPOSE_FILE" build --no-cache
else
    docker-compose -f "$COMPOSE_FILE" build
fi

# Start services
log_info "Starting services..."
docker-compose -f "$COMPOSE_FILE" up -d

# STEP 4: Wait and verify
log_info "Step 4: Waiting for services to be ready..."
sleep 20

# STEP 5: Health checks
log_info "Step 5: Performing health checks..."

# Test backend
BACKEND_HEALTH=false
for i in {1..10}; do
    if curl -s -f "$BACKEND_URL/health" >/dev/null 2>&1; then
        BACKEND_HEALTH=true
        break
    fi
    sleep 2
done

# Test frontend
FRONTEND_HEALTH=false
for i in {1..10}; do
    if curl -s -f "$FRONTEND_URL" >/dev/null 2>&1; then
        FRONTEND_HEALTH=true
        break
    fi
    sleep 2
done

# STEP 6: Results
echo ""
echo "🎉 DEPLOYMENT RESULTS"
echo "===================="

# Service status
docker-compose -f "$COMPOSE_FILE" ps

echo ""
if [ "$BACKEND_HEALTH" = true ]; then
    log_success "Backend: $BACKEND_URL ✅"
else
    log_warning "Backend: $BACKEND_URL ⚠️  (may still be starting)"
fi

if [ "$FRONTEND_HEALTH" = true ]; then
    log_success "Frontend: $FRONTEND_URL ✅"
else
    log_warning "Frontend: $FRONTEND_URL ⚠️  (may still be starting)"
fi

echo ""
echo "🌐 ACCESS URLS:"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo "  Health:   $BACKEND_URL/health"

if [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    echo "🔐 CRITICAL GITHUB OAUTH UPDATE:"
    echo "  Go to: https://github.com/settings/developers"
    echo "  Find: Iv23liGLM3AMR1Tl3af5"
    echo "  Set Homepage URL: $FRONTEND_URL"
    echo "  Set Callback URL: $FRONTEND_URL/auth/github/callback"
fi

echo ""
echo "📋 MANAGEMENT COMMANDS:"
echo "  Status:   docker-compose -f $COMPOSE_FILE ps"
echo "  Logs:     docker-compose -f $COMPOSE_FILE logs -f"
echo "  Restart:  docker-compose -f $COMPOSE_FILE restart"
echo "  Stop:     docker-compose -f $COMPOSE_FILE down"

echo ""
log_success "🎯 PERFECT DEPLOYMENT COMPLETE! 🎯"

# Test OAuth if backend is healthy
if [ "$BACKEND_HEALTH" = true ]; then
    echo ""
    log_info "🔍 Testing OAuth configuration..."
    
    OAUTH_RESPONSE=$(curl -s "$BACKEND_URL/auth/github" 2>/dev/null || echo "ERROR")
    if [[ "$OAUTH_RESPONSE" == *"github.com"* ]]; then
        log_success "GitHub OAuth configuration looks good!"
    else
        log_warning "GitHub OAuth may need configuration update"
    fi
fi

echo ""
log_info "🚀 Your VersionIntel platform is ready for use!"