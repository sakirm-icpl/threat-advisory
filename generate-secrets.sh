#!/bin/bash

# VersionIntel Secrets Generator
# =============================

echo "🔐 VersionIntel Secrets Generator"
echo "================================"
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL not found. Please install openssl first."
    exit 1
fi

echo "Generating secure secrets for your .env file..."
echo ""

echo "# Generated Secrets for VersionIntel"
echo "# =================================="
echo ""

echo "# Database Configuration"
echo "POSTGRES_USER=versionintel"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
echo "POSTGRES_DB=versionintel"
echo ""

echo "# Security Keys"
echo "SECRET_KEY=$(openssl rand -hex 32)"
echo "JWT_SECRET_KEY=$(openssl rand -hex 32)"
echo ""

echo "# Server Configuration (Update with your server IP)"
echo "SERVER_HOST=localhost"
echo ""

echo "# CORS Configuration (Update with your server IP)"
echo "CORS_ORIGINS=http://localhost:3000,http://localhost:8000"
echo ""

echo "# Application Settings"
echo "FLASK_ENV=production"
echo "FLASK_DEBUG=0"
echo ""

echo "# Optional: GitHub OAuth (Configure later)"
echo "GITHUB_CLIENT_ID=your_github_client_id"
echo "GITHUB_CLIENT_SECRET=your_github_client_secret"
echo ""

echo "# Optional: Google AI (Configure later)"
echo "AI_PROVIDER=gemini"
echo "GOOGLE_API_KEY=your_google_api_key"
echo "GOOGLE_MODEL=gemini-2.0-flash"
echo ""

echo "✅ Copy the above configuration to your .env file"
echo "📝 Don't forget to update SERVER_HOST and CORS_ORIGINS with your actual server IP!"