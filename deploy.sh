#!/bin/bash
# VersionIntel Universal Deployment Script
# ========================================
# Works for both development and production environments
# Usage: ./deploy.sh [dev|prod]

set -e

# Configuration
ENVIRONMENT=${1:-prod}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Environment-specific configuration
if [[ "$ENVIRONMENT" == "dev" || "$ENVIRONMENT" == "development" ]]; then
    ENV_FILE=".env"
    COMPOSE_FILE="docker-compose.yml"
    FRONTEND_URL="http://localhost:3000"
    BACKEND_URL="http://localhost:5000"
    log_info "🔧 Development Environment"
else
    ENV_FILE=".env.production"
    COMPOSE_FILE="docker-compose.production.yml"
    FRONTEND_URL="http://172.17.14.65:3000"
    BACKEND_URL="http://172.17.14.65:8000"
    log_info "🚀 Production Environment"
fi

# Display header
echo ""
echo "═══════════════════════════════════"
echo "    VersionIntel Deployment"
echo "═══════════════════════════════════"
echo ""

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed."
        exit 1
    fi
    
    log_success "Prerequisites OK"
}

# Environment setup
setup_environment() {
    log_info "Setting up environment..."
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file $ENV_FILE not found!"
        log_info "Please ensure the environment file exists with proper configuration."
        exit 1
    fi
    
    # Load environment variables
    set -a
    source "$ENV_FILE"
    set +a
    
    log_success "Environment loaded from $ENV_FILE"
}

# Deployment process
deploy() {
    log_info "Starting deployment..."
    
    # Stop existing services
    log_info "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true
    
    # Clean up unused images
    log_info "Cleaning up unused Docker images..."
    docker image prune -f || true
    
    # Build and start services
    log_info "Building and starting services..."
    if [[ "$ENVIRONMENT" == "prod" || "$ENVIRONMENT" == "production" ]]; then
        docker-compose -f "$COMPOSE_FILE" build --no-cache
    else
        docker-compose -f "$COMPOSE_FILE" build
    fi
    
    docker-compose -f "$COMPOSE_FILE" up -d
    
    log_success "Services deployed"
}

# Wait for services to be ready
wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    # Wait for backend health check
    local max_retries=30
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if curl -s -f "$BACKEND_URL/health" > /dev/null 2>&1; then
            log_success "Backend is healthy"
            break
        fi
        
        retry_count=$((retry_count + 1))
        echo "Waiting for backend... ($retry_count/$max_retries)"
        sleep 3
    done
    
    if [ $retry_count -eq $max_retries ]; then
        log_warning "Backend health check timeout, but continuing..."
    fi
    
    # Wait for frontend
    retry_count=0
    while [ $retry_count -lt 10 ]; do
        if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
            log_success "Frontend is healthy"
            break
        fi
        
        retry_count=$((retry_count + 1))
        echo "Waiting for frontend... ($retry_count/10)"
        sleep 2
    done
    
    if [ $retry_count -eq 10 ]; then
        log_warning "Frontend health check timeout, but continuing..."
    fi
}

# Show deployment results
show_results() {
    echo ""
    log_info "Deployment Results:"
    echo "══════════════════════════════════"
    
    # Show service status
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend: $FRONTEND_URL"
    echo "   Backend:  $BACKEND_URL"
    echo "   Health:   $BACKEND_URL/health"
    
    if [[ "$ENVIRONMENT" == "prod" || "$ENVIRONMENT" == "production" ]]; then
        echo ""
        echo "🔐 IMPORTANT - GitHub OAuth Setup:"
        echo "   1. Go to: https://github.com/settings/developers"
        echo "   2. Find OAuth App: Iv23liGLM3AMR1Tl3af5"
        echo "   3. Update URLs:"
        echo "      - Homepage URL: $FRONTEND_URL"
        echo "      - Callback URL: $FRONTEND_URL/auth/github/callback"
        echo ""
        echo "📋 Default Admin Account:"
        echo "   Username: admin"
        echo "   Password: Admin@123"
        echo "   (Change password after first login)"
    fi
    
    echo ""
    echo "📋 Management Commands:"
    echo "   Status:   docker-compose -f $COMPOSE_FILE ps"
    echo "   Logs:     docker-compose -f $COMPOSE_FILE logs -f"
    echo "   Restart:  docker-compose -f $COMPOSE_FILE restart"
    echo "   Stop:     docker-compose -f $COMPOSE_FILE down"
    
    echo ""
    log_success "🎉 Deployment Complete!"
}

# Main execution
main() {
    check_prerequisites
    setup_environment
    
    echo ""
    log_warning "Deploy VersionIntel in $ENVIRONMENT mode?"
    echo "This will rebuild and restart all services."
    read -p "Continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled."
        exit 0
    fi
    
    deploy
    wait_for_services
    show_results
}

# Help
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "VersionIntel Universal Deployment Script"
    echo "========================================"
    echo ""
    echo "Usage: $0 [environment]"
    echo ""
    echo "Environments:"
    echo "  dev, development  - Development environment (default ports)"
    echo "  prod, production  - Production environment (default)"
    echo ""
    echo "Examples:"
    echo "  $0              # Deploy in production mode"
    echo "  $0 prod         # Deploy in production mode"
    echo "  $0 dev          # Deploy in development mode"
    echo ""
    echo "Prerequisites:"
    echo "  - Docker and Docker Compose installed"
    echo "  - Environment files configured (.env or .env.production)"
    echo "  - GitHub OAuth app configured for your domain"
    exit 0
fi

# Run main function
main "$@"