from app import db
from datetime import datetime

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Profile information
    bio = db.Column(db.Text)
    location = db.Column(db.String(100))
    company = db.Column(db.String(100))
    website = db.Column(db.String(200))
    twitter_username = db.Column(db.String(50))
    linkedin_url = db.Column(db.String(200))
    
    # Activity statistics
    contribution_count = db.Column(db.Integer, default=0)
    reputation_points = db.Column(db.Integer, default=0)
    patterns_submitted = db.Column(db.Integer, default=0)
    patterns_approved = db.Column(db.Integer, default=0)
    
    # Profile settings
    is_public = db.Column(db.Boolean, default=True)
    show_email = db.Column(db.Boolean, default=False)
    show_activity = db.Column(db.Boolean, default=True)
    email_notifications = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship back to user
    user = db.relationship('User', backref=db.backref('profile', uselist=False))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bio': self.bio,
            'location': self.location,
            'company': self.company,
            'website': self.website,
            'twitter_username': self.twitter_username,
            'linkedin_url': self.linkedin_url,
            'contribution_count': self.contribution_count,
            'reputation_points': self.reputation_points,
            'patterns_submitted': self.patterns_submitted,
            'patterns_approved': self.patterns_approved,
            'is_public': self.is_public,
            'show_email': self.show_email,
            'show_activity': self.show_activity,
            'email_notifications': self.email_notifications,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }