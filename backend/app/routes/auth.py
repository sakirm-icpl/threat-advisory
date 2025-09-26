from flask import Blueprint, request, jsonify, redirect, url_for, current_app
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog, AuditAction
from app.services.auth import login_user, login_github_user, require_admin, get_current_user
from app.services.github_oauth import github_oauth
from app.services.rbac import get_request_info
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, create_refresh_token
from datetime import datetime
from flasgger import swag_from

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/login', methods=['POST'])
@swag_from({
    'tags': ['Authentication'],
    'summary': 'Legacy username/password login',
    'description': 'Legacy authentication method. GitHub OAuth is recommended.',
    'parameters': [{
        'name': 'credentials',
        'in': 'body',
        'required': True,
        'schema': {
            'type': 'object',
            'properties': {
                'username': {'type': 'string', 'example': 'admin'},
                'password': {'type': 'string', 'example': 'Admin@1234'}
            },
            'required': ['username', 'password']
        }
    }],
    'responses': {
        '200': {
            'description': 'Login successful',
            'schema': {
                'type': 'object',
                'properties': {
                    'access_token': {'type': 'string'},
                    'refresh_token': {'type': 'string'},
                    'user': {
                        'type': 'object',
                        'properties': {
                            'id': {'type': 'integer'},
                            'username': {'type': 'string'},
                            'email': {'type': 'string'},
                            'role': {'type': 'string', 'enum': ['admin', 'contributor']}
                        }
                    }
                }
            }
        },
        '401': {'description': 'Invalid credentials'},
        '400': {'description': 'Missing username or password'}
    }
})
def login():
    """Legacy username/password login - kept for backward compatibility"""
    try:
        data = request.json
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Log the legacy login attempt
        current_app.logger.warning(f"Legacy login attempt for username: {data['username']}")
        
        result = login_user(data['username'], data['password'])
        if result:
            current_app.logger.info(f"Legacy login successful for user: {data['username']}")
            return jsonify(result), 200
        else:
            # Log failed login attempt
            request_info = get_request_info()
            current_app.logger.warning(f"Failed legacy login attempt for username: {data['username']} from IP: {request_info['ip_address']}")
            return jsonify({'error': 'Invalid credentials. Please use GitHub OAuth for authentication.'}), 401
    except Exception as e:
        current_app.logger.error(f"Error in legacy login: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/github/login', methods=['GET'])
@swag_from({
    'tags': ['Authentication'],
    'summary': 'Initiate GitHub OAuth login',
    'description': 'Primary authentication method. Redirects to GitHub OAuth.',
    'parameters': [{
        'name': 'redirect_uri',
        'in': 'query',
        'type': 'string',
        'description': 'Callback URI after authentication',
        'default': 'http://localhost:3000/auth/github/callback'
    }],
    'responses': {
        '200': {
            'description': 'GitHub OAuth authorization URL',
            'schema': {
                'type': 'object',
                'properties': {
                    'authorization_url': {'type': 'string'},
                    'state': {'type': 'string'}
                }
            }
        },
        '500': {'description': 'Failed to initiate GitHub authentication'}
    }
})
def github_login():
    """Initiate GitHub OAuth login"""
    try:
        redirect_uri = request.args.get('redirect_uri', 'http://localhost:3000/auth/github/callback')
        result = github_oauth.get_authorization_url(redirect_uri)
        if result:
            current_app.logger.info(f"GitHub OAuth login initiated with state: {result.get('state', 'none')[:8]}...")
            return jsonify(result), 200
        else:
            return jsonify({'error': 'Failed to initiate GitHub authentication'}), 500
    except Exception as e:
        current_app.logger.error(f"Error initiating GitHub OAuth: {str(e)}")
        return jsonify({'error': 'Failed to initiate GitHub authentication'}), 500

@bp.route('/github/callback', methods=['GET'])
@bp.route('/callback', methods=['GET'])
@swag_from({
    'tags': ['Authentication'],
    'summary': 'GitHub OAuth callback handler',
    'description': 'Handles GitHub OAuth callback and issues JWT tokens',
    'parameters': [{
        'name': 'code',
        'in': 'query',
        'required': True,
        'type': 'string',
        'description': 'OAuth authorization code from GitHub'
    }, {
        'name': 'state',
        'in': 'query',
        'required': True,
        'type': 'string',
        'description': 'CSRF protection state parameter'
    }, {
        'name': 'error',
        'in': 'query',
        'type': 'string',
        'description': 'OAuth error message if any'
    }],
    'responses': {
        '200': {
            'description': 'Authentication successful',
            'schema': {
                'type': 'object',
                'properties': {
                    'access_token': {'type': 'string'},
                    'refresh_token': {'type': 'string'},
                    'user': {
                        'type': 'object',
                        'properties': {
                            'id': {'type': 'integer'},
                            'github_username': {'type': 'string'},
                            'email': {'type': 'string'},
                            'role': {'type': 'string', 'enum': ['admin', 'contributor']},
                            'github_id': {'type': 'string'}
                        }
                    }
                }
            }
        },
        '400': {'description': 'OAuth error, missing code/state, or CSRF validation failed'},
        '500': {'description': 'Authentication failed'}
    }
})
def github_callback():
    """Handle GitHub OAuth callback - primary authentication method"""
    code = request.args.get('code')
    state = request.args.get('state')
    error = request.args.get('error')
    
    current_app.logger.info(f"GitHub callback received - code: {'present' if code else 'missing'}, state: {'present' if state else 'missing'}, error: {error}")
    
    if error:
        current_app.logger.warning(f"GitHub OAuth error: {error}")
        return jsonify({'error': 'GitHub OAuth error', 'details': error}), 400
    
    if not code:
        current_app.logger.error("Authorization code not provided")
        return jsonify({'error': 'Authorization code not provided'}), 400
    
    if not state:
        current_app.logger.error("State parameter missing - CSRF protection failed")
        return jsonify({'error': 'State parameter missing - CSRF protection failed'}), 400
    
    try:
        current_app.logger.info(f"Attempting to exchange code for token with state: {state[:8]}...")
        
        # Exchange code for access token with state validation
        token_data = github_oauth.get_access_token(code, state)
        if not token_data or 'access_token' not in token_data:
            current_app.logger.error("Failed to get access token - token exchange failed")
            return jsonify({'error': 'Failed to get access token or CSRF validation failed'}), 400
        
        current_app.logger.info("Token exchange successful, fetching user info...")
        
        # Get user info from GitHub
        user_info = github_oauth.get_user_info(token_data['access_token'])
        if not user_info:
            current_app.logger.error("Failed to get user information from GitHub")
            return jsonify({'error': 'Failed to get user information'}), 400
        
        if not user_info.get('email'):
            current_app.logger.error("GitHub account missing verified email address")
            return jsonify({'error': 'GitHub account must have a verified public email address'}), 400
        
        current_app.logger.info(f"User info retrieved for: {user_info.get('github_username')}")
        
        # Create or update user
        request_info = get_request_info()
        user = github_oauth.create_or_update_user(user_info, request_info['ip_address'])
        
        if not user:
            current_app.logger.error("Failed to create or update user")
            return jsonify({'error': 'Failed to create or update user'}), 500
        
        current_app.logger.info(f"User created/updated successfully: {user.github_username}")
        
        # Generate JWT tokens
        result = login_github_user(user)
        if result:
            current_app.logger.info(f"GitHub OAuth login successful for user: {user.github_username}")
            return jsonify(result), 200
        else:
            current_app.logger.error("JWT token generation failed")
            return jsonify({'error': 'Authentication failed'}), 500
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"GitHub OAuth error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Authentication failed', 'details': str(e)}), 500

@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        user_id = get_jwt_identity()
        access_token = create_access_token(identity=user_id)
        return jsonify({'access_token': access_token}), 200
    except Exception as e:
        print(f"Error refreshing token: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        user = get_current_user()
        if user:
            return jsonify(user.to_dict()), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print(f"Error getting profile: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile (email, display name, etc.)"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        if 'email' in data:
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != user.id:
                return jsonify({'error': 'Email already exists'}), 409
            user.email = data['email']
        if 'display_name' in data:
            user.display_name = data['display_name']
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating profile: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/me/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change current user password"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        data = request.json
        if not data or 'old_password' not in data or 'new_password' not in data:
            return jsonify({'error': 'Old and new password are required'}), 400
        if not user.check_password(data['old_password']):
            return jsonify({'error': 'Old password is incorrect'}), 400
        if len(data['new_password']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        user.set_password(data['new_password'])
        db.session.commit()
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error changing password: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/users', methods=['POST'])
@require_admin
def create_user():
    """Create new user (admin only)"""
    try:
        data = request.json
        print(f"[DEBUG] Received user creation request with data: {data}")
        
        if not data or 'username' not in data or 'email' not in data or 'password' not in data:
            missing_fields = []
            if not data:
                missing_fields.append("request body")
            else:
                if 'username' not in data:
                    missing_fields.append("username")
                if 'email' not in data:
                    missing_fields.append("email")
                if 'password' not in data:
                    missing_fields.append("password")
            
            error_msg = f"Missing required fields: {', '.join(missing_fields)}"
            print(f"[DEBUG] Validation failed: {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            print(f"[DEBUG] Username already exists: {data['username']}")
            return jsonify({'error': 'Username already exists'}), 409
        
        if User.query.filter_by(email=data['email']).first():
            print(f"[DEBUG] Email already exists: {data['email']}")
            return jsonify({'error': 'Email already exists'}), 409
        
        user = User(
            username=data['username'],
            email=data['email'],
            role=data.get('role', 'user')
        )
        user.set_password(data['password'])
        
        print(f"[DEBUG] Creating user: {user.username} ({user.email}) with role: {user.role}")
        
        db.session.add(user)
        db.session.commit()
        
        print(f"[DEBUG] User created successfully with ID: {user.id}")
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"[DEBUG] Error creating user: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/users', methods=['GET'])
@require_admin
def list_users():
    """List all users (admin only)"""
    try:
        users = User.query.all()
        user_list = []
        for user in users:
            try:
                user_list.append(user.to_dict())
            except Exception as e:
                print(f"Error serializing user {user.id}: {str(e)}")
                # Skip problematic users instead of failing completely
                continue
        return jsonify(user_list), 200
    except Exception as e:
        print(f"Error listing users: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/users/<user_id>/promote', methods=['POST'])
@require_admin
@swag_from({
    'tags': ['Admin'],
    'summary': 'Promote user to admin role',
    'description': 'Promotes a contributor to admin role. Requires admin access.',
    'security': [{'Bearer': []}],
    'parameters': [{
        'name': 'user_id',
        'in': 'path',
        'required': True,
        'type': 'string',
        'description': 'User ID to promote'
    }],
    'responses': {
        '200': {
            'description': 'User promoted successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'},
                    'user': {
                        'type': 'object',
                        'properties': {
                            'id': {'type': 'integer'},
                            'github_username': {'type': 'string'},
                            'role': {'type': 'string', 'enum': ['admin', 'contributor']}
                        }
                    }
                }
            }
        },
        '400': {'description': 'User is already an admin'},
        '403': {'description': 'Admin access required'},
        '404': {'description': 'User not found'}
    }
})
def promote_user(user_id):
    """Promote user to admin role (admin only)"""
    try:
        current_user = get_current_user()
        target_user = User.query.get(user_id)
        
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        if target_user.role == UserRole.ADMIN:
            return jsonify({'error': 'User is already an admin'}), 400
        
        # Store old values for audit
        old_values = target_user.to_dict()
        
        # Promote to admin
        target_user.role = UserRole.ADMIN
        target_user.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Log the role change
        request_info = get_request_info()
        AuditLog.log_action(
            user_id=current_user.id,
            action=AuditAction.PROMOTE_USER,
            resource_type='user',
            resource_id=target_user.id,
            description=f"Promoted user {target_user.github_username} to admin",
            old_values=old_values,
            new_values=target_user.to_dict(),
            **request_info
        )
        
        current_app.logger.info(f"User {target_user.github_username} promoted to admin by {current_user.github_username}")
        return jsonify({
            'message': 'User promoted to admin successfully',
            'user': target_user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error promoting user {user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/users/<user_id>/demote', methods=['POST'])
@require_admin
@swag_from({
    'tags': ['Admin'],
    'summary': 'Demote admin to contributor role',
    'description': 'Demotes an admin to contributor role. Prevents self-demotion and last admin protection.',
    'security': [{'Bearer': []}],
    'parameters': [{
        'name': 'user_id',
        'in': 'path',
        'required': True,
        'type': 'string',
        'description': 'User ID to demote'
    }],
    'responses': {
        '200': {
            'description': 'User demoted successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'},
                    'user': {
                        'type': 'object',
                        'properties': {
                            'id': {'type': 'integer'},
                            'github_username': {'type': 'string'},
                            'role': {'type': 'string', 'enum': ['admin', 'contributor']}
                        }
                    }
                }
            }
        },
        '400': {'description': 'User is already a contributor or cannot demote last admin or self-demotion'},
        '403': {'description': 'Admin access required'},
        '404': {'description': 'User not found'}
    }
})
def demote_user(user_id):
    """Demote admin user to contributor role (admin only)"""
    try:
        current_user = get_current_user()
        target_user = User.query.get(user_id)
        
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        if target_user.role == UserRole.CONTRIBUTOR:
            return jsonify({'error': 'User is already a contributor'}), 400
        
        # Prevent self-demotion
        if target_user.id == current_user.id:
            return jsonify({'error': 'Cannot demote yourself'}), 400
        
        # Prevent demoting the last admin
        admin_count = User.query.filter_by(role=UserRole.ADMIN, is_active=True).count()
        if admin_count <= 1:
            return jsonify({'error': 'Cannot demote the last admin user'}), 400
        
        # Store old values for audit
        old_values = target_user.to_dict()
        
        # Demote to contributor
        target_user.role = UserRole.CONTRIBUTOR
        target_user.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Log the role change
        request_info = get_request_info()
        AuditLog.log_action(
            user_id=current_user.id,
            action=AuditAction.DEMOTE_USER,
            resource_type='user',
            resource_id=target_user.id,
            description=f"Demoted user {target_user.github_username} to contributor",
            old_values=old_values,
            new_values=target_user.to_dict(),
            **request_info
        )
        
        current_app.logger.info(f"User {target_user.github_username} demoted to contributor by {current_user.github_username}")
        return jsonify({
            'message': 'User demoted to contributor successfully',
            'user': target_user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error demoting user {user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/admin/audit-logs', methods=['GET'])
@require_admin
def get_audit_logs():
    """Get audit logs (admin only)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        action_filter = request.args.get('action')
        resource_type_filter = request.args.get('resource_type')
        user_id_filter = request.args.get('user_id')
        
        # Build query
        query = AuditLog.query
        
        if action_filter:
            query = query.filter(AuditLog.action == action_filter)
        
        if resource_type_filter:
            query = query.filter(AuditLog.resource_type == resource_type_filter)
        
        if user_id_filter:
            query = query.filter(AuditLog.user_id == user_id_filter)
        
        # Order by most recent first
        query = query.order_by(AuditLog.created_at.desc())
        
        # Paginate
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        audit_logs = [log.to_dict() for log in pagination.items]
        
        return jsonify({
            'audit_logs': audit_logs,
            'pagination': {
                'page': pagination.page,
                'pages': pagination.pages,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching audit logs: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/admin/system-stats', methods=['GET'])
@require_admin
def get_system_stats():
    """Get system statistics (admin only)"""
    try:
        # User statistics
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        admin_users = User.query.filter_by(role=UserRole.ADMIN, is_active=True).count()
        contributor_users = User.query.filter_by(role=UserRole.CONTRIBUTOR, is_active=True).count()
        github_users = User.query.filter(User.github_id.isnot(None)).count()
        
        # Recent login statistics
        from datetime import datetime, timedelta
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_logins = User.query.filter(User.last_login >= week_ago).count()
        
        # Audit log statistics
        total_audit_logs = AuditLog.query.count()
        recent_audit_logs = AuditLog.query.filter(AuditLog.created_at >= week_ago).count()
        
        return jsonify({
            'users': {
                'total': total_users,
                'active': active_users,
                'admins': admin_users,
                'contributors': contributor_users,
                'github_authenticated': github_users,
                'recent_logins_7d': recent_logins
            },
            'audit': {
                'total_logs': total_audit_logs,
                'recent_logs_7d': recent_audit_logs
            },
            'generated_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching system stats: {str(e)}")
        return jsonify({'error': str(e)}), 500 

@bp.route('/users/<user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    """Delete user (admin only)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent admin from deleting themselves
        current_user = get_current_user()
        if current_user and current_user.id == user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        # Prevent deleting the last admin
        if user.role == 'admin':
            admin_count = User.query.filter_by(role='admin', is_active=True).count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot delete the last admin user'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting user {user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/users/<user_id>/reset-password', methods=['POST'])
@require_admin
def reset_user_password(user_id):
    """Reset user password (admin only)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.json
        if not data or 'new_password' not in data:
            return jsonify({'error': 'New password is required'}), 400
        
        # Validate password strength
        if len(data['new_password']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password reset successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error resetting password for user {user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500