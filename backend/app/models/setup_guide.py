import uuid
from datetime import datetime
from app import db

class SetupGuide(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    instructions = db.Column(db.Text, nullable=False)
    
    # RBAC: Track who created this record
    created_by = db.Column(db.String, db.ForeignKey('users.id'), nullable=True, index=True)
    creator = db.relationship('User', backref='created_guides', lazy=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        try:
            return {
                'id': self.id,
                'product_id': self.product_id,
                'product_name': self.product.name if self.product else None,
                'instructions': self.instructions,
                'created_by': self.created_by,
                'creator': {
                    'id': self.creator.id,
                    'github_username': self.creator.github_username,
                    'username': self.creator.username,
                    'avatar_url': self.creator.avatar_url
                } if self.creator else None,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
        except Exception as e:
            # Fallback to basic data if there's an issue with relationships
            return {
                'id': self.id,
                'product_id': self.product_id,
                'product_name': None,
                'instructions': self.instructions,
                'created_by': self.created_by,
                'creator': None,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
