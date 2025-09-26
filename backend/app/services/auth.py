from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required, 
    get_jwt_identity, verify_jwt_in_request
)
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog, AuditAction
from app import db
from datetime import datetime, timedelta

def login_user(username, password):
    """Legacy authentication - kept for backward compatibility"""
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password) and user.is_active:
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Log the login action
        AuditLog.log_action(
            user_id=user.id,
            action=AuditAction.LOGIN,
            resource_type='user',
            resource_id=user.id,
            description="User logged in with username/password",
            ip_address=request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        )
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }
    
    return None

def login_github_user(user):
    """GitHub OAuth login - primary authentication method"""
    if not user or not user.is_active:
        return None
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }

def require_permission(permission):
    """Decorator to require specific permission based on user role"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user or not user.is_active:
                return jsonify({'error': 'Authentication required'}), 401
            
            # Check permissions based on role
            if user.role == UserRole.ADMIN:
                # Admin has all permissions
                return fn(*args, **kwargs)
            elif user.role == UserRole.CONTRIBUTOR:
                # Contributor has read permissions but limited write permissions
                if permission in ['read']:
                    return fn(*args, **kwargs)
                else:
                    return jsonify({'error': 'Insufficient permissions'}), 403
            else:
                return jsonify({'error': 'Insufficient permissions'}), 403
        return wrapper
    return decorator

def require_admin(fn):
    """Decorator to require admin role - uses new RBAC system"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_active or user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        return fn(*args, **kwargs)
    return wrapper

def get_current_user():
    """Get current authenticated user"""
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        return User.query.get(user_id)
    except:
        return None