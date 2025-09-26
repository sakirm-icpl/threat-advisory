#!/bin/bash
echo "Updating VersionIntel..."
git pull origin main || echo "No git updates"
docker-compose -f docker-compose.prod.yml up -d --build
echo "Update completed!"
