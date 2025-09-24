#!/usr/bin/env python3
"""
Debug script to check GitHub OAuth configuration
"""
import os
import requests

def check_github_oauth():
    """Check GitHub OAuth configuration"""
    print("🔍 GitHub OAuth Configuration Check")
    print("=" * 40)
    
    # Check environment variables
    client_id = os.environ.get('GITHUB_CLIENT_ID')
    client_secret = os.environ.get('GITHUB_CLIENT_SECRET')
    redirect_uri = os.environ.get('GITHUB_REDIRECT_URI')
    
    print(f"GITHUB_CLIENT_ID: {'✓ Set' if client_id else '✗ Missing'}")
    print(f"GITHUB_CLIENT_SECRET: {'✓ Set' if client_secret else '✗ Missing'}")
    print(f"GITHUB_REDIRECT_URI: {redirect_uri if redirect_uri else '✗ Missing'}")
    
    if not all([client_id, client_secret, redirect_uri]):
        print("\n❌ Missing required environment variables!")
        return False
    
    print(f"\nClient ID (first 8 chars): {client_id[:8] if client_id else 'N/A'}...")
    print(f"Redirect URI: {redirect_uri}")
    
    # Test if we can reach GitHub OAuth endpoints
    print("\n🌐 Testing GitHub OAuth endpoints...")
    
    try:
        # Test the authorize endpoint (this should return HTML)
        auth_url = f"https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&scope=user:email"
        response = requests.get(auth_url, timeout=10)
        
        if response.status_code == 200:
            print("✓ GitHub authorize endpoint reachable")
        else:
            print(f"✗ GitHub authorize endpoint returned {response.status_code}")
            
    except requests.RequestException as e:
        print(f"✗ Cannot reach GitHub: {e}")
        return False
    
    # Test token endpoint (this should return an error without proper auth)
    try:
        token_url = 'https://github.com/login/oauth/access_token'
        test_data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'code': 'test_code'  # This will fail, but we'll see if the endpoint is reachable
        }
        
        response = requests.post(token_url, data=test_data, headers={'Accept': 'application/json'}, timeout=10)
        
        if response.status_code in [400, 401]:  # Expected for invalid code
            print("✓ GitHub token endpoint reachable (responds with expected error)")
        else:
            print(f"? GitHub token endpoint returned unexpected status: {response.status_code}")
            
    except requests.RequestException as e:
        print(f"✗ Cannot reach GitHub token endpoint: {e}")
        return False
    
    print("\n✅ GitHub OAuth configuration appears correct!")
    print("\n📋 Troubleshooting Steps:")
    print("1. Verify your GitHub OAuth app settings at: https://github.com/settings/developers")
    print(f"2. Ensure the redirect URI in GitHub matches exactly: {redirect_uri}")
    print("3. Check that your app is not suspended or restricted")
    print("4. Verify the authorization callback URL in your GitHub app")
    
    return True

if __name__ == "__main__":
    # Load environment variables from .env file if present
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("✓ Loaded .env file")
    except ImportError:
        print("ℹ️ python-dotenv not available, using system environment variables")
    
    check_github_oauth()