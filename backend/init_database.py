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
    
    # Check if admin user exists
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        print("Creating admin user...")
        admin_user = User(
            username='admin',
            email='admin@example.com',
            role='admin'
        )
        admin_user.set_password('admin')
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user created successfully!")
    else:
        print("Admin user already exists!")
    
    print("Database initialization complete!") 