#!/bin/bash

# VersionIntel Simple Deployment Script
# ====================================

set -e

ENV=${1:-prod}
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 VersionIntel Deployment${NC}"
echo "============================"
echo ""

# Determine configuration
if [ "$ENV" = "prod" ] || [ "$ENV" = "production" ]; then
    COMPOSE_FILE="docker-compose.production.yml"
    ENV_FILE=".env.production"
    echo -e "${YELLOW}📋 Production Mode${NC}"
else
    COMPOSE_FILE="docker-compose.yml"
    ENV_FILE=".env"
    echo -e "${YELLOW}📋 Development Mode${NC}"
fi

# Check environment file
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Environment file $ENV_FILE not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Using: $COMPOSE_FILE with $ENV_FILE${NC}"
echo ""

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f $COMPOSE_FILE down --remove-orphans 2>/dev/null || true

# Remove old images for clean build
echo -e "${YELLOW}🧹 Cleaning old images...${NC}"
docker rmi versionintel_backend versionintel_frontend 2>/dev/null || true

# Build and start
echo -e "${YELLOW}🔨 Building and starting services...${NC}"
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --build

# Wait for startup
echo -e "${YELLOW}⏳ Waiting for services...${NC}"
sleep 15

# Show status
echo -e "${GREEN}📊 Status:${NC}"
docker ps

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "${GREEN}🌐 Access:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo -e "${GREEN}🔑 Default Login:${NC}"
echo "   Username: admin"
echo "   Password: Admin@123"
echo ""
echo -e "${YELLOW}📝 View logs: docker-compose -f $COMPOSE_FILE logs -f${NC}"