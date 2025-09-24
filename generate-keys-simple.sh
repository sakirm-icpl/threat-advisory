#!/bin/bash
# Generate Secure Keys for VersionIntel Production - Simple Version
# This version uses openssl instead of Python for systems without Python

echo "Generating secure keys for VersionIntel production deployment..."
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "Error: Neither Python nor OpenSSL is available"
    echo "Please install one of the following:"
    echo "  - Python 3: sudo apt update && sudo apt install python3"
    echo "  - OpenSSL: sudo apt update && sudo apt install openssl"
    exit 1
fi

echo "Using OpenSSL to generate secure keys..."
echo ""

# Generate SECRET_KEY (64 characters hex)
echo "SECRET_KEY for .env file:"
echo "SECRET_KEY=$(openssl rand -hex 32)"
echo ""

# Generate JWT_SECRET_KEY (64 characters hex)
echo "JWT_SECRET_KEY for .env file:"
echo "JWT_SECRET_KEY=$(openssl rand -hex 32)"
echo ""

# Generate secure database password (24 characters base64)
echo "Secure database password suggestion:"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '=' | tr '+/' '-_')"
echo ""

echo "Copy these values to your .env file, replacing the CHANGE_THIS_* placeholders"
echo "Make sure to keep these keys secure and never commit them to version control!"
echo ""
echo "Note: If you prefer Python-generated keys, install Python 3 and use ./generate-keys.sh"