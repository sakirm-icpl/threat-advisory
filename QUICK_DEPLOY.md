# VersionIntel - Quick Deployment Guide

## 🚀 FASTEST DEPLOYMENT METHOD

### For Linux/Mac Users:
```bash
# 1. Generate secure keys
./generate-keys.sh

# 2. Copy and update environment file
cp .env.production .env
# Edit .env file and replace CHANGE_THIS_* values with generated keys

# 3. Deploy securely
./build-and-deploy.sh
```

### For Windows Users:
```cmd
REM 1. Generate secure keys
generate-keys.bat

REM 2. Copy and update environment file
copy .env.production .env
REM Edit .env file and replace CHANGE_THIS_* values with generated keys

REM 3. Deploy securely
build-and-deploy.bat
```

## ⚡ WHAT THE SCRIPTS DO AUTOMATICALLY

### ✅ Security Validations:
- Checks for secure environment configuration
- Validates no default passwords remain
- Ensures all secrets are properly set
- Loads environment variables securely

### ✅ Docker Operations:
- Builds backend and frontend images
- Deploys with secure environment variables
- Sets up health checks and monitoring
- Configures proper networking

### ✅ Post-Deployment:
- Displays access URLs and credentials
- Shows security checklist
- Provides maintenance commands
- Validates service health

## 🔐 SECURITY FEATURES

### ✅ Environment Security:
- No hardcoded secrets in docker-compose.yml
- Secure key generation
- Database password protection
- API key management

### ✅ Application Security:
- CORS restricted to specific domains
- JWT token-based authentication
- GitHub OAuth integration
- Security headers enabled

### ✅ Container Security:
- Non-root user execution
- Health check monitoring
- Secure networking
- Volume permissions

## 📋 AFTER DEPLOYMENT CHECKLIST

### 🔴 CRITICAL (Do Immediately):
- [ ] Change admin password from `Admin@1234`
- [ ] Test GitHub OAuth login
- [ ] Verify all services are running
- [ ] Check health endpoints

### 🟡 IMPORTANT (Do Within 24 Hours):
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Create database backup schedule
- [ ] Update DNS settings

### 🟢 RECOMMENDED (Do Within 1 Week):
- [ ] Set up log aggregation
- [ ] Configure automated backups
- [ ] Set up security scanning
- [ ] Document admin procedures
- [ ] Train team on system

## 🆘 TROUBLESHOOTING

### Common Issues:
1. **Docker not running**: Start Docker Desktop/daemon
2. **Environment validation fails**: Check .env file for CHANGE_THIS_ placeholders
3. **Ports already in use**: Stop existing services or change ports
4. **Permission denied**: Check file permissions and Docker access

### Get Help:
```bash
# View logs
docker-compose logs -f

# Check service status
docker-compose ps

# Restart services
docker-compose restart

# Complete reset
docker-compose down && docker-compose --env-file .env up -d
```

## 🎯 ACCESS URLS

After successful deployment:
- **Frontend**: http://172.17.14.65:3000
- **Backend API**: http://172.17.14.65:8000
- **API Docs**: http://172.17.14.65:8000/docs
- **Health Check**: http://172.17.14.65:8000/health

Default login: `admin` / `Admin@1234` (**CHANGE IMMEDIATELY!**)

---
**🔒 Keep your .env file secure and never commit it to version control!**