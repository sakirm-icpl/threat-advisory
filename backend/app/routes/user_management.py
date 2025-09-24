from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.services.auth import require_admin, get_current_user
from app import db
from datetime import datetime, timedelta
import uuid

user_management_bp = Blueprint('user_management', __name__, url_prefix='/admin/users')

@user_management_bp.route('', methods=['GET'])
@require_admin
def list_users():
    """Get all users with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '', type=str)
        role_filter = request.args.get('role', '', type=str)
        status_filter = request.args.get('status', '', type=str)
        
        # Build query
        query = User.query
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    User.username.ilike(search_term),
                    User.email.ilike(search_term),
                    User.display_name.ilike(search_term),
                    User.github_username.ilike(search_term)
                )
            )
        
        # Apply role filter
        if role_filter:
            query = query.filter(User.role == role_filter)
            
        # Apply status filter
        if status_filter:
            if status_filter == 'active':
                query = query.filter(User.is_active == True)
            elif status_filter == 'inactive':
                query = query.filter(User.is_active == False)
        
        # Order by creation date (newest first)
        query = query.order_by(User.created_at.desc())
        
        # Paginate
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        users = []
        for user in pagination.items:
            user_data = user.to_dict()
            # Add additional admin fields
            user_data.update({
                'total_contributions': 0,  # TODO: Add actual count
                'last_activity': user.last_login.isoformat() if user.last_login else None,
                'account_age': (datetime.utcnow() - user.created_at).days if user.created_at else 0
            })
            users.append(user_data)
        
        return jsonify({
            'users': users,
            'pagination': {
                'page': pagination.page,
                'pages': pagination.pages,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            },
            'filters': {
                'search': search,
                'role': role_filter,
                'status': status_filter
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error listing users: {e}")
        return jsonify({'error': 'Failed to retrieve users'}), 500

@user_management_bp.route('/<user_id>', methods=['GET'])
@require_admin
def get_user_details(user_id):
    """Get detailed user information"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user_data = user.to_dict()
        
        # Add detailed admin information
        user_data.update({
            'total_contributions': 0,  # TODO: Add actual count from contributions table
            'recent_activity': [],     # TODO: Add recent activity log
            'permissions': {
                'can_submit_patterns': user.role in ['user', 'contributor', 'admin'],
                'can_moderate': user.role in ['contributor', 'admin'],
                'can_admin': user.role == 'admin'
            }
        })
        
        return jsonify(user_data)
        
    except Exception as e:
        current_app.logger.error(f"Error getting user details: {e}")
        return jsonify({'error': 'Failed to retrieve user details'}), 500

@user_management_bp.route('/<user_id>', methods=['PUT'])
@require_admin
def update_user(user_id):
    """Update user information and permissions"""
    try:
        current_user = get_current_user()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Prevent admin from demoting themselves
        if current_user.id == user_id and data.get('role') != 'admin':
            return jsonify({'error': 'Cannot demote your own admin privileges'}), 400
        
        # Prevent deactivating the last admin
        if (data.get('is_active') == False or data.get('role') != 'admin') and user.role == 'admin':
            admin_count = User.query.filter_by(role='admin', is_active=True).count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot deactivate or demote the last admin user'}), 400
        
        # Update allowed fields
        updatable_fields = ['role', 'is_active', 'display_name']
        updated_fields = []
        
        for field in updatable_fields:
            if field in data:
                old_value = getattr(user, field)
                new_value = data[field]
                
                # Validate role
                if field == 'role' and new_value not in ['user', 'contributor', 'admin']:
                    return jsonify({'error': 'Invalid role specified'}), 400
                
                setattr(user, field, new_value)
                updated_fields.append(f"{field}: {old_value} → {new_value}")
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        current_app.logger.info(f"User {user_id} updated by admin {current_user.id}: {', '.join(updated_fields)}")
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict(),
            'updated_fields': updated_fields
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating user {user_id}: {e}")
        return jsonify({'error': 'Failed to update user'}), 500

@user_management_bp.route('/<user_id>/ban', methods=['POST'])
@require_admin
def ban_user(user_id):
    """Ban/unban a user"""
    try:
        current_user = get_current_user()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent admin from banning themselves
        if current_user.id == user_id:
            return jsonify({'error': 'Cannot ban yourself'}), 400
        
        # Prevent banning the last admin
        if user.role == 'admin':
            admin_count = User.query.filter_by(role='admin', is_active=True).count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot ban the last admin user'}), 400
        
        data = request.json or {}
        action = data.get('action', 'ban')  # 'ban' or 'unban'
        reason = data.get('reason', 'No reason provided')
        
        if action == 'ban':
            user.is_active = False
            message = f"User {user.username} has been banned"
        else:
            user.is_active = True
            message = f"User {user.username} has been unbanned"
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        current_app.logger.info(f"User {user_id} {action}ned by admin {current_user.id}. Reason: {reason}")
        
        return jsonify({
            'message': message,
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error banning user {user_id}: {e}")
        return jsonify({'error': f'Failed to ban user'}), 500

@user_management_bp.route('/<user_id>/role', methods=['PUT'])
@require_admin
def change_user_role(user_id):
    """Change user role with detailed logging"""
    try:
        current_user = get_current_user()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.json
        new_role = data.get('role')
        
        if not new_role or new_role not in ['user', 'contributor', 'admin']:
            return jsonify({'error': 'Valid role required (user, contributor, admin)'}), 400
        
        # Prevent admin from demoting themselves
        if current_user.id == user_id and new_role != 'admin':
            return jsonify({'error': 'Cannot demote your own admin privileges'}), 400
        
        # Prevent demoting the last admin
        if user.role == 'admin' and new_role != 'admin':
            admin_count = User.query.filter_by(role='admin', is_active=True).count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot demote the last admin user'}), 400
        
        old_role = user.role
        user.role = new_role
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        current_app.logger.info(f"User {user_id} role changed from {old_role} to {new_role} by admin {current_user.id}")
        
        return jsonify({
            'message': f'User role changed from {old_role} to {new_role}',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error changing user role {user_id}: {e}")
        return jsonify({'error': 'Failed to change user role'}), 500

@user_management_bp.route('/stats', methods=['GET'])
@require_admin
def get_user_stats():
    """Get user statistics for admin dashboard"""
    try:
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        inactive_users = total_users - active_users
        
        # Role distribution
        role_stats = db.session.query(
            User.role,
            db.func.count(User.id).label('count')
        ).group_by(User.role).all()
        
        role_distribution = {role: count for role, count in role_stats}
        
        # Recent registrations (last 30 days)
        thirty_days_ago = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=30)
        recent_registrations = User.query.filter(
            User.created_at >= thirty_days_ago
        ).count()
        
        # Active users (logged in last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recently_active = User.query.filter(
            User.last_login >= seven_days_ago
        ).count()
        
        return jsonify({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'role_distribution': role_distribution,
            'recent_registrations': recent_registrations,
            'recently_active': recently_active,
            'growth_rate': {
                'daily': 0,  # TODO: Calculate actual growth rate
                'weekly': 0,
                'monthly': recent_registrations
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting user stats: {e}")
        return jsonify({'error': 'Failed to retrieve user statistics'}), 500

@user_management_bp.route('/bulk-action', methods=['POST'])
@require_admin
def bulk_user_action():
    """Perform bulk actions on users"""
    try:
        current_user = get_current_user()
        data = request.json
        
        user_ids = data.get('user_ids', [])
        action = data.get('action')
        
        if not user_ids or not action:
            return jsonify({'error': 'User IDs and action are required'}), 400
        
        if action not in ['activate', 'deactivate', 'promote_contributor', 'demote_user']:
            return jsonify({'error': 'Invalid action'}), 400
        
        # Prevent admin from affecting themselves in bulk operations
        if current_user.id in user_ids:
            return jsonify({'error': 'Cannot perform bulk actions on your own account'}), 400
        
        users = User.query.filter(User.id.in_(user_ids)).all()
        if not users:
            return jsonify({'error': 'No valid users found'}), 404
        
        updated_count = 0
        errors = []
        
        for user in users:
            try:
                # Check for admin protection
                if user.role == 'admin' and action in ['deactivate', 'demote_user']:
                    admin_count = User.query.filter_by(role='admin', is_active=True).count()
                    if admin_count <= 1:
                        errors.append(f"Cannot {action} last admin user: {user.username}")
                        continue
                
                # Apply action
                if action == 'activate':
                    user.is_active = True
                elif action == 'deactivate':
                    user.is_active = False
                elif action == 'promote_contributor':
                    if user.role == 'user':
                        user.role = 'contributor'
                elif action == 'demote_user':
                    if user.role == 'contributor':
                        user.role = 'user'
                
                user.updated_at = datetime.utcnow()
                updated_count += 1
                
            except Exception as e:
                errors.append(f"Error updating {user.username}: {str(e)}")
        
        db.session.commit()
        
        current_app.logger.info(f"Bulk action '{action}' performed by admin {current_user.id} on {updated_count} users")
        
        response = {
            'message': f'Bulk action completed. {updated_count} users updated.',
            'updated_count': updated_count,
            'total_requested': len(user_ids)
        }
        
        if errors:
            response['errors'] = errors
        
        return jsonify(response)
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error performing bulk action: {e}")
        return jsonify({'error': 'Failed to perform bulk action'}), 500