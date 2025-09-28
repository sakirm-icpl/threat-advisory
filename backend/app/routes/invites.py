from flask import Blueprint, request, jsonify
from app.models.invite import Invite
from app.models.user import User, UserRole
from app.services.rbac import get_current_user, require_permission
from app.services.email_service import EmailService
from app.services.email_diagnostic import EmailDiagnosticService
from app import db
from flask_jwt_extended import jwt_required
import secrets
import re
from datetime import datetime, timedelta

bp = Blueprint('invites', __name__, url_prefix='/api/invites')
email_service = EmailService()
email_diagnostic = EmailDiagnosticService()

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_role(role):
    """Validate role"""
    return role in ['admin', 'contributor']

@bp.route('/send', methods=['POST'])
@jwt_required()
@require_permission('write')
def send_invite():
    """Send invitation to a new user"""
    try:
        # Get current user
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        role = data.get('role', 'contributor').strip().lower()
        
        # Validate input
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if not validate_role(role):
            return jsonify({'error': 'Invalid role. Must be admin or contributor'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Check if there's already a pending invite for this email
        existing_invite = Invite.query.filter_by(
            email=email, 
            status='pending'
        ).first()
        
        if existing_invite and not existing_invite.is_expired():
            return jsonify({'error': 'Invitation already sent to this email'}), 400
        
        # Generate unique token
        invite_token = secrets.token_urlsafe(32)
        
        # Create new invite
        invite = Invite(
            email=email,
            role=role,
            invited_by=current_user.id,
            token=invite_token,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        
        db.session.add(invite)
        db.session.commit()
        
        # Send email
        inviter_name = current_user.github_username or current_user.username or current_user.name or 'Admin'
        
        if not email_service.is_configured():
            # If email service is not configured, return success but log warning
            print(f"WARNING: Email service not configured. Invite created but email not sent to {email}")
            return jsonify({
                'success': True,
                'message': 'Invitation created successfully, but email service is not configured',
                'invite_id': invite.id,
                'email_sent': False
            }), 200
        
        email_sent = email_service.send_invite_email(
            email=email,
            role=role,
            inviter_name=inviter_name,
            invite_token=invite_token
        )
        
        if email_sent:
            return jsonify({
                'success': True,
                'message': 'Invitation sent successfully',
                'invite_id': invite.id,
                'email_sent': True
            }), 200
        else:
            # Email failed but invite was created
            return jsonify({
                'success': True,
                'message': 'Invitation created but email sending failed',
                'invite_id': invite.id,
                'email_sent': False
            }), 200
            
    except Exception as e:
        db.session.rollback()
        print(f"Error sending invite: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/list', methods=['GET'])
@jwt_required()
@require_permission('read')
def list_invites():
    """List all invites (admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Only admins can list all invites
        if current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        invites = Invite.query.order_by(Invite.created_at.desc()).all()
        
        return jsonify({
            'invites': [invite.to_dict() for invite in invites]
        }), 200
        
    except Exception as e:
        print(f"Error listing invites: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/my-invites', methods=['GET'])
@jwt_required()
@require_permission('read')
def my_invites():
    """List invites sent by current user"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        invites = Invite.query.filter_by(invited_by=current_user.id).order_by(Invite.created_at.desc()).all()
        
        return jsonify({
            'invites': [invite.to_dict() for invite in invites]
        }), 200
        
    except Exception as e:
        print(f"Error listing user invites: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/cancel/<invite_id>', methods=['DELETE'])
@jwt_required()
@require_permission('write')
def cancel_invite(invite_id):
    """Cancel an invitation"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        invite = Invite.query.get(invite_id)
        if not invite:
            return jsonify({'error': 'Invitation not found'}), 404
        
        # Check if user can cancel this invite (must be the inviter or admin)
        if invite.invited_by != current_user.id and current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Not authorized to cancel this invitation'}), 403
        
        if invite.status != 'pending':
            return jsonify({'error': 'Can only cancel pending invitations'}), 400
        
        invite.status = 'cancelled'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Invitation cancelled successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error cancelling invite: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/resend/<invite_id>', methods=['POST'])
@jwt_required()
@require_permission('write')
def resend_invite(invite_id):
    """Resend an invitation email"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        invite = Invite.query.get(invite_id)
        if not invite:
            return jsonify({'error': 'Invitation not found'}), 404
        
        # Check if user can resend this invite (must be the inviter or admin)
        if invite.invited_by != current_user.id and current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Not authorized to resend this invitation'}), 403
        
        if invite.status != 'pending':
            return jsonify({'error': 'Can only resend pending invitations'}), 400
        
        if invite.is_expired():
            return jsonify({'error': 'Cannot resend expired invitation'}), 400
        
        # Send email
        inviter_name = current_user.github_username or current_user.username or current_user.name or 'Admin'
        
        if not email_service.is_configured():
            return jsonify({
                'success': False,
                'error': 'Email service is not configured'
            }), 500
        
        email_sent = email_service.send_invite_email(
            email=invite.email,
            role=invite.role,
            inviter_name=inviter_name,
            invite_token=invite.token
        )
        
        if email_sent:
            return jsonify({
                'success': True,
                'message': 'Invitation email resent successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to send invitation email'
            }), 500
            
    except Exception as e:
        print(f"Error resending invite: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/validate/<token>', methods=['GET'])
def validate_invite_token(token):
    """Validate an invitation token (public endpoint)"""
    try:
        invite = Invite.query.filter_by(token=token).first()
        
        if not invite:
            return jsonify({
                'valid': False,
                'error': 'Invalid invitation token'
            }), 404
        
        if invite.is_expired():
            return jsonify({
                'valid': False,
                'error': 'Invitation has expired'
            }), 400
        
        if invite.status != 'pending':
            return jsonify({
                'valid': False,
                'error': 'Invitation is no longer valid'
            }), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=invite.email).first()
        if existing_user:
            return jsonify({
                'valid': False,
                'error': 'User already exists'
            }), 400
        
        return jsonify({
            'valid': True,
            'email': invite.email,
            'role': invite.role,
            'inviter': invite.inviter.github_username if invite.inviter else 'Admin',
            'expires_at': invite.expires_at.isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error validating invite token: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/diagnose/connection', methods=['GET'])
@jwt_required()
@require_permission('read')
def diagnose_email_connection():
    """Diagnose email service connection and authentication"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Only admins can run diagnostics
        if current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        result = email_diagnostic.test_smtp_connection()
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error diagnosing email connection: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/diagnose/test-email', methods=['POST'])
@jwt_required()
@require_permission('write')
def send_test_email():
    """Send a test email to verify delivery"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Only admins can send test emails
        if current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.json
        if not data or 'email' not in data:
            return jsonify({'error': 'Email address is required'}), 400
        
        test_email = data['email'].strip().lower()
        if not validate_email(test_email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        result = email_diagnostic.send_test_email(test_email)
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error sending test email: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/send-corporate', methods=['POST'])
@jwt_required()
@require_permission('write')
def send_corporate_invite():
    """Send corporate-friendly invitation"""
    try:
        # Get current user
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        role = data.get('role', 'contributor').strip().lower()
        
        # Validate input
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if not validate_role(role):
            return jsonify({'error': 'Invalid role. Must be admin or contributor'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Check if there's already a pending invite for this email
        existing_invite = Invite.query.filter_by(
            email=email, 
            status='pending'
        ).first()
        
        if existing_invite and not existing_invite.is_expired():
            return jsonify({'error': 'Invitation already sent to this email'}), 400
        
        # Generate unique token
        invite_token = secrets.token_urlsafe(32)
        
        # Create new invite
        invite = Invite(
            email=email,
            role=role,
            invited_by=current_user.id,
            token=invite_token,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        
        db.session.add(invite)
        db.session.commit()
        
        # Send corporate-friendly email
        inviter_name = current_user.github_username or current_user.username or current_user.name or 'Admin'
        
        if not email_diagnostic.smtp_username:
            return jsonify({
                'success': True,
                'message': 'Invitation created successfully, but email service is not configured',
                'invite_id': invite.id,
                'email_sent': False
            }), 200
        
        email_sent = email_diagnostic.send_corporate_friendly_email(
            email=email,
            role=role,
            inviter_name=inviter_name,
            invite_token=invite_token
        )
        
        if email_sent:
            return jsonify({
                'success': True,
                'message': 'Corporate-friendly invitation sent successfully',
                'invite_id': invite.id,
                'email_sent': True
            }), 200
        else:
            return jsonify({
                'success': True,
                'message': 'Invitation created but email sending failed',
                'invite_id': invite.id,
                'email_sent': False
            }), 200
            
    except Exception as e:
        db.session.rollback()
        print(f"Error sending corporate invite: {str(e)}")
        return jsonify({'error': str(e)}), 500
