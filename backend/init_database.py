from app import create_app, db
from app.models.user import User
from app.models.vendor import Vendor
from app.models.product import Product
from app.models.detection_method import DetectionMethod
from app.models.setup_guide import SetupGuide

app = create_app()

with app.app_context():
    print("Creating database tables...")
    db.create_all()
    print("Database tables created successfully!")
    
    # No default admin user creation - GitHub OAuth only
    print("Database initialization complete!")
    print("Note: All users must authenticate via GitHub OAuth.")
    print("To grant admin access, manually update the user role in the database after first login.") 