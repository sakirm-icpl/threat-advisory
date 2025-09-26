from flask import Flask, jsonify
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
    # Allow all origins for office network access (development mode)
    CORS(app, origins="*", supports_credentials=True)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    swagger.init_app(app)
    
    # Initialize GitHub OAuth
    from .services.github_oauth import github_oauth
    github_oauth.init_app(app)

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
    from .routes import bp as dashboard_bp

    app.register_blueprint(vendors_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(methods_bp)
    app.register_blueprint(setup_guides_bp)
    app.register_blueprint(regex_test_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(bulk_bp)
    app.register_blueprint(cve_bp)
    app.register_blueprint(dashboard_bp)

    # Monitoring
    from .services.monitoring import monitoring_bp
    app.register_blueprint(monitoring_bp)

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
            db.create_all()
            
            # --- Auto-migrate existing users table for GitHub OAuth ---
            from sqlalchemy import text
            try:
                # Check if github_id column exists
                result = db.session.execute(text("""
                    SELECT column_name FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='github_id'
                """))
                if not result.fetchone():
                    app.logger.info("Running GitHub OAuth migration...")
                    # Add GitHub OAuth fields
                    db.session.execute(text("""
                        ALTER TABLE users 
                        ADD COLUMN github_id VARCHAR(50) UNIQUE,
                        ADD COLUMN avatar_url VARCHAR(255),
                        ADD COLUMN github_username VARCHAR(80)
                    """))
                    # Make password_hash nullable
                    db.session.execute(text("ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL"))
                    # Add indexes
                    db.session.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id)"))
                    db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_users_github_username ON users(github_username)"))
                    db.session.commit()
                    app.logger.info("GitHub OAuth migration completed successfully")
                else:
                    app.logger.info("GitHub OAuth fields already exist")
            except Exception as migration_error:
                app.logger.warning(f"Migration check/execution failed (this is normal for new installations): {migration_error}")
                db.session.rollback()
            
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

    return app
