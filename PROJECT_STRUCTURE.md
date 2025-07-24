# VersionIntel Project Structure

Complete overview of the VersionIntel project architecture and file organization.

## 📁 Root Directory Structure

```
versionintel/
├── 📁 backend/                 # Flask API Server
├── 📁 frontend/                # React Web Application  
├── 📁 db/                      # Database initialization
├── 📁 .git/                    # Git repository data
├── 📄 docker-compose.yml       # Service orchestration
├── 📄 build-and-deploy.sh      # Linux/Mac deployment script
├── 📄 build-and-deploy.bat     # Windows deployment script
├── 📄 README.md                # Main project documentation
├── 📄 SETUP.md                 # Installation guide
├── 📄 PRODUCTION_DEPLOYMENT.md # Production setup guide
├── 📄 API_REFERENCE.md         # API documentation
├── 📄 PROJECT_STRUCTURE.md     # This file
├── 📄 .gitignore               # Git ignore rules
└── 📄 env.example              # Environment variables template
```

## 🔧 Backend Structure

```
backend/
├── 📁 app/                     # Main application package
│   ├── 📁 models/              # Database models
│   │   ├── 📄 __init__.py
│   │   ├── 📄 vendor.py        # Vendor model
│   │   ├── 📄 product.py       # Product model
│   │   ├── 📄 method.py        # Detection method model
│   │   └── 📄 user.py          # User model
│   ├── 📁 routes/              # API endpoints
│   │   ├── 📄 __init__.py
│   │   ├── 📄 auth.py          # Authentication routes
│   │   ├── 📄 vendors.py       # Vendor CRUD operations
│   │   ├── 📄 products.py      # Product CRUD operations
│   │   ├── 📄 methods.py       # Method CRUD operations
│   │   ├── 📄 cve.py           # CVE integration routes
│   │   └── 📄 data.py          # Import/export routes
│   ├── 📁 services/            # Business logic
│   │   ├── 📄 __init__.py
│   │   ├── 📄 auth_service.py  # Authentication logic
│   │   ├── 📄 cve_service.py   # CVE API integration
│   │   ├── 📄 export_service.py # Data export logic
│   │   └── 📄 import_service.py # Data import logic
│   ├── 📁 __pycache__/         # Python bytecode cache
│   ├── 📄 __init__.py          # App initialization
│   ├── 📄 config.py            # Configuration settings
│   └── 📄 main.py              # Application factory
├── 📁 scripts/                 # Utility scripts
├── 📄 requirements.txt         # Python dependencies
├── 📄 Dockerfile              # Container build instructions
├── 📄 .dockerignore           # Docker ignore rules
├── 📄 wsgi.py                 # WSGI entry point
└── 📄 init_database.py        # Database initialization
```

## ⚛️ Frontend Structure

```
frontend/
├── 📁 src/                     # Source code
│   ├── 📁 components/          # Reusable React components
│   │   ├── 📄 Layout.js        # Main layout component
│   │   ├── 📄 Navbar.js        # Navigation bar
│   │   ├── 📄 Sidebar.js       # Side navigation
│   │   ├── 📄 LoadingSpinner.js # Loading indicator
│   │   └── 📄 ConfirmDialog.js # Confirmation dialogs
│   ├── 📁 pages/               # Page components
│   │   ├── 📄 Dashboard.js     # Main dashboard
│   │   ├── 📄 Login.js         # Login page
│   │   ├── 📄 Vendors.js       # Vendor management
│   │   ├── 📄 Products.js      # Product management
│   │   ├── 📄 Methods.js       # Detection methods
│   │   ├── 📄 CVESearch.js     # CVE search interface
│   │   └── 📄 Settings.js      # Application settings
│   ├── 📁 services/            # API service layer
│   │   ├── 📄 api.js           # Base API configuration
│   │   ├── 📄 auth.js          # Authentication services
│   │   ├── 📄 vendors.js       # Vendor API calls
│   │   ├── 📄 products.js      # Product API calls
│   │   ├── 📄 methods.js       # Method API calls
│   │   └── 📄 cve.js           # CVE API calls
│   ├── 📁 contexts/            # React contexts
│   │   ├── 📄 AuthContext.js   # Authentication context
│   │   └── 📄 ThemeContext.js  # Theme management
│   ├── 📁 hooks/               # Custom React hooks
│   │   ├── 📄 useAuth.js       # Authentication hook
│   │   ├── 📄 useApi.js        # API interaction hook
│   │   └── 📄 useLocalStorage.js # Local storage hook
│   ├── 📄 App.js               # Main application component
│   ├── 📄 index.js             # Application entry point
│   └── 📄 index.css            # Global styles
├── 📁 public/                  # Static assets
│   ├── 📄 index.html           # HTML template
│   ├── 📄 favicon.ico          # Site icon
│   └── 📄 manifest.json        # PWA manifest
├── 📄 package.json             # Node.js dependencies
├── 📄 package-lock.json        # Dependency lock file
├── 📄 Dockerfile              # Container build instructions
├── 📄 nginx.conf              # Nginx configuration
├── 📄 tailwind.config.js      # Tailwind CSS configuration
├── 📄 .env                    # Environment variables
└── 📄 .env.example            # Environment template
```

## 🗄️ Database Structure

```
db/
├── 📄 init.sql                 # Database initialization script
└── 📄 migration_add_product_fields.sql # Database migration
```

### Database Schema

**Tables:**
- `users` - User accounts and authentication
- `vendors` - Software/hardware vendors
- `products` - Products from vendors
- `methods` - Version detection methods
- `cve_data` - CVE information cache

## 🐳 Docker Configuration

### docker-compose.yml Services

1. **Database (PostgreSQL)**
   - Port: 5432
   - Volume: `postgres_data`
   - Health checks enabled

2. **Backend (Flask)**
   - Port: 8000 (external) → 5000 (internal)
   - Depends on database
   - Environment variables for configuration

3. **Frontend (React/Nginx)**
   - Port: 3000
   - Depends on backend
   - Nginx serves built React app

## 🔧 Configuration Files

### Environment Variables
- `frontend/.env` - Frontend configuration
- `docker-compose.yml` - Backend environment variables
- `env.example` - Template for environment setup

### Build Configuration
- `backend/Dockerfile` - Python/Flask container
- `frontend/Dockerfile` - Node.js/React container
- `.dockerignore` files - Exclude files from builds

## 📦 Dependencies

### Backend (Python)
- **Flask** - Web framework
- **SQLAlchemy** - Database ORM
- **JWT** - Authentication
- **PostgreSQL** - Database driver
- **Requests** - HTTP client for CVE API

### Frontend (JavaScript)
- **React** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Headless UI** - UI components

## 🚀 Deployment Scripts

### build-and-deploy.sh (Linux/Mac)
- Checks Docker installation
- Creates environment files
- Builds and starts containers
- Performs health checks

### build-and-deploy.bat (Windows)
- Windows equivalent of shell script
- Same functionality with batch commands

## 📋 Key Features by Directory

### Backend Features
- RESTful API endpoints
- JWT authentication
- Database models and migrations
- CVE API integration
- Data import/export
- Health monitoring

### Frontend Features
- Responsive web interface
- User authentication
- CRUD operations for all entities
- CVE search functionality
- Data visualization
- Modern React patterns

### Database Features
- PostgreSQL with proper indexing
- User management
- Vendor/product relationships
- Detection method storage
- CVE data caching

## 🔍 Development Workflow

1. **Local Development**
   - Use Docker Compose for full stack
   - Individual service development possible
   - Hot reloading enabled

2. **Testing**
   - Backend: Python unit tests
   - Frontend: React testing library
   - Integration: Docker health checks

3. **Deployment**
   - Automated scripts for consistency
   - Environment-specific configurations
   - Health monitoring and logging

This structure provides a scalable, maintainable architecture for the VersionIntel platform.