# VersionIntel Project Structure

```
versionintel/
├── 📁 backend/                          # Flask Backend Application
│   ├── 📁 app/
│   │   ├── 📁 models/                   # Database Models
│   │   │   ├── user.py                  # User authentication model
│   │   │   ├── pattern.py               # Detection patterns model
│   │   │   ├── contribution.py          # Community contributions
│   │   │   ├── notification.py          # User notifications
│   │   │   └── user_profile.py          # Extended user profiles
│   │   ├── 📁 routes/                   # API Endpoints
│   │   │   ├── auth.py                  # Authentication routes
│   │   │   ├── oauth.py                 # GitHub OAuth handling
│   │   │   ├── dashboard.py             # Dashboard API
│   │   │   ├── community.py             # Community features
│   │   │   ├── submission.py            # Pattern submissions
│   │   │   ├── analytics.py             # Analytics & reporting
│   │   │   ├── settings.py              # User settings
│   │   │   └── help.py                  # Help & documentation
│   │   ├── 📁 services/                 # Business Logic
│   │   │   ├── auth.py                  # Authentication services
│   │   │   └── monitoring.py            # System monitoring
│   │   ├── __init__.py                  # App factory
│   │   └── config.py                    # Configuration management
│   ├── Dockerfile                       # Backend container config
│   ├── requirements.txt                 # Python dependencies
│   ├── wsgi.py                         # WSGI entry point
│   └── start.sh                        # Container startup script
│
├── 📁 frontend/                         # React Frontend Application
│   ├── 📁 public/                      # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/              # Reusable UI Components
│   │   │   └── Layout.js               # Main layout component
│   │   ├── 📁 pages/                   # Page Components
│   │   │   ├── Login.js                # Authentication page
│   │   │   ├── GitHubCallback.js       # OAuth callback handler
│   │   │   ├── Dashboard.js            # Main dashboard
│   │   │   ├── Profile.js              # User profile management
│   │   │   ├── Community.js            # Community hub
│   │   │   ├── Contributors.js         # Contributor listing
│   │   │   ├── Guidelines.js           # Community guidelines
│   │   │   ├── SubmitPattern.js        # Pattern submission form
│   │   │   ├── SubmitDocs.js           # Documentation submission
│   │   │   ├── SubmitIntegration.js    # Integration submission
│   │   │   ├── SubmitBug.js            # Bug report form
│   │   │   ├── Help.js                 # Help center
│   │   │   ├── ApiDocs.js              # API documentation
│   │   │   ├── Analytics.js            # Analytics dashboard
│   │   │   └── Notifications.js        # User notifications
│   │   ├── 📁 hooks/                   # Custom React Hooks
│   │   │   └── useAuth.js              # Authentication hook
│   │   ├── 📁 services/                # API Services
│   │   │   └── api.js                  # HTTP client configuration
│   │   ├── App.js                      # Main app component
│   │   └── index.js                    # React entry point
│   ├── Dockerfile                      # Frontend container config
│   ├── package.json                   # Node.js dependencies
│   └── tailwind.config.js             # Tailwind CSS configuration
│
├── 📁 db/                              # Database Configuration
│   └── init.sql                       # Database initialization script
│
├── 📁 patterns/                       # Sample Detection Patterns
│   ├── apache_patterns.json
│   ├── nginx_patterns.json
│   └── common_patterns.json
│
├── 📁 vulnscan/                       # Vulnerability Scanning Tools
│   └── [scanning scripts and tools]
│
├── 🐳 docker-compose.yml              # Container Orchestration
├── 📄 .env.local                      # Local environment template
├── 📄 .env.production                 # Production environment template
├── 📄 .env                           # Active environment config
├── 📄 .gitignore                     # Git ignore rules
├── 📄 env.example                    # Environment example
│
├── 🚀 deploy-local.sh                 # Local deployment script (Linux/Mac)
├── 🚀 deploy-local.bat                # Local deployment script (Windows)
├── 🚀 deploy-production.sh            # Production deployment script (Linux/Mac)
├── 🚀 deploy-production.bat           # Production deployment script (Windows)
│
├── 📖 README.md                       # Project documentation
├── 📖 CONTRIBUTING.md                 # Contribution guidelines
├── 📖 DEPLOYMENT.md                   # Deployment documentation
├── 📖 TROUBLESHOOTING.md              # Troubleshooting guide
├── 📖 API.md                         # API documentation
├── 📖 ARCHITECTURE_FLOWCHARTS.md      # Architecture diagrams
├── 📖 OPEN_SOURCE_PREPARATION.md      # Open source preparation
├── 📖 OPEN_SOURCE_ROADMAP.md          # Future roadmap
└── 📖 PROJECT_STRUCTURE.md            # This file
```

## 🏗️ Architecture Overview

### Backend (Flask)
- **Port**: 8000
- **Database**: PostgreSQL 13
- **Authentication**: GitHub OAuth 2.0 + JWT
- **API**: RESTful with OpenAPI documentation

### Frontend (React)
- **Port**: 3000
- **Framework**: React 18 with hooks
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State**: React Context + hooks

### Database (PostgreSQL)
- **Port**: 5432
- **Volume**: Persistent data storage
- **Init**: Automated schema creation

## 🚀 Deployment Options

### Local Development
```bash
./deploy-local.sh     # Linux/Mac
deploy-local.bat      # Windows
```

### Production
```bash
./deploy-production.sh 172.17.14.65    # Linux/Mac
deploy-production.bat 172.17.14.65     # Windows
```

## 🔧 Configuration Files

- **`.env.local`**: Development environment settings
- **`.env.production`**: Production environment settings
- **`.env`**: Active configuration (auto-generated)
- **`docker-compose.yml`**: Service orchestration
- **`frontend/.env`**: Frontend-specific settings (auto-generated)

## 📦 Key Dependencies

### Backend
- Flask 3.0.0 - Web framework
- SQLAlchemy - ORM
- Flask-JWT-Extended - JWT authentication
- psycopg2-binary - PostgreSQL driver
- requests - HTTP client

### Frontend  
- React 18 - UI framework
- React Router DOM - Routing
- Tailwind CSS - Styling
- Heroicons - Icons
- React Hot Toast - Notifications

## 🛠️ Development Tools

- **Docker**: Containerization
- **Docker Compose**: Multi-service orchestration
- **Git**: Version control
- **VS Code**: Recommended editor
- **Postman**: API testing (optional)

## 🔒 Security Features

- GitHub OAuth 2.0 authentication
- JWT token management
- Role-based access control
- Input validation and sanitization
- CORS protection
- Security headers
- Password hashing (bcrypt)

## 📊 Monitoring & Logging

- Health check endpoints
- Container health monitoring
- Application logging
- Error tracking
- Performance metrics

---

This structure provides a clean, scalable, and maintainable codebase for the VersionIntel platform.
