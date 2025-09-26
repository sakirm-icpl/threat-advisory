import uuid
from datetime import datetime
from app import db
from enum import Enum
import json

class AuditAction(Enum):
    """Audit actions for tracking system changes"""
    CREATE = 'CREATE'
    READ = 'READ'
    UPDATE = 'UPDATE'
    DELETE = 'DELETE'
    LOGIN = 'LOGIN'
    LOGOUT = 'LOGOUT'
    ROLE_CHANGE = 'ROLE_CHANGE'
    PASSWORD_RESET = 'PASSWORD_RESET'
    PROMOTE_USER = 'PROMOTE_USER'
    DEMOTE_USER = 'DEMOTE_USER'

class AuditLog(db.Model):
    """Audit log model for tracking all CRUD operations and role changes"""
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # User who performed the action
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False, index=True)
    user = db.relationship('User', backref='audit_logs', lazy=True)
    
    # Action details
    action = db.Column(db.Enum(AuditAction), nullable=False, index=True)
    resource_type = db.Column(db.String(50), nullable=False, index=True)  # 'user', 'product', 'method', etc.
    resource_id = db.Column(db.String(50), nullable=True, index=True)  # ID of affected resource
    
    # Additional context
    description = db.Column(db.Text, nullable=True)  # Human-readable description
    old_values = db.Column(db.Text, nullable=True)   # JSON of old values (for updates)
    new_values = db.Column(db.Text, nullable=True)   # JSON of new values (for updates)
    
    # Request context
    ip_address = db.Column(db.String(45), nullable=True)  # IPv4 or IPv6
    user_agent = db.Column(db.Text, nullable=True)
    endpoint = db.Column(db.String(200), nullable=True)  # API endpoint called
    
    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def __init__(self, user_id, action, resource_type, resource_id=None, 
                 description=None, old_values=None, new_values=None,
                 ip_address=None, user_agent=None, endpoint=None):
        self.user_id = user_id
        self.action = action
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.description = description
        self.old_values = json.dumps(old_values) if old_values else None
        self.new_values = json.dumps(new_values) if new_values else None
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.endpoint = endpoint
    
    def to_dict(self):
        """Convert audit log to dictionary for JSON serialization"""
        try:
            return {
                'id': self.id,
                'user_id': self.user_id,
                'user_name': self.user.github_username if self.user else None,
                'action': self.action.value if isinstance(self.action, AuditAction) else self.action,
                'resource_type': self.resource_type,
                'resource_id': self.resource_id,
                'description': self.description,
                'old_values': json.loads(self.old_values) if self.old_values else None,
                'new_values': json.loads(self.new_values) if self.new_values else None,
                'ip_address': self.ip_address,
                'user_agent': self.user_agent,
                'endpoint': self.endpoint,
                'created_at': self.created_at.isoformat() if self.created_at else None
            }
        except Exception as e:
            # Fallback to basic data if there's an issue
            return {
                'id': self.id,
                'user_id': self.user_id,
                'user_name': None,
                'action': self.action.value if isinstance(self.action, AuditAction) else self.action,
                'resource_type': self.resource_type,
                'resource_id': self.resource_id,
                'description': self.description,
                'old_values': None,
                'new_values': None,
                'ip_address': self.ip_address,
                'user_agent': self.user_agent,
                'endpoint': self.endpoint,
                'created_at': self.created_at.isoformat() if self.created_at else None
            }
    
    @staticmethod
    def log_action(user_id, action, resource_type, resource_id=None, 
                   description=None, old_values=None, new_values=None,
                   ip_address=None, user_agent=None, endpoint=None):
        """Static method to create and save audit log entry"""
        try:
            audit_entry = AuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                description=description,
                old_values=old_values,
                new_values=new_values,
                ip_address=ip_address,
                user_agent=user_agent,
                endpoint=endpoint
            )
            db.session.add(audit_entry)
            db.session.commit()
            return audit_entry
        except Exception as e:
            db.session.rollback()
            # Log the error but don't break the main functionality
            print(f"Failed to create audit log: {str(e)}")
            return None