#!/usr/bin/env python3

import sys
import os
sys.path.append('/app')

from app import create_app, db
from app.models.user import User, UserRole

def update_user_role():
    app = create_app()
    with app.app_context():
        # Find the user
        user = User.query.filter_by(github_username='sakirm-icpl').first()
        if user:
            print(f'Found user: {user.github_username}')
            print(f'Current role: {user.role}')
            
            # Update to admin
            user.role = UserRole.ADMIN
            db.session.commit()
            
            print(f'✅ Updated role to: {user.role}')
            return True
        else:
            print('❌ User not found')
            return False

if __name__ == '__main__':
    update_user_role()