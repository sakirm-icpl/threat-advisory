from flask import Flask, jsonify
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from prometheus_client import make_wsgi_app
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from flasgger import Swagger
from .config import Config
import logging
from sqlalchemy import text

db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()
swagger = Swagger()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure CORS with production settings
    allowed_origins = [
        "http://172.17.14.65:3000",
        "http://172.17.14.65:8000",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000"
    ]
    CORS(app, 
         origins=allowed_origins, 
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    swagger.init_app(app)

    # Configure logging for production
    if app.config.get('FLASK_ENV') == 'production':
        logging.basicConfig(level=logging.INFO)
        app.logger.setLevel(logging.INFO)
    else:
        logging.basicConfig(level=logging.DEBUG)
        app.logger.setLevel(logging.DEBUG)

    # Register blueprints (use plural file names and bp variable)
    from .routes.vendors import bp as vendors_bp
    from .routes.products import bp as products_bp
    from .routes.methods import bp as methods_bp
    from .routes.setup_guides import bp as setup_guides_bp
    from .routes.regex_test import bp as regex_test_bp
    from .routes.auth import bp as auth_bp
    from .routes.search import bp as search_bp
    from .routes.bulk import bp as bulk_bp
    from .routes.cve import bp as cve_bp
    from .routes.oauth import oauth_bp
    from .routes.community import community_bp
    from .routes import bp as dashboard_bp
    from .routes.submission import submission_bp
    from .routes.help import help_bp
    from .routes.analytics import analytics_bp
    from .routes.settings import settings_bp
    # user_management removed - GitHub OAuth only

    app.register_blueprint(vendors_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(methods_bp)
    app.register_blueprint(setup_guides_bp)
    app.register_blueprint(regex_test_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(bulk_bp)
    app.register_blueprint(cve_bp)
    app.register_blueprint(oauth_bp)
    app.register_blueprint(community_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(submission_bp)
    app.register_blueprint(help_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(settings_bp)
    # user_management_bp removed - GitHub OAuth only

    # Monitoring
    from .services.monitoring import monitoring_bp
    app.register_blueprint(monitoring_bp)

    # Handle HTTP/2 protocol issues
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = jsonify({})
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "*")
            response.headers.add('Access-Control-Allow-Methods', "*")
            return response
        
        # Handle HTTP/2 PRI requests
        if request.method == "PRI":
            return "HTTP/2 not supported", 400

    # Security headers middleware
    @app.after_request
    def add_security_headers(response):
        for header, value in app.config['SECURITY_HEADERS'].items():
            response.headers[header] = value
        return response

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Internal server error: {error}')
        return jsonify({'error': 'Internal server error'}), 500

    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f'Unhandled exception: {e}')
        return jsonify({'error': 'An unexpected error occurred'}), 500

    # Health endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        try:
            db.session.execute(text('SELECT 1'))
            return jsonify({'status': 'healthy'}), 200
        except Exception as e:
            app.logger.error(f"Database health check failed: {e}")
            return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

    # Prometheus metrics
    app.wsgi_app = DispatcherMiddleware(app.wsgi_app, {
        '/metrics': make_wsgi_app()
    })

    # Create tables if not exist
    with app.app_context():
        try:
            # Test database connection first
            app.logger.info(f"Testing database connection: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")
            
            # Test basic connection
            db.session.execute(text('SELECT 1'))
            app.logger.info("Database connection successful")
            
            # Create tables
            db.create_all()
            app.logger.info("Database tables created successfully")
            
            # --- Ensure default admin user exists ---
            from app.models.user import User
            if not User.query.filter_by(username="admin").first():
                admin = User(username="admin", email="admin@example.com", role="admin")
                admin.set_password("Admin@1234")
                db.session.add(admin)
                db.session.commit()
                app.logger.info("Default admin user created: admin / Admin@1234")
            else:
                app.logger.info("Admin user already exists")
        except Exception as e:
            app.logger.error(f'Error during database initialization: {e}')
            # Don't fail the app start, just log the error

    return app
