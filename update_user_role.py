#!/usr/bin/env python3

import sys
import os
sys.path.append('/app')

from app import create_app, db
from app.models.user import User, UserRole

def update_user_role():
    try:
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
                
                # Verify the change
                updated_user = User.query.filter_by(github_username='sakirm-icpl').first()
                print(f'Updated role to: {updated_user.role}')
                print('SUCCESS: User role updated to admin!')
                return True
            else:
                print('ERROR: User not found')
                return False
    except Exception as e:
        print(f'ERROR: {str(e)}')
        return False

if __name__ == '__main__':
    success = update_user_role()
    sys.exit(0 if success else 1)