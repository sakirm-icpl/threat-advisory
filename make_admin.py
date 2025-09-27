#!/usr/bin/env python3
"""
Script to make a user an admin in VersionIntel Community Platform
"""

import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app import create_app, db
from backend.app.models.user import User, UserRole

def make_user_admin(identifier):
    """Make a user an admin by email, github_username, or user ID"""
    app = create_app()
    
    with app.app_context():
        # Try to find user by different identifiers
        user = None
        
        # Try by user ID
        if identifier.isdigit():
            user = User.query.get(identifier)
        
        # Try by email
        if not user:
            user = User.query.filter_by(email=identifier).first()
        
        # Try by GitHub username
        if not user:
            user = User.query.filter_by(github_username=identifier).first()
        
        # Try by legacy username
        if not user:
            user = User.query.filter_by(username=identifier).first()
        
        if not user:
            print(f"User not found with identifier: {identifier}")
            return False
        
        print(f"Found user: {user.github_username or user.username} ({user.email})")
        print(f"Current role: {user.role.value}")
        
        if user.role == UserRole.ADMIN:
            print("User is already an admin!")
            return True
        
        # Confirm before making changes
        confirm = input("Do you want to make this user an admin? (y/N): ")
        if confirm.lower() != 'y':
            print("Operation cancelled.")
            return False
        
        # Make user an admin
        old_role = user.role
        user.role = UserRole.ADMIN
        db.session.commit()
        
        print(f"Successfully promoted {user.github_username or user.username} from {old_role.value} to admin!")
        return True

def list_users():
    """List all users with their roles"""
    app = create_app()
    
    with app.app_context():
        users = User.query.all()
        print("\nAll Users:")
        print("-" * 80)
        print(f"{'ID':<5} {'Username':<20} {'Email':<30} {'Role':<15}")
        print("-" * 80)
        for user in users:
            username = user.github_username or user.username or "N/A"
            print(f"{user.id:<5} {username:<20} {user.email:<30} {user.role.value:<15}")

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python make_admin.py <email|github_username|user_id>  # Promote specific user")
        print("  python make_admin.py list                            # List all users")
        print("  python make_admin.py                                 # Interactive mode")
        return
    
    command = sys.argv[1]
    
    if command == "list":
        list_users()
        return
    
    # Promote specific user
    make_user_admin(command)

if __name__ == "__main__":
    main()