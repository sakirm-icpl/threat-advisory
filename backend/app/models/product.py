import uuid
from datetime import datetime
from app import db

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    category = db.Column(db.String(128))  # New field for product category
    description = db.Column(db.Text)      # New field for product description
    vendor_id = db.Column(db.Integer, db.ForeignKey("vendor.id"), nullable=False)
    detection_methods = db.relationship("DetectionMethod", backref="product", lazy=True)
    setup_guides = db.relationship("SetupGuide", backref="product", lazy=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        try:
            return {
                'id': self.id,
                'name': self.name,
                'category': self.category,
                'description': self.description,
                'vendor_id': self.vendor_id,
                'vendor_name': self.vendor.name if self.vendor else None,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
        except Exception as e:
            # Fallback to basic data if there's an issue with relationships
            return {
                'id': self.id,
                'name': self.name,
                'category': self.category,
                'description': self.description,
                'vendor_id': self.vendor_id,
                'vendor_name': None,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
