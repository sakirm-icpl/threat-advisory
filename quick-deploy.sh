#!/bin/bash

# Quick Deployment Script for VersionIntel
# ========================================

set -e

echo "🚀 VersionIntel Quick Deploy"
echo "============================"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the VersionIntel directory"
    exit 1
fi

# Check if .env exists, if not create it
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    if [ -f ".env.template" ]; then
        cp .env.template .env
        echo "✅ .env file created from template"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env file and update:"
        echo "   - SERVER_HOST (your server IP)"
        echo "   - GITHUB_CLIENT_ID (from GitHub OAuth app)"
        echo "   - GITHUB_CLIENT_SECRET (from GitHub OAuth app)"
        echo ""
        echo "Then run this script again."
        exit 0
    else
        echo "❌ .env.template not found"
        exit 1
    fi
fi

# Load environment
source .env

# Quick validation
if [ -z "$GITHUB_CLIENT_ID" ] || [ "$GITHUB_CLIENT_ID" = "your_github_client_id" ]; then
    echo "❌ GitHub OAuth not configured!"
    echo "   Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env"
    echo "   GitHub OAuth setup: https://github.com/settings/developers"
    exit 1
fi

echo "✅ Configuration validated"
echo ""

# Deploy
echo "🔨 Deploying VersionIntel..."
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services..."
sleep 20

# Check status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access: http://${SERVER_HOST:-localhost}:3000"
echo "🔑 Login: GitHub OAuth only"
echo ""
echo "📋 Next steps:"
echo "1. Login with GitHub"
echo "2. Grant admin privileges: docker-compose exec db psql -U versionintel -c \"UPDATE users SET role='admin' WHERE github_username='YOUR_USERNAME';\""
echo ""