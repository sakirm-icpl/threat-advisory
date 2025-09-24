# PRODUCTION DEPLOYMENT CHECKLIST

## 🚨 CRITICAL SECURITY STEPS (MUST COMPLETE BEFORE DEPLOYMENT)

### 1. Generate Secure Keys
Run the key generation script to create secure keys:

**Linux/Mac:**
```bash
./generate-keys.sh
```

**Windows:**
```cmd
generate-keys.bat
```

**Or manually:**
```bash
# Generate SECRET_KEY (64 characters)
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"

# Generate JWT_SECRET_KEY (64 characters)  
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"

# Generate secure database password
python -c "import secrets, string; chars = string.ascii_letters + string.digits + '!@#$%^&*'; print('POSTGRES_PASSWORD=' + ''.join(secrets.choice(chars) for i in range(32)))"
```

### 2. Create and Update Environment File
**Step 2a: Copy template**
```bash
cp .env.production .env
```

**Step 2b: Edit .env file**
Replace ALL `CHANGE_THIS_*` placeholders with the secure values generated in step 1:
- `CHANGE_THIS_TO_RANDOM_64_CHAR_STRING` → Your generated SECRET_KEY
- `CHANGE_THIS_TO_ANOTHER_RANDOM_64_CHAR_STRING` → Your generated JWT_SECRET_KEY  
- `CHANGE_THIS_SECURE_DATABASE_PASSWORD` → Your secure database password

**Step 2c: Verify configuration**
```bash
# Check that no placeholders remain
grep "CHANGE_THIS" .env
# This should return no results
```

### 3. Deploy Securely

**Linux/Mac:**
```bash
# Make scripts executable
chmod +x build-and-deploy.sh
chmod +x generate-keys.sh

# Deploy with secure environment
./build-and-deploy.sh
```

**Windows:**
```cmd
# Deploy with secure environment
build-and-deploy.bat
```

**Manual deployment (if scripts fail):**
```bash
# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Deploy with environment file
docker-compose --env-file .env up -d --build
```

## 🔧 POST-DEPLOYMENT SECURITY CHECKLIST

### ✅ Immediate Actions (First 5 minutes)
- [ ] Change admin password from default `Admin@1234`
- [ ] Verify GitHub OAuth is working
- [ ] Test all critical endpoints
- [ ] Check all containers are healthy

### ✅ Security Verification (First 30 minutes)
- [ ] Verify CORS restrictions are active
- [ ] Test authentication flows
- [ ] Check database connectivity
- [ ] Verify API keys are working
- [ ] Test CVE search functionality

### ✅ Production Hardening (First hour)
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Create database backups
- [ ] Document admin procedures

## 🚀 DEPLOYMENT COMMANDS

### Quick Secure Deployment
**Linux/Mac:**
```bash
# 1. Generate secure keys
./generate-keys.sh

# 2. Copy and edit environment file
cp .env.production .env
# Edit .env file with generated values

# 3. Deploy securely
./build-and-deploy.sh
```

**Windows:**
```cmd
REM 1. Generate secure keys
generate-keys.bat

REM 2. Copy and edit environment file
copy .env.production .env
REM Edit .env file with generated values

REM 3. Deploy securely
build-and-deploy.bat
```

### Manual Deployment (Advanced Users)
```bash
# 1. Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# 2. Deploy with environment file
docker-compose --env-file .env up -d --build

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f

# 5. Test health endpoints
curl -f http://${SERVER_IP:-localhost}:8000/health
curl -f http://${SERVER_IP:-localhost}:3000
```

### Emergency Rollback
```bash
# Stop all services
docker-compose down

# Remove containers and images
docker-compose down --rmi all --volumes --remove-orphans

# Redeploy from backup
docker-compose --env-file .env.backup up -d --build
```

## 📊 MONITORING & MAINTENANCE

### Health Check URLs
- Frontend: http://${SERVER_IP}:3000
- Backend Health: http://${SERVER_IP}:8000/health
- API Docs: http://${SERVER_IP}:8000/docs
- Metrics: http://${SERVER_IP}:8000/metrics

### Log Monitoring
```bash
# Real-time logs
docker-compose logs -f

# Service-specific logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Error logs only
docker-compose logs --tail=100 | grep -i error
```

### Database Backup
```bash
# Create backup
docker-compose exec db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T db psql -U $POSTGRES_USER $POSTGRES_DB < backup_file.sql

# Automated daily backup (add to crontab)
0 2 * * * cd /path/to/versionintel && docker-compose exec db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backups/backup_$(date +\%Y\%m\%d).sql
```

## ⚠️ SECURITY WARNINGS

### 🔴 NEVER DO THIS IN PRODUCTION:
- Use default passwords
- Commit `.env` files to version control
- Allow CORS origins="*"
- Use hardcoded secrets in docker-compose.yml
- Run with FLASK_DEBUG=1
- Expose database ports to public internet

### ✅ ALWAYS DO THIS IN PRODUCTION:
- Use environment variables for secrets
- Change all default passwords
- Restrict CORS to specific domains
- Use HTTPS in production
- Monitor logs and health endpoints
- Regular security updates
- Database backups