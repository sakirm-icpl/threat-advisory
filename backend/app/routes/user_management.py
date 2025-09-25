from flask import Blueprint, request, jsonify
from app.models.user import User
from app.services.auth import require_admin, get_current_user
from app import db
from datetime import datetime

bp = Blueprint('user_management', __name__, url_prefix='/admin/users')

@bp.route('', methods=['GET'])
@require_admin
def list_users():
    """Get all users for admin management"""
    try:
        users = User.query.all()
        user_list = []
        for user in users:
            user_data = user.to_dict()
            # Add additional info
            user_data['login_count'] = 1 if user.last_login else 0
            user_list.append(user_data)
        
        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<user_id>', methods=['GET'])
@require_admin  
def get_user(user_id):
    """Get specific user details"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<user_id>/role', methods=['PUT'])
@require_admin
def update_user_role(user_id):
    """Update user role"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.json
        new_role = data.get('role')
        
        if new_role not in ['admin', 'contributor', 'user']:
            return jsonify({'error': 'Invalid role. Must be admin, contributor, or user'}), 400
        
        # Prevent removing the last admin
        if user.role == 'admin' and new_role != 'admin':
            admin_count = User.query.filter_by(role='admin').count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot remove the last admin user'}), 400
        
        user.role = new_role
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': f'User role updated to {new_role}',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<user_id>/status', methods=['PUT'])
@require_admin
def update_user_status(user_id):
    """Activate or deactivate user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.json
        is_active = data.get('is_active')
        
        if is_active is None:
            return jsonify({'error': 'is_active field is required'}), 400
        
        # Prevent deactivating the last admin
        current_admin = get_current_user()
        if user.role == 'admin' and not is_active:
            admin_count = User.query.filter_by(role='admin', is_active=True).count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot deactivate the last admin user'}), 400
        
        user.is_active = bool(is_active)
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        status = 'activated' if is_active else 'deactivated'
        return jsonify({
            'message': f'User {status} successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    """Delete user (soft delete by deactivating)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent deleting the last admin
        if user.role == 'admin':
            admin_count = User.query.filter_by(role='admin', is_active=True).count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot delete the last admin user'}), 400
        
        # Prevent self-deletion
        current_admin = get_current_user()
        if current_admin and current_admin.id == user.id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        # Soft delete - just deactivate
        user.is_active = False
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'User deactivated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/promote/<github_username>', methods=['POST'])
@require_admin
def promote_github_user(github_username):
    """Promote a GitHub user to admin by username"""
    try:
        user = User.query.filter_by(github_username=github_username).first()
        if not user:
            return jsonify({'error': f'User with GitHub username "{github_username}" not found. User must login first.'}), 404
        
        data = request.json
        new_role = data.get('role', 'admin')
        
        if new_role not in ['admin', 'contributor', 'user']:
            return jsonify({'error': 'Invalid role. Must be admin, contributor, or user'}), 400
        
        user.role = new_role
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': f'GitHub user "{github_username}" promoted to {new_role}',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/stats', methods=['GET'])
@require_admin
def get_user_stats():
    """Get user statistics"""
    try:
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        admin_count = User.query.filter_by(role='admin', is_active=True).count()
        contributor_count = User.query.filter_by(role='contributor', is_active=True).count()
        user_count = User.query.filter_by(role='user', is_active=True).count()
        
        recent_logins = User.query.filter(User.last_login.isnot(None))\
                                 .order_by(User.last_login.desc())\
                                 .limit(10).all()
        
        return jsonify({
            'total_users': total_users,
            'active_users': active_users,
            'role_distribution': {
                'admin': admin_count,
                'contributor': contributor_count,
                'user': user_count
            },
            'recent_logins': [
                {
                    'github_username': user.github_username,
                    'display_name': user.display_name,
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'role': user.role
                }
                for user in recent_logins
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
