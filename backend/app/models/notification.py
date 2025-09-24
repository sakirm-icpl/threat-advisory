from app import db
from datetime import datetime
from sqlalchemy import Enum as SQLEnum
from enum import Enum

class NotificationType(Enum):
    CONTRIBUTION_APPROVED = "contribution_approved"
    CONTRIBUTION_REJECTED = "contribution_rejected" 
    PATTERN_TESTED = "pattern_tested"
    NEW_FOLLOWER = "new_follower"
    SYSTEM_ANNOUNCEMENT = "system_announcement"
    REPUTATION_MILESTONE = "reputation_milestone"

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(SQLEnum(NotificationType), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    
    # Metadata
    is_read = db.Column(db.Boolean, default=False)
    action_url = db.Column(db.String(500))  # URL to redirect to when clicked
    data = db.Column(db.JSON)  # Additional data for the notification
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type.value if self.type else None,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'action_url': self.action_url,
            'data': self.data,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None
        }