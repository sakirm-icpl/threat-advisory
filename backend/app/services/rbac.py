from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import (
    jwt_required, get_jwt_identity, verify_jwt_in_request
)
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog, AuditAction
from app import db
from datetime import datetime

def get_current_user():
    """Get current authenticated user"""
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        return User.query.get(user_id)
    except:
        return None

def get_request_info():
    """Extract request information for audit logging"""
    return {
        'ip_address': request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr),
        'user_agent': request.headers.get('User-Agent'),
        'endpoint': request.endpoint
    }

def require_admin(f):
    """Decorator to require admin role"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        
        if not user or not user.is_active:
            return jsonify({'error': 'Invalid or inactive user'}), 401
        
        if user.role != UserRole.ADMIN:
            # Log unauthorized access attempt
            request_info = get_request_info()
            AuditLog.log_action(
                user_id=user.id,
                action=AuditAction.READ,
                resource_type='admin_endpoint',
                description=f"Unauthorized admin access attempt to {request.endpoint}",
                **request_info
            )
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def require_contributor_or_admin(f):
    """Decorator to require contributor or admin role"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        
        if not user or not user.is_active:
            return jsonify({'error': 'Invalid or inactive user'}), 401
        
        if user.role not in [UserRole.ADMIN, UserRole.CONTRIBUTOR]:
            request_info = get_request_info()
            AuditLog.log_action(
                user_id=user.id,
                action=AuditAction.READ,
                resource_type='protected_endpoint',
                description=f"Unauthorized access attempt to {request.endpoint}",
                **request_info
            )
            return jsonify({'error': 'Contributor or admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def require_ownership_or_admin(resource_type, id_param='id'):
    """Decorator to require ownership of resource or admin role"""
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            
            if not user or not user.is_active:
                return jsonify({'error': 'Invalid or inactive user'}), 401
            
            # Admin can access everything
            if user.role == UserRole.ADMIN:
                return f(*args, **kwargs)
            
            # Contributors can only access their own records
            if user.role == UserRole.CONTRIBUTOR:
                resource_id = kwargs.get(id_param) or request.view_args.get(id_param)
                
                if not resource_id:
                    return jsonify({'error': 'Resource ID not found'}), 400
                
                # Check ownership based on resource type
                if not check_resource_ownership(user.id, resource_type, resource_id):
                    request_info = get_request_info()
                    AuditLog.log_action(
                        user_id=user.id,
                        action=AuditAction.READ,
                        resource_type=resource_type,
                        resource_id=resource_id,
                        description=f"Unauthorized access attempt to {resource_type} {resource_id}",
                        **request_info
                    )
                    return jsonify({'error': 'Access denied - you can only access your own records'}), 403
                
                return f(*args, **kwargs)
            
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        return decorated_function
    return decorator

def check_resource_ownership(user_id, resource_type, resource_id):
    """Check if user owns the specified resource"""
    try:
        if resource_type == 'vendor':
            from app.models.vendor import Vendor
            resource = Vendor.query.get(resource_id)
            return resource and str(resource.created_by) == str(user_id)
        
        elif resource_type == 'product':
            from app.models.product import Product
            resource = Product.query.get(resource_id)
            return resource and str(resource.created_by) == str(user_id)
        
        elif resource_type == 'method':
            from app.models.detection_method import DetectionMethod
            resource = DetectionMethod.query.get(resource_id)
            return resource and str(resource.created_by) == str(user_id)
        
        elif resource_type == 'guide':
            from app.models.setup_guide import SetupGuide
            resource = SetupGuide.query.get(resource_id)
            return resource and str(resource.created_by) == str(user_id)
        
        elif resource_type == 'user':
            # Users can only edit their own profile
            return str(resource_id) == str(user_id)
        
        else:
            current_app.logger.warning(f"Unknown resource type for ownership check: {resource_type}")
            return False
    
    except Exception as e:
        current_app.logger.error(f"Error checking resource ownership: {str(e)}")
        return False

def can_modify_resource(user, resource):
    """Check if user can modify a specific resource"""
    if not user or not user.is_active:
        return False
    
    if user.role == UserRole.ADMIN:
        return True
    
    if user.role == UserRole.CONTRIBUTOR:
        # Check if user created this resource
        return hasattr(resource, 'created_by') and str(resource.created_by) == str(user.id)
    
    return False

# Legacy auth functions for backward compatibility
def require_permission(permission):
    """Legacy decorator for backward compatibility"""
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user = get_current_user()
            
            if not user or not user.is_active:
                return jsonify({'error': 'Invalid or inactive user'}), 401
            
            if not user.has_permission(permission):
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator