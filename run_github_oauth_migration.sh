#!/bin/bash

# GitHub OAuth Database Migration Script
# This script runs the database migration to add GitHub OAuth support

echo "🚀 Running GitHub OAuth Database Migration..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if the database container is running
if ! docker-compose ps db | grep -q "Up"; then
    echo "📦 Starting database container..."
    docker-compose up -d db
    echo "⏳ Waiting for database to be ready..."
    sleep 10
fi

# Run the migration
echo "📊 Executing GitHub OAuth migration..."
docker-compose exec -T db psql -U postgres -d versionintel -f /docker-entrypoint-initdb.d/migration_add_github_oauth.sql

if [ $? -eq 0 ]; then
    echo "✅ GitHub OAuth migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env files with GitHub OAuth credentials"
    echo "2. Restart the services: docker-compose restart"
    echo "3. Test the GitHub OAuth login"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi