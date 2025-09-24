# VersionIntel - Version Detection Research Platform

![VersionIntel Logo](https://via.placeholder.com/600x200/1e40af/ffffff?text=VersionIntel)

A comprehensive platform for detecting software versions, managing vulnerability assessments, and facilitating security research collaboration.

## 🚀 Features

### Core Platform
- **Version Detection**: Advanced regex patterns for software version identification
- **Vendor & Product Management**: Comprehensive database of software vendors and products
- **Detection Methods**: Scalable detection techniques and methodologies
- **Setup Guides**: Step-by-step configuration guides for security tools

### Community & Collaboration
- **GitHub OAuth Authentication**: Secure login with GitHub accounts
- **Pattern Submission**: Community-driven pattern contributions
- **Documentation Sharing**: Collaborative documentation platform
- **Bug Reporting**: Integrated issue tracking and reporting
- **Contributor Recognition**: Community stats and contributor profiles

### Search & Analytics
- **Advanced Search**: Multi-criteria search across patterns and data
- **CVE Integration**: Security vulnerability cross-referencing
- **Bulk Operations**: Efficient batch processing capabilities
- **Analytics Dashboard**: Usage insights and trend analysis
- **Real-time Notifications**: Stay updated with platform activities

### API & Integration
- **RESTful API**: Complete programmatic access
- **API Documentation**: Interactive API explorer
- **Integration Support**: Third-party tool integration guides
- **Export Capabilities**: Data export in multiple formats

## 🏗️ Architecture

- **Frontend**: React 18 with Tailwind CSS
- **Backend**: Flask with SQLAlchemy ORM
- **Database**: PostgreSQL 13
- **Authentication**: GitHub OAuth 2.0 + JWT
- **Deployment**: Docker & Docker Compose
- **Search**: Advanced filtering and pagination
- **API**: RESTful with OpenAPI documentation

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Git** for version control
- **GitHub Account** for OAuth authentication (optional)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd versionintel
   ```

2. **Deploy locally**
   ```bash
   # Linux/Mac
   chmod +x deploy-local.sh
   ./deploy-local.sh
   
   # Windows
   deploy-local.bat
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432

### Production Deployment

1. **Deploy to production server**
   ```bash
   # Linux/Mac (replace with your server IP)
   chmod +x deploy-production.sh
   ./deploy-production.sh 172.17.14.65
   
   # Windows (replace with your server IP)
   deploy-production.bat 172.17.14.65
   ```

2. **Configure environment**
   - Update `.env` with production credentials
   - Set strong passwords and secret keys
   - Configure GitHub OAuth application

## ⚙️ Configuration

### Environment Setup

The platform uses environment-specific configuration:

- **`.env.local`**: Local development settings
- **`.env.production`**: Production deployment settings
- **`.env`**: Active configuration (auto-created from templates)

### GitHub OAuth Setup

1. **Create GitHub OAuth App**
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Fill in application details:
     - **Application name**: `VersionIntel`
     - **Homepage URL**: `http://localhost:3000` (local) or `http://YOUR_SERVER_IP:3000` (production)
     - **Authorization callback URL**: `http://localhost:3000/auth/github/callback` (local) or `http://YOUR_SERVER_IP:3000/auth/github/callback` (production)

2. **Update Configuration**
   - Copy Client ID and Client Secret
   - Update `.env` file with your credentials:
     ```
     GITHUB_CLIENT_ID=your-client-id
     GITHUB_CLIENT_SECRET=your-client-secret
     ```

3. **Restart Services**
   ```bash
   docker-compose restart backend
   ```

### API Keys (Optional)

- **NVD API**: For CVE data integration
- **Google AI API**: For AI-powered features

Update `.env` with your API keys:
```
NVD_API_KEY=your-nvd-api-key
GOOGLE_API_KEY=your-google-api-key
```

## 🔧 Usage

### Authentication

- **GitHub OAuth**: Full platform access with GitHub account
- **Demo Account**: Immediate access for testing and evaluation

### Core Features

1. **Dashboard**: Platform overview and quick actions
2. **Vendors & Products**: Browse and manage software inventory
3. **Detection Methods**: Access detection patterns and techniques
4. **Search**: Find patterns, products, and documentation
5. **Community**: Engage with contributors and submit content
6. **Analytics**: View usage statistics and trends

### API Access

- **API Documentation**: Available at `/api`
- **Authentication**: JWT tokens via GitHub OAuth
- **Rate Limiting**: Implemented for API stability

## 🛠️ Management Commands

### Service Management
```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update application
git pull
./deploy-local.sh  # or deploy-production.sh
```

### Database Management
```bash
# Access database
docker-compose exec db psql -U versionintel -d versionintel

# Backup database
docker-compose exec db pg_dump -U versionintel versionintel > backup.sql

# Restore database
docker-compose exec -T db psql -U versionintel versionintel < backup.sql
```

## 📚 Documentation

- **API Documentation**: Available at `/api` endpoint
- **User Guide**: Available at `/help` endpoint
- **Contributing Guidelines**: See `CONTRIBUTING.md`
- **Architecture Details**: See `ARCHITECTURE_FLOWCHARTS.md`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `./deploy-local.sh`
5. Submit a pull request

## 🔒 Security

- **Authentication**: GitHub OAuth 2.0
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted secrets and secure headers
- **Input Validation**: Comprehensive sanitization
- **API Security**: Rate limiting and CORS protection

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: `/help` endpoint in the application
- **Issues**: GitHub Issues for bug reports and feature requests
- **Community**: Engage through the platform's community features

## 👥 Team

Developed by **Infopercept** - Leading cybersecurity research and solutions.

---

**VersionIntel** - Empowering security researchers with comprehensive version detection capabilities.