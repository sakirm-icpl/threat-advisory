#!/bin/bash

# VersionIntel Deployment Script for Linux/Mac
# Configure SERVER_IP in .env file or set it as environment variable

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration section
show_header() {
    echo ""
    echo "========================================"
    echo "    VersionIntel Deployment Script     "
    echo "           Linux/Mac Version           "
    echo "========================================"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "   Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed."
        echo "   Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi

    # Ensure Docker daemon is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker and re-run this script."
        exit 1
    fi

    print_success "All prerequisites met"
}

# Load environment configuration
load_environment() {
    print_status "Loading environment configuration..."
    
    if [ -f ".env" ]; then
        export $(grep -v '^#' .env | xargs)
        print_success "Environment variables loaded from .env file"
    else
        print_warning "No .env file found. Creating from template..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_warning "Please edit .env file with your configuration before continuing"
            echo "Press Enter when ready to continue..."
            read
            export $(grep -v '^#' .env | xargs)
        else
            print_error "No env.example file found. Cannot create .env file."
            exit 1
        fi
    fi

    # Set default values if not provided
    SERVER_IP=${SERVER_HOST:-localhost}
    BACKEND_PORT=${BACKEND_PORT:-8000}
    FRONTEND_PORT=${FRONTEND_PORT:-3000}
    
    print_status "Using server IP: $SERVER_IP"
    print_status "Backend port: $BACKEND_PORT"
    print_status "Frontend port: $FRONTEND_PORT"
}

# Clean Docker resources
clean_docker() {
    print_status "Cleaning Docker resources..."
    
    echo "🛑 Stopping all containers..."
    docker stop $(docker ps -aq) 2>/dev/null || true

    echo "🗑️  Removing all containers..."
    docker rm $(docker ps -aq) 2>/dev/null || true

    echo "🧨 Removing all images..."
    docker rmi $(docker images -q) 2>/dev/null || true

    echo "🧹 Removing all volumes..."
    docker volume rm $(docker volume ls -q) 2>/dev/null || true

    echo "🕸️  Removing all networks..."
    docker network rm $(docker network ls -q) 2>/dev/null || true

    echo "✨ Pruning system..."
    docker system prune -a -f

    echo "📦 Pruning volumes..."
    docker volume prune -f

    print_success "All Docker resources cleaned"
}

# Configure frontend environment
configure_frontend() {
    print_status "Configuring frontend environment..."
    
    # Create frontend .env file
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://$SERVER_IP:$BACKEND_PORT
REACT_APP_GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
EOF

    print_success "Frontend environment configured"
}

# Build and deploy services
deploy_services() {
    print_status "Building and deploying services..."
    
    echo "🔨 Building backend image..."
    docker-compose build backend

    echo "🔨 Building frontend image..."
    docker-compose build frontend

    print_success "All images built successfully!"

    echo "🚀 Starting services..."
    docker-compose up -d

    # Wait for services to be ready
    print_status "Waiting for services to be ready (30 seconds)..."
    sleep 30

    # Check if services are running
    print_status "Checking service status..."
    docker-compose ps
}

# Display deployment information
show_deployment_info() {
    echo ""
    echo "========================================"
    echo "        DEPLOYMENT COMPLETE!           "
    echo "========================================"
    echo ""
    echo "🌐 FRONTEND URL: http://$SERVER_IP:$FRONTEND_PORT"
    echo "🛠️  BACKEND API: http://$SERVER_IP:$BACKEND_PORT"
    echo "📚 API DOCS: http://$SERVER_IP:$BACKEND_PORT/apidocs/"
    echo "🏥 HEALTH CHECK: http://$SERVER_IP:$BACKEND_PORT/health"
    echo ""
    echo "🔐 DEFAULT LOGIN CREDENTIALS:"
    echo "   Use GitHub OAuth login"
    echo ""
    echo "📋 Useful Commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo "   Rebuild and deploy: ./deploy-linux.sh"
    echo ""
    echo "🎉 VersionIntel deployed successfully!"
    echo ""
}

# Cleanup function for script interruption
cleanup() {
    print_warning "Deployment interrupted by user"
    exit 1
}

# Trap Ctrl+C
trap cleanup SIGINT

# Main execution
main() {
    show_header
    check_prerequisites
    load_environment
    clean_docker
    configure_frontend
    deploy_services
    show_deployment_info
}

# Run main function
main "$@"