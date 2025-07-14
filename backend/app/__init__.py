from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from prometheus_client import make_wsgi_app
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from flasgger import Swagger
from .config import Config

db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()
swagger = Swagger()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    swagger.init_app(app)

    # Register blueprints (use plural file names and bp variable)
    from .routes.vendors import bp as vendors_bp
    from .routes.products import bp as products_bp
    from .routes.methods import bp as methods_bp
    from .routes.setup_guides import bp as setup_guides_bp
    from .routes.regex_test import bp as regex_test_bp
    from .routes.auth import bp as auth_bp
    from .routes.search import bp as search_bp
    from .routes.bulk import bp as bulk_bp
    from .routes import bp as dashboard_bp

    app.register_blueprint(vendors_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(methods_bp)
    app.register_blueprint(setup_guides_bp)
    app.register_blueprint(regex_test_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(bulk_bp)
    app.register_blueprint(dashboard_bp)

    # Monitoring
    from .services.monitoring import monitoring_bp
    app.register_blueprint(monitoring_bp)

    # Health endpoint
    @app.route("/health")
    def health():
        return {"service": "versionintel-backend", "status": "healthy", "version": "1.0.0"}

    # Prometheus metrics
    app.wsgi_app = DispatcherMiddleware(app.wsgi_app, {
        '/metrics': make_wsgi_app()
    })

    # Create tables if not exist
    with app.app_context():
        db.create_all()
        # --- Ensure default admin user exists ---
        from app.models.user import User
        if not User.query.filter_by(username="admin").first():
            admin = User(username="admin", email="admin@example.com", role="admin")
            admin.set_password("admin123")
            db.session.add(admin)
            db.session.commit()
            print("Default admin user created: admin / admin123")

    return app
