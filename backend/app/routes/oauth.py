from flask import Blueprint, request, jsonify, redirect, url_for, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.models.user import User
from app.models.contribution import ContributorProfile
from app import db
import requests
import urllib.parse
import secrets
from datetime import datetime

oauth_bp = Blueprint('oauth', __name__, url_prefix='/auth/github')

@oauth_bp.route('/login', methods=['GET'])
def github_login():
    """Initiate GitHub OAuth login"""
    try:
        client_id = current_app.config.get('GITHUB_CLIENT_ID')
        if not client_id:
            return jsonify({'error': 'GitHub OAuth not configured'}), 500
        
        # Generate a random state parameter for security
        state = secrets.token_urlsafe(32)
        
        # Store state in session or database for verification
        # For simplicity, we'll include it in the redirect
        
        github_auth_url = f"https://github.com/login/oauth/authorize"
        params = {
            'client_id': client_id,
            'redirect_uri': current_app.config.get('GITHUB_REDIRECT_URI'),
            'scope': 'user:email',
            'state': state
        }
        
        auth_url = f"{github_auth_url}?{urllib.parse.urlencode(params)}"
        
        return jsonify({
            'auth_url': auth_url,
            'state': state
        })
    
    except Exception as e:
        current_app.logger.error(f"GitHub OAuth initiation error: {e}")
        return jsonify({'error': 'OAuth initialization failed'}), 500

@oauth_bp.route('/callback', methods=['POST', 'OPTIONS'])
def github_callback():
    """Handle GitHub OAuth callback"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response
        
    try:
        data = request.json
        code = data.get('code')
        state = data.get('state')
        
        current_app.logger.info(f'GitHub callback received - code present: {bool(code)}, state: {state}')
        
        if not code:
            current_app.logger.error('No authorization code received')
            return jsonify({'error': 'Authorization code is required'}), 400
        
        # Exchange code for access token
        token_url = 'https://github.com/login/oauth/access_token'
        token_data = {
            'client_id': current_app.config.get('GITHUB_CLIENT_ID'),
            'client_secret': current_app.config.get('GITHUB_CLIENT_SECRET'),
            'code': code,
            'redirect_uri': current_app.config.get('GITHUB_REDIRECT_URI')
        }
        
        token_headers = {'Accept': 'application/json'}
        token_response = requests.post(token_url, data=token_data, headers=token_headers)
        
        current_app.logger.info(f'GitHub token response status: {token_response.status_code}')
        
        if token_response.status_code != 200:
            current_app.logger.error(f'GitHub token error: {token_response.text}')
            return jsonify({'error': 'Failed to get access token from GitHub'}), 400
        
        token_info = token_response.json()
        access_token = token_info.get('access_token')
        
        if not access_token:
            return jsonify({'error': 'No access token received'}), 400
        
        # Get user info from GitHub
        user_headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/json'
        }
        
        user_response = requests.get('https://api.github.com/user', headers=user_headers)
        if user_response.status_code != 200:
            return jsonify({'error': 'Failed to get user info'}), 400
        
        github_user = user_response.json()
        
        # Get user email (might be private)
        email_response = requests.get('https://api.github.com/user/emails', headers=user_headers)
        emails = email_response.json() if email_response.status_code == 200 else []
        primary_email = None
        
        for email in emails:
            if email.get('primary'):
                primary_email = email.get('email')
                break
        
        if not primary_email and emails:
            primary_email = emails[0].get('email')
        
        # Create or update user
        user = User.query.filter_by(github_id=github_user['id']).first()
        
        if not user:
            # Create new user with GitHub data
            user = User(
                username=github_user['login'],
                email=primary_email or f"{github_user['login']}@users.noreply.github.com",
                github_id=github_user['id'],
                github_username=github_user['login'],
                github_avatar_url=github_user.get('avatar_url'),
                display_name=github_user.get('name') or github_user['login'],
                role='user'  # Default role for new users
            )
            db.session.add(user)
            current_app.logger.info(f'Created new user: {user.username} (GitHub ID: {github_user["id"]})')
        else:
            # Update existing user with latest GitHub info
            user.github_username = github_user['login']
            user.github_avatar_url = github_user.get('avatar_url')
            user.display_name = github_user.get('name') or github_user['login']
            if primary_email:
                user.email = primary_email
            current_app.logger.info(f'Updated existing user: {user.username} (GitHub ID: {github_user["id"]})')
        
        # Update last login
        user.last_login = datetime.utcnow()
        
        # Create or update contributor profile
        contributor = ContributorProfile.query.filter_by(github_user_id=github_user['id']).first()
        
        if not contributor:
            contributor = ContributorProfile(
                github_username=github_user['login'],
                github_user_id=github_user['id'],
                github_avatar_url=github_user.get('avatar_url'),
                display_name=github_user.get('name', github_user['login']),
                bio=github_user.get('bio'),
                location=github_user.get('location'),
                company=github_user.get('company'),
                website=github_user.get('blog')
            )
            db.session.add(contributor)
        else:
            # Update contributor profile
            contributor.github_username = github_user['login']
            contributor.github_avatar_url = github_user.get('avatar_url')
            contributor.display_name = github_user.get('name', github_user['login'])
            contributor.bio = github_user.get('bio')
            contributor.location = github_user.get('location')
            contributor.company = github_user.get('company')
            contributor.website = github_user.get('blog')
        
        db.session.commit()
        
        # Create JWT tokens
        access_token_jwt = create_access_token(identity=user.id)
        refresh_token_jwt = create_refresh_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token_jwt,
            'refresh_token': refresh_token_jwt,
            'user': user.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"GitHub OAuth callback error: {e}")
        return jsonify({'error': 'OAuth callback failed'}), 500

@oauth_bp.route('/status', methods=['GET'])
@jwt_required()
def oauth_status():
    """Get current user's OAuth status"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'connected': bool(user.github_id),
            'github_username': user.github_username,
            'github_avatar_url': user.github_avatar_url
        })
    
    except Exception as e:
        current_app.logger.error(f"OAuth status error: {e}")
        return jsonify({'error': 'Failed to get OAuth status'}), 500