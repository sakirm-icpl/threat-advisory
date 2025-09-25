import uuid
from datetime import datetime
from app import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)  # GitHub username
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), default='user')  # admin, contributor, user
    is_active = db.Column(db.Boolean, default=True)
    
    # GitHub OAuth fields (all required for GitHub-only auth)
    github_id = db.Column(db.Integer, unique=True, nullable=False)
    github_username = db.Column(db.String(100), nullable=False)
    github_avatar_url = db.Column(db.String(500), nullable=True)
    display_name = db.Column(db.String(200), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def to_dict(self):
        try:
            return {
                'id': self.id,
                'username': self.username,
                'email': self.email,
                'role': self.role,
                'is_active': self.is_active,
                'github_id': self.github_id,
                'github_username': self.github_username,
                'github_avatar_url': self.github_avatar_url,
                'display_name': self.display_name,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None,
                'last_login': self.last_login.isoformat() if self.last_login else None
            }
        except Exception as e:
            # Fallback to basic data if there's an issue
            return {
                'id': self.id,
                'username': self.username,
                'email': self.email,
                'role': self.role,
                'is_active': self.is_active,
                'github_username': self.github_username,
                'display_name': self.display_name,
                'created_at': None,
                'updated_at': None,
                'last_login': None
            }
    
    def has_permission(self, permission):
        """Check if user has specific permission based on role"""
        if self.role == 'admin':
            return True
        elif self.role == 'contributor':
            return permission in ['read', 'write', 'moderate']
        elif self.role == 'user':
            return permission in ['read', 'write']
        return False 