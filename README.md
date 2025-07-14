# VersionIntel - Complete Version Detection Research Platform

A comprehensive platform for managing internal version detection research for various service/web/OS applications. This platform allows you to record detection logic like banner grabbing techniques, version regex patterns (Python and Ruby), authentication requirements, and setup instructions per product/vendor.

## 🚀 Features

### **Core Functionality**
- **Vendor Management**: Add, update, delete, and list vendors
- **Product Management**: Manage products with vendor associations and categories
- **Detection Methods**: Store and manage version detection logic with regex patterns
- **Setup Guides**: Document setup instructions with Docker images and VM requirements
- **Regex Testing**: Test Python and Ruby regex patterns against sample outputs

### **Advanced Features**
- **🔐 Authentication & Authorization**: JWT-based authentication with role-based access control
- **🔍 Advanced Search**: Search across all entities with filters and advanced queries
- **📊 Bulk Operations**: Import/export data in JSON/CSV formats with backup/restore
- **📈 Monitoring**: Prometheus metrics and health checks
- **📚 API Documentation**: Interactive Swagger/OpenAPI documentation
- **🎨 Modern Frontend**: React-based web interface with responsive design

### **User Roles**
- **Admin**: Full access to all features including user management
- **User**: Read/write access to all data
- **Readonly**: Read-only access to all data

## 🏗️ Architecture

```
versionintel/
├── backend/                 # Flask API Server
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── __init__.py     # App factory
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React Web Application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── services/      # API services
│   ├── Dockerfile
│   └── package.json
├── db/
│   └── init.sql           # Database initialization
├── docker-compose.yml     # Service orchestration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd versionintel
```

2. **Start all services:**
```bash
docker-compose up --build
```

3. **Access the application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/docs
- **Health Check**: http://localhost:5000/health
- **Metrics**: http://localhost:5000/metrics

### Default Login
- **Username**: `admin`
- **Password**: `admin123`

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile
- `POST /auth/users` - Create user (admin only)
- `GET /auth/users` - List users (admin only)

### Core Endpoints
- `GET/POST/PUT/DELETE /vendors` - Vendor management
- `GET/POST/PUT/DELETE /products` - Product management
- `GET/POST/PUT/DELETE /methods` - Detection methods
- `GET/POST/PUT/DELETE /setup-guides` - Setup guides
- `GET/POST /regex-test` - Regex testing

### Advanced Endpoints
- `GET /search` - Search across all entities
- `POST /search/advanced` - Advanced search with filters
- `GET /bulk/export` - Export data (JSON/CSV)
- `POST /bulk/import` - Import data
- `GET /bulk/backup` - Create backup
- `POST /bulk/restore` - Restore from backup

### Monitoring Endpoints
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

## 🎨 Frontend Features

### **Modern UI/UX**
- Responsive design with Tailwind CSS
- Dark/light theme support
- Mobile-friendly interface
- Real-time notifications with toast messages

### **Interactive Components**
- Data tables with sorting and filtering
- Form validation with React Hook Form
- Real-time search with debouncing
- File upload for bulk operations
- Markdown editor for setup guides

### **Dashboard & Analytics**
- Overview statistics
- Quick action buttons
- Recent activity feed
- Performance metrics

## 🔧 Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python wsgi.py
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Database Management
```bash
# Connect to database
docker-compose exec db psql -U versionintel -d versionintel

# View logs
docker-compose logs backend
docker-compose logs frontend
```

## 🔐 Security Features

### Authentication
- JWT tokens with refresh mechanism
- Password hashing with bcrypt
- Role-based access control
- Token expiration handling

### Authorization
- Route-level permission checks
- Admin-only endpoints
- User role validation
- Session management

## 📊 Monitoring & Observability

### Metrics
- Request count and latency
- Database connection status
- Active user count
- Error rates

### Health Checks
- Service health monitoring
- Database connectivity
- API endpoint status
- Resource usage

## 🔍 Search & Filtering

### Global Search
- Search across all entities
- Fuzzy matching
- Type-specific filtering
- Real-time results

### Advanced Search
- Multiple criteria filtering
- Date range queries
- Confidence level filtering
- Method type filtering

## 📦 Bulk Operations

### Import/Export
- JSON format for full data
- CSV format for tabular data
- Backup and restore functionality
- Error handling and validation

### Data Management
- Bulk create operations
- Data validation
- Duplicate detection
- Transaction rollback

## 🚀 Deployment

### Production Setup
1. Update environment variables
2. Set secure JWT secret
3. Configure database credentials
4. Set up reverse proxy (nginx)
5. Enable HTTPS

### Environment Variables
```bash
# Backend
JWT_SECRET_KEY=your-secure-secret-key
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the health endpoint at `/health`

---

**VersionIntel** - Empowering version detection research with modern tools and comprehensive management capabilities. 

## Complete Steps Summary

Here are all the steps to stop and start your VersionIntel containers:

### **Stop All Containers:**
```powershell
docker-compose down
```

### **Start All Containers in Background:**
```powershell
docker-compose up -d
```

### **Verify Status:**
```powershell
docker-compose ps
```

### **Additional Useful Commands:**

**View logs for all services:**
```powershell
docker-compose logs
```

**View logs for specific service:**
```powershell
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

**Follow logs in real-time:**
```powershell
docker-compose logs -f
```

**Restart specific service:**
```powershell
docker-compose restart backend
docker-compose restart frontend
```

**Stop and remove everything (including volumes):**
```powershell
docker-compose down -v
```

### **Current Status:**
✅ **All containers are now running successfully:**
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000  
- **Database**: localhost:5432 (healthy)

The `-d` flag in `docker-compose up -d` runs all containers in **detached mode** (background), so you can continue using your terminal while the services run. 