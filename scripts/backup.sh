#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p backups
echo "Creating backup..."
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U versionintel versionintel | gzip > backups/backup_$DATE.sql.gz
echo "Backup created: backups/backup_$DATE.sql.gz"
