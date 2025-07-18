from app import create_app, db
from app.models.user import User

app = create_app()

with app.app_context():
    # Find admin user
    admin_user = User.query.filter_by(username='admin').first()
    
    if admin_user:
        # Reset password to 'admin'
        admin_user.set_password('admin')
        db.session.commit()
        print(f"Admin password reset successfully for user: {admin_user.username}")
    else:
        print("Admin user not found") 