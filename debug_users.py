#!/usr/bin/env python3
"""
Debug script to check user accounts in the database
Usage: docker-compose exec backend python debug_users.py
"""

import os
import sys
sys.path.append('/app')

from app import create_app, db
from app.models.user import User
from app.models.contribution import ContributorProfile

def debug_users():
    app = create_app()
    
    with app.app_context():
        print("=== VersionIntel User Debug Report ===\n")
        
        # Get all users
        users = User.query.all()
        print(f"Total users in database: {len(users)}\n")
        
        if not users:
            print("No users found in database.")
            return
        
        for i, user in enumerate(users, 1):
            print(f"User #{i}:")
            print(f"  ID: {user.id}")
            print(f"  Username: {user.username}")
            print(f"  Email: {user.email}")
            print(f"  Role: {user.role}")
            print(f"  Active: {user.is_active}")
            print(f"  GitHub ID: {user.github_id}")
            print(f"  GitHub Username: {user.github_username}")
            print(f"  Display Name: {user.display_name}")
            print(f"  Created: {user.created_at}")
            print(f"  Last Login: {user.last_login}")
            
            # Check contributor profile
            contributor = ContributorProfile.query.filter_by(github_user_id=user.github_id).first()
            if contributor:
                print(f"  Has Contributor Profile: Yes")
            else:
                print(f"  Has Contributor Profile: No")
            
            print()
        
        # Show role distribution
        admin_count = User.query.filter_by(role='admin').count()
        contributor_count = User.query.filter_by(role='contributor').count()
        user_count = User.query.filter_by(role='user').count()
        
        print("=== Role Distribution ===")
        print(f"Admins: {admin_count}")
        print(f"Contributors: {contributor_count}")
        print(f"Users: {user_count}")
        
        # Show recent logins
        recent_users = User.query.filter(User.last_login.isnot(None)).order_by(User.last_login.desc()).limit(5).all()
        
        print("\n=== Recent Logins ===")
        for user in recent_users:
            print(f"  {user.github_username}: {user.last_login}")

if __name__ == "__main__":
    debug_users()