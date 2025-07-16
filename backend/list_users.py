from app import create_app, db
from app.models.user import User

app = create_app()

with app.app_context():
    users = User.query.all()
    if not users:
        print('No users found.')
    for u in users:
        print(f'username: {u.username} | email: {u.email} | is_active: {u.is_active}') 