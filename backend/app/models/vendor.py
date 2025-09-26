import uuid
from datetime import datetime
from app import db

class Vendor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)
    products = db.relationship("Product", backref="vendor", lazy=True, cascade="all, delete-orphan")
    
    # RBAC: Track who created this record
    created_by = db.Column(db.String, db.ForeignKey('users.id'), nullable=True, index=True)
    creator = db.relationship('User', backref='created_vendors', lazy=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        try:
            return {
                'id': self.id,
                'name': self.name,
                'created_by': self.created_by,
                'creator_name': self.creator.github_username if self.creator else None,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
        except Exception as e:
            # Fallback to basic data if there's an issue
            return {
                'id': self.id,
                'name': self.name,
                'created_by': self.created_by,
                'creator_name': None,
                'created_at': None,
                'updated_at': None
            }
