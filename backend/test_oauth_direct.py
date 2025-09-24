#!/usr/bin/env python3
"""
Direct test of OAuth functionality without Docker
"""
import os
import sys
import requests
import json
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, '/app')
sys.path.insert(0, '.')

def test_oauth_endpoints():
    """Test OAuth endpoints directly"""
    base_url = "http://172.17.14.65:8000"
    
    print(f"🧪 Testing OAuth Endpoints at {base_url}")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"✓ Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"  Response: {response.json()}")
        else:
            print(f"  Error: {response.text}")
    except requests.RequestException as e:
        print(f"✗ Health check failed: {e}")
        return False
    
    # Test 2: GitHub OAuth login endpoint
    try:
        response = requests.get(f"{base_url}/auth/github/login", timeout=10)
        print(f"✓ OAuth login: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Auth URL generated: {bool(data.get('auth_url'))}")
            if data.get('auth_url'):
                print(f"  Auth URL: {data['auth_url'][:100]}...")
        else:
            print(f"  Error: {response.text}")
    except requests.RequestException as e:
        print(f"✗ OAuth login failed: {e}")
    
    # Test 3: Test OAuth callback with invalid code (should return specific error)
    try:
        callback_data = {
            'code': 'test_invalid_code',
            'state': 'test_state'
        }
        response = requests.post(
            f"{base_url}/auth/github/callback",
            headers={'Content-Type': 'application/json'},
            data=json.dumps(callback_data),
            timeout=10
        )
        print(f"✓ OAuth callback test: {response.status_code}")
        if response.status_code in [400, 401, 500]:
            data = response.json()
            print(f"  Expected error: {data.get('error', 'Unknown error')}")
        else:
            print(f"  Unexpected response: {response.text}")
    except requests.RequestException as e:
        print(f"✗ OAuth callback test failed: {e}")
    
    # Test 4: Check CORS headers
    try:
        response = requests.options(
            f"{base_url}/auth/github/callback",
            headers={
                'Origin': 'http://172.17.14.65:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=10
        )
        print(f"✓ CORS preflight: {response.status_code}")
        cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
        print(f"  CORS headers: {cors_headers}")
    except requests.RequestException as e:
        print(f"✗ CORS test failed: {e}")
    
    print("\n🎯 OAuth endpoint tests completed!")
    return True

if __name__ == "__main__":
    test_oauth_endpoints()