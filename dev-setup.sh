#!/bin/bash

# VersionIntel Development Setup Script
# This script sets up the environment for local development

set -e  # Exit on any error

echo "🛠️  VersionIntel Development Setup"
echo "=================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Python 3 and Node.js are installed"

# Backend Setup
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Python dependencies installed"

# Deactivate virtual environment
deactivate

cd ..

# Frontend Setup
echo ""
echo "🎨 Setting up Frontend..."
cd frontend

# Install Node.js dependencies
echo "📥 Installing Node.js dependencies..."
npm install
echo "✅ Node.js dependencies installed"

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend environment file..."
    echo "REACT_APP_API_URL=http://localhost:8000" > .env
    echo "✅ Frontend environment file created"
else
    echo "✅ Frontend environment file already exists"
fi

cd ..

# Database Setup
echo ""
echo "🗄️  Setting up Database..."
echo "🚀 Starting database container..."
docker-compose up db -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Initialize database
echo "🔧 Initializing database..."
cd backend
source venv/bin/activate
python init_database.py
deactivate
cd ..

echo ""
echo "🎉 Development environment setup complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start the backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   export FLASK_ENV=development"
echo "   export FLASK_DEBUG=1"
echo "   export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/versionintel"
echo "   python wsgi.py"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:8000"
echo ""
echo "🔐 Default Login: admin / Admin@1234"
echo ""
echo "📚 For more information, see SETUP.md" 