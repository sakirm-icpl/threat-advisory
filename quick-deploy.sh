#!/bin/bash
# Quick deployment for existing VersionIntel directory
# Use this when you already have the files and just want to deploy

# Configuration - modify these for your server
SERVER_IP="${SERVER_IP:-172.17.14.65}"
GITHUB_CLIENT_ID="Iv23liGLM3AMR1Tl3af5"
GITHUB_CLIENT_SECRET="d9e38560dc244f312b4bb028a850cd7bda91a264"
NVD_API_KEY="523ff249-3119-49fa-a1d6-31ba53131052"
GOOGLE_API_KEY="AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA"

echo "🚀 VersionIntel Quick Deploy"
echo "============================"

# Detect Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "Installing Python..."
    sudo apt update && sudo apt install -y python3
    PYTHON_CMD="python3"
fi

# Generate keys
echo "🔐 Generating secure keys..."
SECRET_KEY=$($PYTHON_CMD -c "import secrets; print(secrets.token_hex(32))")
JWT_SECRET_KEY=$($PYTHON_CMD -c "import secrets; print(secrets.token_hex(32))")
POSTGRES_PASSWORD=$($PYTHON_CMD -c "import secrets, string; chars = string.ascii_letters + string.digits + '!@#\$%^&*'; print(''.join(secrets.choice(chars) for i in range(32)))")

# Create .env
echo "📝 Creating environment..."
cat > .env << EOF
SERVER_IP=$SERVER_IP
POSTGRES_USER=versionintel_prod
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=versionintel
SECRET_KEY=$SECRET_KEY
JWT_SECRET_KEY=$JWT_SECRET_KEY
GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET
GITHUB_REDIRECT_URI=http://$SERVER_IP:3000/auth/github/callback
NVD_API_KEY=$NVD_API_KEY
GOOGLE_API_KEY=$GOOGLE_API_KEY
GOOGLE_MODEL=gemini-1.5-flash
AI_PROVIDER=gemini
FLASK_ENV=production
FLASK_DEBUG=0
REACT_APP_API_URL=http://$SERVER_IP:8000
EOF

# Load environment
export $(cat .env | grep -v '^#' | xargs)

# Create frontend env
echo "REACT_APP_API_URL=http://$SERVER_IP:8000" > frontend/.env

# Deploy
echo "🚀 Deploying..."
docker-compose down --remove-orphans 2>/dev/null || true

echo "🔨 Building images..."
if docker-compose --env-file .env build; then
    echo "✅ Build successful, starting services..."
    docker-compose --env-file .env up -d
else
    echo "❌ Build failed, please check the error messages above"
    exit 1
fi

echo "⏳ Waiting for services..."
sleep 30

echo ""
echo "✅ Deployment Complete!"
echo "Frontend: http://$SERVER_IP:3000"
echo "Backend:  http://$SERVER_IP:8000"
echo "Login:    admin / Admin@1234"
echo ""
echo "Generated passwords:"
echo "Database: $POSTGRES_PASSWORD"
echo "Secret:   $SECRET_KEY"
echo "JWT:      $JWT_SECRET_KEY"