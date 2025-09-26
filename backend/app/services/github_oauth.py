import os
import requests
from authlib.integrations.flask_client import OAuth
from flask import current_app
from app.models.user import UserRole
from app.models.audit_log import AuditLog, AuditAction
from app import db

class GitHubOAuth:
    def __init__(self, app=None):
        self.oauth = OAuth()
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize OAuth with Flask app"""
        self.oauth.init_app(app)
        
        # Register GitHub OAuth client
        self.github = self.oauth.register(
            name='github',
            client_id=os.getenv('GITHUB_CLIENT_ID'),
            client_secret=os.getenv('GITHUB_CLIENT_SECRET'),
            server_metadata_url='https://api.github.com/.well-known/openid_configuration',
            client_kwargs={
                'scope': 'user:email'
            }
        )
    
    def get_authorization_url(self, redirect_uri):
        """Generate GitHub OAuth authorization URL"""
        try:
            return self.github.authorize_redirect(redirect_uri)
        except Exception as e:
            current_app.logger.error(f"Error generating authorization URL: {str(e)}")
            return None
    
    def get_access_token(self, code):
        """Exchange authorization code for access token"""
        token_url = 'https://github.com/login/oauth/access_token'
        
        data = {
            'client_id': os.getenv('GITHUB_CLIENT_ID'),
            'client_secret': os.getenv('GITHUB_CLIENT_SECRET'),
            'code': code
        }
        
        headers = {'Accept': 'application/json'}
        
        try:
            response = requests.post(token_url, data=data, headers=headers, timeout=10)
            
            if response.status_code == 200:
                token_data = response.json()
                if 'access_token' in token_data:
                    return token_data
                else:
                    current_app.logger.error(f"No access token in response: {token_data}")
                    return None
            else:
                current_app.logger.error(f"Token exchange failed: {response.status_code} - {response.text}")
                return None
                
        except requests.RequestException as e:
            current_app.logger.error(f"Request error during token exchange: {str(e)}")
            return None
        except Exception as e:
            current_app.logger.error(f"Unexpected error during token exchange: {str(e)}")
            return None
    
    def get_user_info(self, access_token):
        """Get user information from GitHub API with enhanced error handling"""
        headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/json',
            'User-Agent': 'VersionIntel-App/1.0'
        }
        
        try:
            # Get user basic info
            user_response = requests.get('https://api.github.com/user', headers=headers, timeout=15)
            if user_response.status_code == 401:
                current_app.logger.error("GitHub API returned 401 - Invalid access token")
                return None
            elif user_response.status_code == 403:
                current_app.logger.error("GitHub API returned 403 - Rate limit exceeded")
                return None
            elif user_response.status_code != 200:
                current_app.logger.error(f"Failed to get user info: {user_response.status_code} - {user_response.text}")
                return None
            
            user_data = user_response.json()
            
            # Validate required fields
            if not user_data.get('id') or not user_data.get('login'):
                current_app.logger.error("GitHub user data missing required fields (id or login)")
                return None
            
            # Get user emails
            email_response = requests.get('https://api.github.com/user/emails', headers=headers, timeout=10)
            emails = email_response.json() if email_response.status_code == 200 else []
            
            # Find primary email
            primary_email = None
            verified_email = None
            
            for email in emails:
                if email.get('primary') and email.get('verified'):
                    primary_email = email['email']
                    break
                elif email.get('verified') and not verified_email:
                    verified_email = email['email']
            
            # Use public email as fallback if no primary verified email
            if not primary_email:
                primary_email = verified_email or user_data.get('email')
            
            # Ensure we have an email
            if not primary_email:
                current_app.logger.error("No verified email found for GitHub user")
                return None
            
            # Create standardized user info
            user_info = {
                'github_id': str(user_data['id']),
                'github_username': user_data['login'],
                'email': primary_email,
                'name': user_data.get('name'),
                'avatar_url': user_data.get('avatar_url'),
                'bio': user_data.get('bio'),
                'company': user_data.get('company'),
                'location': user_data.get('location'),
                'public_repos': user_data.get('public_repos', 0),
                'followers': user_data.get('followers', 0),
                'following': user_data.get('following', 0),
                'github_created_at': user_data.get('created_at'),
                'github_updated_at': user_data.get('updated_at')
            }
            
            current_app.logger.info(f"Successfully retrieved GitHub user info for: {user_info['github_username']}")
            return user_info
            
        except requests.RequestException as e:
            current_app.logger.error(f"Request error during user info retrieval: {str(e)}")
            return None
        except Exception as e:
            current_app.logger.error(f"Unexpected error during user info retrieval: {str(e)}")
            return None
    
    def create_or_update_user(self, user_info, ip_address=None):
        """Create new user or update existing user from GitHub info"""
        from app.models.user import User  # Import here to avoid circular import
        
        try:
            # Look for existing user by GitHub ID first, then by email
            user = User.query.filter_by(github_id=user_info['github_id']).first()
            
            is_new_user = False
            old_values = None
            
            if not user:
                # Check if user exists with same email
                existing_user = User.query.filter_by(email=user_info['email']).first()
                
                if existing_user:
                    # Link GitHub account to existing user
                    old_values = existing_user.to_dict()
                    existing_user.github_id = user_info['github_id']
                    existing_user.github_username = user_info['github_username']
                    existing_user.name = user_info['name']
                    existing_user.avatar_url = user_info['avatar_url']
                    existing_user.updated_at = db.func.now()
                    user = existing_user
                    current_app.logger.info(f"Linked GitHub account to existing user: {user.email}")
                else:
                    # Create new user with contributor role (default)
                    is_new_user = True
                    user = User(
                        github_id=user_info['github_id'],
                        github_username=user_info['github_username'],
                        username=user_info['github_username'],  # Legacy field
                        name=user_info['name'],
                        email=user_info['email'],
                        avatar_url=user_info['avatar_url'],
                        role=UserRole.CONTRIBUTOR  # Default role for new GitHub users
                    )
                    db.session.add(user)
                    current_app.logger.info(f"Created new contributor user from GitHub: {user.email}")
            else:
                # Update existing GitHub user info
                old_values = user.to_dict()
                user.name = user_info['name']
                user.avatar_url = user_info['avatar_url']
                user.email = user_info['email']  # Update email in case it changed
                user.updated_at = db.func.now()
                current_app.logger.info(f"Updated existing GitHub user: {user.email}")
            
            # Update last login
            user.last_login = db.func.now()
            db.session.commit()
            
            # Log the authentication action
            if is_new_user:
                AuditLog.log_action(
                    user_id=user.id,
                    action=AuditAction.CREATE,
                    resource_type='user',
                    resource_id=user.id,
                    description=f"New user created via GitHub OAuth: {user.github_username}",
                    new_values=user.to_dict(),
                    ip_address=ip_address
                )
            
            AuditLog.log_action(
                user_id=user.id,
                action=AuditAction.LOGIN,
                resource_type='user',
                resource_id=user.id,
                description=f"User logged in via GitHub OAuth",
                ip_address=ip_address
            )
            
            return user
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating/updating user from GitHub: {str(e)}")
            raise

# Initialize OAuth instance
github_oauth = GitHubOAuth()