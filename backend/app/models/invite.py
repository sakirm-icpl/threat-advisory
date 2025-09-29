import uuid
from datetime import datetime, timedelta
from app import db

class Invite(db.Model):
    __tablename__ = 'invites'
    
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False, default='contributor')
    invited_by = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    inviter = db.relationship('User', backref='sent_invites', lazy=True)
    
    # Invite status
    status = db.Column(db.String(20), default='pending')  # pending, accepted, expired
    token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(days=7))
    accepted_at = db.Column(db.DateTime)
    
    def to_dict(self):
        """Convert invite to dictionary for JSON serialization"""
        try:
            return {
                'id': self.id,
                'email': self.email,
                'role': self.role,
                'status': self.status,
                'invited_by': self.invited_by,
                'inviter': {
                    'id': self.inviter.id,
                    'github_username': self.inviter.github_username,
                    'username': self.inviter.username,
                    'avatar_url': self.inviter.avatar_url
                } if self.inviter else None,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'expires_at': self.expires_at.isoformat() if self.expires_at else None,
                'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
                'is_expired': self.is_expired()
            }
        except Exception as e:
            # Fallback to basic data if there's an issue
            return {
                'id': self.id,
                'email': self.email,
                'role': self.role,
                'status': self.status,
                'invited_by': self.invited_by,
                'inviter': None,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'expires_at': self.expires_at.isoformat() if self.expires_at else None,
                'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
                'is_expired': self.is_expired()
            }
    
    def is_expired(self):
        """Check if invite has expired"""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at
    
    def is_valid(self):
        """Check if invite is valid (not expired and pending)"""
        return self.status == 'pending' and not self.is_expired()
    
    def accept(self):
        """Mark invite as accepted"""
        self.status = 'accepted'
        self.accepted_at = datetime.utcnow()
        db.session.commit()
    
    def expire(self):
        """Mark invite as expired"""
        self.status = 'expired'
        db.session.commit()
