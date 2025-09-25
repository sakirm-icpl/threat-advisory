import uuid
import json
from datetime import datetime
from app import db

class CodeSnippet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    method_id = db.Column(db.Integer, db.ForeignKey("detection_method.id"), nullable=False)
    code_language = db.Column(db.String(50))
    code_content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'code_language': self.code_language,
            'code_content': self.code_content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class DetectionMethod(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    protocol = db.Column(db.String(256), nullable=False)  # Renamed from technique to protocol
    code_language = db.Column(db.String(50))  # Legacy field - will be deprecated
    code_content = db.Column(db.Text)  # Legacy field - will be deprecated
    curl_command = db.Column(db.Text)  # New field for curl commands
    expected_response = db.Column(db.Text)  # New field for expected output
    requires_auth = db.Column(db.Boolean, default=False)
    
    # RBAC: Track who created this record
    created_by = db.Column(db.String, db.ForeignKey('users.id'), nullable=True, index=True)
    creator = db.relationship('User', backref='created_methods', lazy=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with code snippets
    code_snippets = db.relationship('CodeSnippet', backref='detection_method', cascade='all, delete-orphan')

    def to_dict(self):
        try:
            # Include code snippets in the response
            snippets = [snippet.to_dict() for snippet in self.code_snippets]
            
            # If no snippets but legacy fields exist, create a snippet from them
            if not snippets and self.code_language and self.code_content:
                snippets = [{
                    'id': None,
                    'code_language': self.code_language,
                    'code_content': self.code_content,
                    'created_at': self.created_at.isoformat() if self.created_at else None,
                    'updated_at': self.updated_at.isoformat() if self.updated_at else None
                }]
            
            return {
                'id': self.id,
                'product_id': self.product_id,
                'product_name': self.product.name if self.product else None,
                'name': self.name,
                'protocol': self.protocol,
                'code_language': self.code_language,  # Keep for backward compatibility
                'code_content': self.code_content,    # Keep for backward compatibility
                'code_snippets': snippets,
                'expected_response': self.expected_response,
                'requires_auth': self.requires_auth,
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
                'name': self.name,
                'protocol': self.protocol,
                'code_language': self.code_language,
                'code_content': self.code_content,
                'code_snippets': [],
                'expected_response': self.expected_response,
                'requires_auth': self.requires_auth,
                'created_by': self.created_by,
                'creator': None,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
