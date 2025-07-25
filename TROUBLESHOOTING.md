# VersionIntel Troubleshooting Guide

Comprehensive troubleshooting guide for VersionIntel covering common issues, error messages, and solutions.

## 📋 Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Installation Issues](#installation-issues)
3. [Docker Issues](#docker-issues)
4. [Database Issues](#database-issues)
5. [Backend Issues](#backend-issues)
6. [Frontend Issues](#frontend-issues)
7. [Network Issues](#network-issues)
8. [Performance Issues](#performance-issues)
9. [Security Issues](#security-issues)
10. [Production Issues](#production-issues)
11. [Recovery Procedures](#recovery-procedures)

## 🔍 Quick Diagnostics

### Health Check Commands
```bash
# Check if all services are running
docker-compose ps

# Check service health
curl -f http://localhost:8000/health
curl -f http://localhost:3000

# Check system resources
docker stats
df -h
free -h

# Check network connectivity
netstat -tulpn | grep -E ":(3000|8000|5432)"
```

### Common Error Patterns
- **Connection refused**: Service not running or port blocked
- **Permission denied**: File/directory permissions issue
- **Out of memory**: System resource exhaustion
- **Database connection failed**: Database service down or credentials wrong
- **JWT token invalid**: Authentication/authorization issue

## 🚀 Installation Issues

### Docker Not Installed
**Error**: `docker: command not found`

**Solution**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# CentOS/RHEL
sudo yum install docker docker-compose

# macOS
brew install docker docker-compose

# Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

### Docker Permission Issues
**Error**: `Got permission denied while trying to connect to the Docker daemon`

**Solution**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker

# Alternative: Start docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### Port Already in Use
**Error**: `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution**:
```bash
# Check what's using the port
sudo lsof -i :8000
sudo netstat -tulpn | grep :8000

# Kill the process
sudo kill -9 <PID>

# Or change ports in docker-compose.yml
ports:
  - "8001:5000"  # Change from 8000 to 8001
```

### Insufficient Disk Space
**Error**: `no space left on device`

**Solution**:
```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a -f
docker volume prune -f

# Clean logs
sudo journalctl --vacuum-time=3d
```

## 🐳 Docker Issues

### Containers Won't Start
**Error**: `Container failed to start`

**Diagnosis**:
```bash
# Check container logs
docker-compose logs <service_name>

# Check container status
docker-compose ps -a

# Check Docker daemon
sudo systemctl status docker
```

**Common Solutions**:
```bash
# Restart Docker daemon
sudo systemctl restart docker

# Rebuild containers
docker-compose build --no-cache

# Clean up and restart
docker-compose down
docker system prune -f
docker-compose up -d
```

### Image Build Failures
**Error**: `failed to build image`

**Diagnosis**:
```bash
# Check build logs
docker-compose build --no-cache <service_name>

# Check Dockerfile syntax
docker build -t test-image ./backend
```

**Common Solutions**:
```bash
# Clear Docker cache
docker builder prune -a

# Check internet connectivity
ping google.com

# Update Docker
sudo apt update && sudo apt upgrade docker.io
```

### Container Health Check Failures
**Error**: `Container is unhealthy`

**Diagnosis**:
```bash
# Check health check logs
docker inspect <container_name> | grep -A 10 Health

# Check service logs
docker-compose logs <service_name>
```

**Solutions**:
```bash
# Increase health check timeout in docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s  # Increase this
```

## 🗄️ Database Issues

### Database Connection Failed
**Error**: `could not connect to server: Connection refused`

**Diagnosis**:
```bash
# Check database container
docker-compose ps db

# Check database logs
docker-compose logs db

# Test database connection
docker-compose exec db pg_isready -U postgres
```

**Solutions**:
```bash
# Restart database
docker-compose restart db

# Check database configuration
docker-compose exec db psql -U postgres -c "SELECT version();"

# Reset database (WARNING: Data loss)
docker-compose down
docker volume rm versionintel_postgres_data
docker-compose up -d
```

### Database Initialization Failed
**Error**: `init.sql failed to execute`

**Diagnosis**:
```bash
# Check init script
cat db/init.sql

# Check database logs
docker-compose logs db | grep -i error
```

**Solutions**:
```bash
# Manually initialize database
docker-compose exec db psql -U postgres -d versionintel -f /docker-entrypoint-initdb.d/init.sql

# Check file permissions
ls -la db/init.sql
chmod 644 db/init.sql
```

### Database Performance Issues
**Symptoms**: Slow queries, high CPU usage

**Diagnosis**:
```bash
# Check database performance
docker-compose exec db psql -U postgres -d versionintel -c "SELECT * FROM pg_stat_activity;"

# Check table sizes
docker-compose exec db psql -U postgres -d versionintel -c "SELECT schemaname, tablename, attname, n_distinct, correlation FROM pg_stats WHERE schemaname = 'public';"
```

**Solutions**:
```bash
# Analyze tables
docker-compose exec db psql -U postgres -d versionintel -c "ANALYZE;"

# Add database optimizations to docker-compose.yml
environment:
  POSTGRES_SHARED_PRELOAD_LIBRARIES: "pg_stat_statements"
  POSTGRES_MAX_CONNECTIONS: "100"
```

## 🔧 Backend Issues

### Backend Won't Start
**Error**: `Backend service failed to start`

**Diagnosis**:
```bash
# Check backend logs
docker-compose logs backend

# Check environment variables
docker-compose exec backend env | grep -E "(SECRET_KEY|DATABASE_URL)"

# Check Python dependencies
docker-compose exec backend pip list
```

**Solutions**:
```bash
# Rebuild backend
docker-compose build backend

# Check requirements.txt
cat backend/requirements.txt

# Test backend manually
docker-compose exec backend python wsgi.py
```

### API Endpoints Not Responding
**Error**: `Connection refused` or `404 Not Found`

**Diagnosis**:
```bash
# Check if backend is listening
docker-compose exec backend netstat -tulpn | grep :5000

# Test health endpoint
curl -v http://localhost:8000/health

# Check backend logs
docker-compose logs backend | tail -50
```

**Solutions**:
```bash
# Restart backend
docker-compose restart backend

# Check Flask configuration
docker-compose exec backend cat app/config.py

# Test with different port
curl http://localhost:8000/api/vendors
```

### Authentication Issues
**Error**: `JWT token invalid` or `Authentication failed`

**Diagnosis**:
```bash
# Check JWT configuration
docker-compose exec backend env | grep JWT

# Test login endpoint
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@1234"}'
```

**Solutions**:
```bash
# Regenerate JWT secret
openssl rand -hex 32

# Update docker-compose.yml
environment:
  - JWT_SECRET_KEY=new-secret-key

# Restart backend
docker-compose restart backend
```

### CVE API Integration Issues
**Error**: `NVD API request failed`

**Diagnosis**:
```bash
# Check NVD API key
docker-compose exec backend env | grep NVD_API_KEY

# Test NVD API connectivity
curl -H "apiKey: your-api-key" "https://services.nvd.nist.gov/rest/json/cves/2.0"
```

**Solutions**:
```bash
# Get free NVD API key from https://nvd.nist.gov/developers/request-an-api-key

# Update docker-compose.yml
environment:
  - NVD_API_KEY=your-api-key

# Restart backend
docker-compose restart backend
```

## ⚛️ Frontend Issues

### Frontend Won't Load
**Error**: `Cannot connect to localhost:3000`

**Diagnosis**:
```bash
# Check frontend container
docker-compose ps frontend

# Check frontend logs
docker-compose logs frontend

# Check if React app is running
docker-compose exec frontend ps aux | grep node
```

**Solutions**:
```bash
# Rebuild frontend
docker-compose build frontend

# Check package.json
cat frontend/package.json

# Test frontend manually
cd frontend && npm start
```

### API Connection Issues
**Error**: `Failed to fetch` or `Network error`

**Diagnosis**:
```bash
# Check API URL configuration
docker-compose exec frontend env | grep REACT_APP_API_URL

# Test API connectivity from frontend container
docker-compose exec frontend curl http://backend:5000/health

# Check browser console for errors
```

**Solutions**:
```bash
# Update API URL in frontend environment
echo "REACT_APP_API_URL=http://localhost:8000" > frontend/.env

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# Check CORS configuration in backend
```

### Build Failures
**Error**: `npm run build failed`

**Diagnosis**:
```bash
# Check Node.js version
docker-compose exec frontend node --version

# Check npm dependencies
docker-compose exec frontend npm list

# Check build logs
docker-compose build frontend --no-cache
```

**Solutions**:
```bash
# Clear npm cache
docker-compose exec frontend npm cache clean --force

# Reinstall dependencies
docker-compose exec frontend rm -rf node_modules package-lock.json
docker-compose exec frontend npm install

# Update Node.js version in Dockerfile
```

## 🌐 Network Issues

### Port Conflicts
**Error**: `Address already in use`

**Diagnosis**:
```bash
# Check port usage
sudo netstat -tulpn | grep -E ":(3000|8000|5432)"

# Check Docker port mappings
docker port <container_name>
```

**Solutions**:
```bash
# Kill conflicting processes
sudo kill -9 <PID>

# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Frontend
  - "8001:5000"  # Backend
  - "5433:5432"  # Database
```

### DNS Resolution Issues
**Error**: `Could not resolve hostname`

**Diagnosis**:
```bash
# Test DNS resolution
docker-compose exec backend nslookup google.com

# Check Docker DNS configuration
docker run --rm alpine nslookup google.com
```

**Solutions**:
```bash
# Update Docker DNS
echo '{"dns": ["8.8.8.8", "8.8.4.4"]}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker

# Use host networking (not recommended for production)
network_mode: "host"
```

### Firewall Issues
**Error**: `Connection timed out`

**Diagnosis**:
```bash
# Check firewall status
sudo ufw status

# Test connectivity
telnet localhost 8000
telnet localhost 3000
```

**Solutions**:
```bash
# Allow ports through firewall
sudo ufw allow 3000
sudo ufw allow 8000
sudo ufw allow 5432

# Or disable firewall temporarily for testing
sudo ufw disable
```

## ⚡ Performance Issues

### High Memory Usage
**Symptoms**: Slow response times, container restarts

**Diagnosis**:
```bash
# Check memory usage
docker stats

# Check system memory
free -h

# Check container memory limits
docker inspect <container_name> | grep -A 5 Memory
```

**Solutions**:
```bash
# Add memory limits to docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'

# Optimize application
# - Reduce database connections
# - Implement caching
# - Optimize queries
```

### High CPU Usage
**Symptoms**: Slow performance, high system load

**Diagnosis**:
```bash
# Check CPU usage
docker stats

# Check system load
uptime

# Profile application
docker-compose exec backend python -m cProfile -o profile.stats app/main.py
```

**Solutions**:
```bash
# Add CPU limits
deploy:
  resources:
    limits:
      cpus: '0.5'

# Optimize database queries
# - Add indexes
# - Use connection pooling
# - Implement caching
```

### Slow Database Queries
**Symptoms**: Long response times, database timeouts

**Diagnosis**:
```bash
# Check slow queries
docker-compose exec db psql -U postgres -d versionintel -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check table statistics
docker-compose exec db psql -U postgres -d versionintel -c "SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables;"
```

**Solutions**:
```bash
# Analyze tables
docker-compose exec db psql -U postgres -d versionintel -c "ANALYZE;"

# Add indexes
docker-compose exec db psql -U postgres -d versionintel -c "CREATE INDEX idx_vendors_name ON vendors(name);"

# Optimize queries
# - Use pagination
# - Implement caching
# - Add database indexes
```

## 🔒 Security Issues

### Default Passwords
**Risk**: Using default credentials in production

**Solution**:
```bash
# Generate secure passwords
openssl rand -base64 32

# Update docker-compose.yml
environment:
  - POSTGRES_PASSWORD=secure-password
  - SECRET_KEY=secure-secret-key
  - JWT_SECRET_KEY=secure-jwt-secret

# Change admin password via web interface
```

### Exposed Ports
**Risk**: Services accessible from external network

**Solution**:
```bash
# Bind to localhost only
ports:
  - "127.0.0.1:8000:5000"
  - "127.0.0.1:3000:3000"

# Use reverse proxy (nginx) for external access
```

### Missing SSL/TLS
**Risk**: Data transmitted in plain text

**Solution**:
```bash
# Configure SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Or use self-signed certificate for testing
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout private.key -out certificate.crt
```

## 🚀 Production Issues

### Service Unavailability
**Symptoms**: 502 Bad Gateway, 503 Service Unavailable

**Diagnosis**:
```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs -f

# Check resource usage
docker stats
df -h
free -h
```

**Solutions**:
```bash
# Restart services
docker-compose restart

# Check for resource exhaustion
# - Increase memory/CPU limits
# - Add monitoring
# - Implement auto-scaling
```

### Backup Failures
**Error**: `Backup failed` or `Database backup incomplete`

**Diagnosis**:
```bash
# Check backup script
cat /usr/local/bin/versionintel-backup.sh

# Check disk space
df -h /backups

# Test backup manually
docker-compose exec -T db pg_dump -U postgres versionintel > test_backup.sql
```

**Solutions**:
```bash
# Fix backup script permissions
chmod +x /usr/local/bin/versionintel-backup.sh

# Add disk space monitoring
# - Set up alerts
# - Implement log rotation
# - Use compression
```

### Monitoring Issues
**Symptoms**: No alerts, missing metrics

**Diagnosis**:
```bash
# Check monitoring endpoints
curl http://localhost:8000/health
curl http://localhost:8000/metrics

# Check log files
tail -f /var/log/versionintel/*.log
```

**Solutions**:
```bash
# Set up proper monitoring
# - Configure log aggregation
# - Set up health checks
# - Implement alerting
# - Use monitoring tools (Prometheus, Grafana)
```

## 🔄 Recovery Procedures

### Complete System Recovery
```bash
# Stop all services
docker-compose down

# Backup current state
docker-compose exec -T db pg_dump -U postgres versionintel > recovery_backup.sql

# Restore from backup
docker-compose up -d db
sleep 10
docker-compose exec -T db psql -U postgres -d versionintel < recovery_backup.sql

# Restart services
docker-compose up -d
```

### Database Recovery
```bash
# Stop backend
docker-compose stop backend

# Restore database
docker-compose exec -T db psql -U postgres -d versionintel < backup_file.sql

# Restart backend
docker-compose start backend
```

### Configuration Recovery
```bash
# Backup configuration
cp docker-compose.yml docker-compose.yml.backup
cp .env .env.backup

# Restore from backup
cp docker-compose.yml.backup docker-compose.yml
cp .env.backup .env

# Restart services
docker-compose down
docker-compose up -d
```

### Emergency Mode
```bash
# Start minimal services
docker-compose up -d db
docker-compose up -d backend

# Access via command line
docker-compose exec backend bash
docker-compose exec db psql -U postgres -d versionintel
```

## 📞 Getting Help

### Information to Collect
When reporting issues, include:
1. **Error messages** (exact text)
2. **System information** (OS, Docker version, etc.)
3. **Logs** (docker-compose logs -f)
4. **Configuration** (docker-compose.yml, .env files)
5. **Steps to reproduce**

### Useful Commands for Debugging
```bash
# System information
uname -a
docker --version
docker-compose --version

# Service status
docker-compose ps
docker stats

# Logs
docker-compose logs -f [service_name]
journalctl -u docker

# Network
netstat -tulpn
ping google.com

# Resources
df -h
free -h
top
```

### Common Solutions Summary
1. **Restart services**: `docker-compose restart`
2. **Rebuild containers**: `docker-compose build --no-cache`
3. **Clean up Docker**: `docker system prune -a -f`
4. **Check logs**: `docker-compose logs -f`
5. **Verify configuration**: Check docker-compose.yml and .env files
6. **Test connectivity**: Use curl or telnet to test endpoints
7. **Check resources**: Monitor CPU, memory, and disk usage 