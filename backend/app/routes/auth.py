from flask import Blueprint, request, jsonify
from app.models.user import User
from app.services.auth import login_user, require_admin, get_current_user
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.json
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username and password are required'}), 400
        
        result = login_user(data['username'], data['password'])
        if result:
            return jsonify(result), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Error in login: {str(e)}")
        return jsonify({'error': str(e)}), 500

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

@bp.route('/users/<user_id>', methods=['PUT'])
@require_admin
def update_user(user_id):
    """Update user (admin only)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'username' in data:
            existing = User.query.filter_by(username=data['username']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Username already exists'}), 409
            user.username = data['username']
        
        if 'email' in data:
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Email already exists'}), 409
            user.email = data['email']
        
        if 'role' in data:
            user.role = data['role']
        
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        if 'password' in data:
            user.set_password(data['password'])
        
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating user {user_id}: {str(e)}")
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