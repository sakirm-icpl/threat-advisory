import uuid
from datetime import datetime
from app import db
from flask_bcrypt import Bcrypt
from enum import Enum

bcrypt = Bcrypt()

class UserRole(Enum):
    """User roles enum for RBAC system"""
    ADMIN = 'admin'        # Full access, can manage users, promote/demote, manage system settings
    CONTRIBUTOR = 'contributor'  # Default role, can read all data and CRUD only their own records

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # GitHub OAuth fields (primary authentication method)
    github_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    github_username = db.Column(db.String(80), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=True)  # Full name from GitHub
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    
    # Legacy fields for backward compatibility (will be deprecated)
    username = db.Column(db.String(80), unique=True, nullable=True)  # Made nullable
    password_hash = db.Column(db.String(255), nullable=True)  # For legacy auth only
    
    # RBAC system - exactly 2 roles
    role = db.Column(db.Enum(UserRole), default=UserRole.CONTRIBUTOR, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        try:
            return {
                'id': self.id,
                'github_id': self.github_id,
                'github_username': self.github_username,
                'name': self.name,
                'email': self.email,
                'avatar_url': self.avatar_url,
                # Legacy fields for backward compatibility
                'username': self.username or self.github_username,
                'role': self.role.value if isinstance(self.role, UserRole) else self.role,
                'is_active': self.is_active,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None,
                'last_login': self.last_login.isoformat() if self.last_login else None
            }
        except Exception as e:
            # Fallback to basic data if there's an issue
            return {
                'id': self.id,
                'github_id': self.github_id,
                'github_username': self.github_username,
                'name': self.name,
                'email': self.email,
                'avatar_url': self.avatar_url,
                'username': self.username or self.github_username,
                'role': self.role.value if isinstance(self.role, UserRole) else self.role,
                'is_active': self.is_active,
                'created_at': None,
                'updated_at': None,
                'last_login': None
            }
    
    def has_permission(self, permission):
        """Check if user has specific permission based on RBAC"""
        if self.role == UserRole.ADMIN:
            return True  # Admin has all permissions
        elif self.role == UserRole.CONTRIBUTOR:
            return permission in ['read', 'write']  # Contributors can read all and write their own
        return False
    
    def can_manage_users(self):
        """Check if user can manage other users (admin only)"""
        return self.role == UserRole.ADMIN
    
    def can_edit_record(self, record_creator_id):
        """Check if user can edit a specific record based on ownership"""
        if self.role == UserRole.ADMIN:
            return True  # Admin can edit any record
        elif self.role == UserRole.CONTRIBUTOR:
            return str(record_creator_id) == str(self.id)  # Contributors can only edit their own
        return False
    
    def is_admin(self):
        """Check if user is admin"""
        return self.role == UserRole.ADMIN
    
    def is_contributor(self):
        """Check if user is contributor"""
        return self.role == UserRole.CONTRIBUTOR 