#!/bin/bash

# Make a user an admin in VersionIntel Community Platform

echo "========================================"
echo "  VersionIntel Community Platform      "
echo "          Make User Admin              "
echo "========================================"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

echo "[INFO] Starting database container if not running..."
docker-compose up -d db

echo "[INFO] Waiting for database to be ready..."
sleep 5

echo "[INFO] Running make admin script..."
docker-compose run --rm backend python make_admin.py "$@"

echo "[INFO] Script completed!"