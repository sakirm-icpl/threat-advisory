from app import create_app, db
from app.models.user import User, UserRole

app = create_app()

with app.app_context():
    # Find user by email
    user = User.query.filter_by(email='sakirm@infopercept.com').first()
    
    if user:
        # Change role to admin
        old_role = user.role
        user.role = UserRole.ADMIN  # This should be the correct way to set the enum
        db.session.commit()
        print(f"User {user.github_username or user.username} ({user.email}) successfully promoted from {old_role.value} to {user.role.value}!")
    else:
        print("User with email 'sakirm@infopercept.com' not found")