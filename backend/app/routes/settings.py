from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.user_profile import UserProfile
from app import db
from datetime import datetime

settings_bp = Blueprint('settings', __name__, url_prefix='/settings')

@settings_bp.route('/', methods=['GET'])
@jwt_required()
def get_settings():
    """Get user settings and profile"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get or create user profile
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            profile = UserProfile(user_id=user_id)
            db.session.add(profile)
            db.session.commit()
        
        return jsonify({
            'user': user.to_dict(),
            'profile': profile.to_dict()
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting user settings: {e}")
        return jsonify({'error': 'Failed to get settings'}), 500

@settings_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile information"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get or create user profile
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            profile = UserProfile(user_id=user_id)
            db.session.add(profile)
        
        data = request.json
        
        # Update profile fields
        if 'bio' in data:
            profile.bio = data['bio']
        if 'location' in data:
            profile.location = data['location']
        if 'company' in data:
            profile.company = data['company']
        if 'website' in data:
            profile.website = data['website']
        if 'twitter_username' in data:
            profile.twitter_username = data['twitter_username']
        if 'linkedin_url' in data:
            profile.linkedin_url = data['linkedin_url']
        
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': profile.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating profile: {e}")
        return jsonify({'error': 'Failed to update profile'}), 500

@settings_bp.route('/privacy', methods=['PUT'])
@jwt_required()
def update_privacy_settings():
    """Update privacy settings"""
    try:
        user_id = get_jwt_identity()
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        
        if not profile:
            profile = UserProfile(user_id=user_id)
            db.session.add(profile)
        
        data = request.json
        
        # Update privacy settings
        if 'is_public' in data:
            profile.is_public = data['is_public']
        if 'show_email' in data:
            profile.show_email = data['show_email']
        if 'show_activity' in data:
            profile.show_activity = data['show_activity']
        
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Privacy settings updated successfully',
            'profile': profile.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating privacy settings: {e}")
        return jsonify({'error': 'Failed to update privacy settings'}), 500

@settings_bp.route('/notifications', methods=['PUT'])
@jwt_required()
def update_notification_settings():
    """Update notification settings"""
    try:
        user_id = get_jwt_identity()
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        
        if not profile:
            profile = UserProfile(user_id=user_id)
            db.session.add(profile)
        
        data = request.json
        
        # Update notification settings
        if 'email_notifications' in data:
            profile.email_notifications = data['email_notifications']
        
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Notification settings updated successfully',
            'profile': profile.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating notification settings: {e}")
        return jsonify({'error': 'Failed to update notification settings'}), 500

@settings_bp.route('/password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password (for non-OAuth users)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user has GitHub OAuth (no password change allowed)
        if user.github_id:
            return jsonify({'error': 'Cannot change password for GitHub OAuth users'}), 400
        
        data = request.json
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current and new passwords are required'}), 400
        
        # Verify current password
        if not user.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Update password
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'})
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error changing password: {e}")
        return jsonify({'error': 'Failed to change password'}), 500

@settings_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Note: In a production system, you might want to:
        # 1. Anonymize contributions instead of deleting
        # 2. Have a grace period for account recovery
        # 3. Send confirmation emails
        
        # For now, we'll just mark the account as inactive
        user.is_active = False
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Account deactivated successfully'})
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting account: {e}")
        return jsonify({'error': 'Failed to delete account'}), 500