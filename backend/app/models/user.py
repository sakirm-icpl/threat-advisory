import uuid
from datetime import datetime
from app import db, bcrypt

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for OAuth users
    role = db.Column(db.String(20), default='user')  # admin, user, readonly
    is_active = db.Column(db.Boolean, default=True)
    
    # GitHub OAuth fields
    github_id = db.Column(db.Integer, unique=True, nullable=True)
    github_username = db.Column(db.String(100), nullable=True)
    github_avatar_url = db.Column(db.String(500), nullable=True)
    display_name = db.Column(db.String(200), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def set_password(self, password):
        if password:
            self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        if not self.password_hash:
            return False
        return bcrypt.check_password_hash(self.password_hash, password)
    
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
        if self.role == 'admin':
            return True
        elif self.role == 'user':
            return permission in ['read', 'write']
        elif self.role == 'readonly':
            return permission == 'read'
        return False 