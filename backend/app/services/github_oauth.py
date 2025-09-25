import os
import requests
from authlib.integrations.flask_client import OAuth
from flask import current_app

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
        """Get user information from GitHub API"""
        headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/json'
        }
        
        try:
            # Get user basic info
            user_response = requests.get('https://api.github.com/user', headers=headers, timeout=10)
            if user_response.status_code != 200:
                current_app.logger.error(f"Failed to get user info: {user_response.status_code} - {user_response.text}")
                return None
            
            user_data = user_response.json()
            
            # Get user emails
            email_response = requests.get('https://api.github.com/user/emails', headers=headers, timeout=10)
            emails = email_response.json() if email_response.status_code == 200 else []
            
            # Find primary email
            primary_email = None
            for email in emails:
                if email.get('primary'):
                    primary_email = email['email']
                    break
            
            # Use public email as fallback
            if not primary_email:
                primary_email = user_data.get('email')
            
            return {
                'github_id': str(user_data['id']),
                'username': user_data['login'],
                'email': primary_email,
                'avatar_url': user_data.get('avatar_url'),
                'name': user_data.get('name'),
                'github_username': user_data['login']
            }
            
        except requests.RequestException as e:
            current_app.logger.error(f"Request error during user info retrieval: {str(e)}")
            return None
        except Exception as e:
            current_app.logger.error(f"Unexpected error during user info retrieval: {str(e)}")
            return None

# Initialize OAuth instance
github_oauth = GitHubOAuth()