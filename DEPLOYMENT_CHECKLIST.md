# ✅ VersionIntel Deployment Checklist

## Pre-Deployment Requirements

### 🔧 System Requirements
- [ ] Docker installed (version 20.10+)
- [ ] Docker Compose installed (version 2.0+)
- [ ] 4GB+ RAM available
- [ ] 5GB+ disk space available
- [ ] Ports 3000, 8000, 5432 available

### 🔐 GitHub OAuth Setup (REQUIRED)
- [ ] Created GitHub OAuth app at https://github.com/settings/developers
- [ ] Set Homepage URL: `http://YOUR_SERVER_IP:3000`
- [ ] Set Callback URL: `http://YOUR_SERVER_IP:3000/auth/github/callback`
- [ ] Copied Client ID and Client Secret

### 🌐 Optional: Google AI Setup
- [ ] Created Google Cloud project
- [ ] Enabled Generative AI API
- [ ] Created API key

## Deployment Steps

### 📥 Step 1: Clone and Setup
```bash
git clone <repository-url>
cd versionintel
chmod +x *.sh
```

### ⚙️ Step 2: Configuration
```bash
# Option A: Quick setup
./quick-deploy.sh

# Option B: Manual setup
cp .env.template .env
# Edit .env with your settings
./deploy.sh
```

### 🔧 Step 3: Environment Configuration
Edit `.env` file:
- [ ] Updated `SERVER_HOST` with your server IP
- [ ] Set `GITHUB_CLIENT_ID` from OAuth app
- [ ] Set `GITHUB_CLIENT_SECRET` from OAuth app
- [ ] Updated `CORS_ORIGINS` with your server IP
- [ ] Set `GOOGLE_API_KEY` (optional)

### 🚀 Step 4: Deploy
```bash
./deploy.sh
```

## Post-Deployment Verification

### ✅ Service Health
- [ ] All containers running: `docker-compose ps`
- [ ] Frontend accessible: `http://YOUR_SERVER_IP:3000`
- [ ] Backend health check: `http://YOUR_SERVER_IP:8000/health`
- [ ] No errors in logs: `docker-compose logs`

### 🔑 Authentication Test
- [ ] Can access login page
- [ ] GitHub OAuth redirect works
- [ ] Can login with GitHub account
- [ ] User created in database

### 👑 Admin Setup
```bash
# Grant admin privileges to your GitHub user
docker-compose exec db psql -U versionintel -c "UPDATE users SET role='admin' WHERE github_username='YOUR_GITHUB_USERNAME';"
```
- [ ] Admin privileges granted
- [ ] Can access admin features

## Security Checklist

### 🔒 Production Security
- [ ] Changed default database password in `.env`
- [ ] Generated strong SECRET_KEY (32+ characters)
- [ ] Generated strong JWT_SECRET_KEY (32+ characters)
- [ ] Set `.env` file permissions: `chmod 600 .env`
- [ ] GitHub OAuth URLs match exactly
- [ ] CORS origins configured correctly

## Troubleshooting

### 🚨 Common Issues
- [ ] **Ports in use**: Check with `netstat -tulpn | grep :3000`
- [ ] **Docker issues**: Restart Docker service
- [ ] **GitHub OAuth errors**: Verify URLs and credentials
- [ ] **Database connection**: Check `docker-compose logs db`
- [ ] **Build failures**: Run `docker system prune -f` and redeploy

### 🔄 Reset and Redeploy
```bash
docker-compose down --volumes --remove-orphans
docker system prune -f
./deploy.sh
```

## Success Criteria

Your deployment is successful when:
- ✅ All services show "healthy" status
- ✅ Frontend loads without errors
- ✅ Backend API responds to health checks
- ✅ GitHub OAuth login flow works
- ✅ Admin user can access all features
- ✅ Data persists across container restarts

## Support Resources

- 📖 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detailed deployment guide
- 🔧 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Comprehensive troubleshooting
- 📚 [API.md](API.md) - API documentation
- 🏗️ [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Project architecture

---

**🎉 Congratulations! Your VersionIntel deployment is complete and ready for use!**