from flask import Blueprint, request, jsonify
from app.models.user import User
from app.services.auth import get_current_user
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

bp = Blueprint('auth', __name__, url_prefix='/auth')

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