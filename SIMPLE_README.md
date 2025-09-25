# VersionIntel - Version Detection Research Platform

## 🚀 Quick Start (PRODUCTION READY)

### For Production Server (Linux/Ubuntu):
```bash
chmod +x simple-deploy.sh
./simple-deploy.sh prod
```

### For Local Development (Windows):
```cmd
simple-deploy.bat dev
```

### For Current Production Issues:
```bash
chmod +x ultimate-fix.sh
./ultimate-fix.sh
```

## 🎯 What You Get

- **Frontend**: Modern React application on port 3000
- **Backend**: Flask API with authentication on port 8000  
- **Database**: PostgreSQL with automatic initialization
- **GitHub OAuth**: Ready for GitHub integration
- **AI Analysis**: Google Gemini integration for vulnerability detection

## 🔧 Quick Setup

1. **Clone & Navigate**:
   ```bash
   git clone <repository>
   cd versionintel
   ```

2. **Deploy**:
   ```bash
   ./simple-deploy.sh prod    # Production
   ./simple-deploy.sh dev     # Development
   ```

3. **Access**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Login: admin / Admin@123

## 📋 Environment Files

### Production (`.env.production`):
- Pre-configured with production settings
- GitHub OAuth ready
- Google AI integration
- Secure database credentials

### Development (`.env`):
- Local development settings
- Debug mode enabled
- Development OAuth settings

## 🛠️ Management Commands

```bash
# View status
docker ps

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart services
docker-compose -f docker-compose.production.yml restart

# Stop everything
docker-compose -f docker-compose.production.yml down
```

## 🔐 GitHub OAuth Setup

1. Go to: https://github.com/settings/developers
2. Find OAuth App: `Iv23liGLM3AMR1Tl3af5`
3. Update URLs:
   - Homepage URL: `http://your-server:3000`
   - Callback URL: `http://your-server:3000/auth/github/callback`

## 🎯 Features

- ✅ User authentication with GitHub OAuth
- ✅ Repository scanning and analysis
- ✅ Vulnerability detection with AI
- ✅ Dashboard with analytics
- ✅ RESTful API with documentation
- ✅ Containerized deployment
- ✅ Production-ready configuration

## 📁 Project Structure

```
versionintel/
├── backend/          # Flask API application
├── frontend/         # React frontend application
├── simple-deploy.sh  # Production deployment script
├── simple-deploy.bat # Windows deployment script
├── ultimate-fix.sh   # Emergency fix script
└── docker-compose.*  # Container orchestration
```

## 🆘 Troubleshooting

### Backend Won't Start
```bash
# Run the ultimate fix
./ultimate-fix.sh
```

### Database Issues
```bash
# Check database logs
docker logs versionintel-db-prod

# Reset database
docker-compose -f docker-compose.production.yml down
docker volume rm versionintel_postgres_data
./simple-deploy.sh prod
```

### GitHub OAuth Issues
- Update callback URLs in GitHub OAuth app settings
- Ensure environment variables are set correctly

## 📞 Support

For issues or questions:
1. Check container logs: `docker-compose logs -f`
2. Run ultimate fix: `./ultimate-fix.sh`
3. Verify environment configuration

---

**🎉 VersionIntel is now production-ready with simplified deployment!**