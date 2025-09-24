#!/usr/bin/env python3
"""
Test GitHub OAuth callback functionality
"""
import requests
import json

def test_github_callback():
    """Test the GitHub OAuth callback endpoint"""
    print("🧪 Testing GitHub OAuth Callback")
    print("=" * 40)
    
    backend_url = "http://172.17.14.65:8000"
    
    # Test 1: Check if backend is reachable
    try:
        response = requests.get(f"{backend_url}/health", timeout=10)
        print(f"✓ Backend health check: {response.status_code}")
        if response.status_code != 200:
            print(f"  Response: {response.text}")
    except requests.RequestException as e:
        print(f"✗ Cannot reach backend: {e}")
        return False
    
    # Test 2: Test the OAuth login endpoint
    try:
        response = requests.get(f"{backend_url}/auth/github/login", timeout=10)
        print(f"✓ OAuth login endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Auth URL generated: {bool(data.get('auth_url'))}")
        else:
            print(f"  Error: {response.text}")
    except requests.RequestException as e:
        print(f"✗ OAuth login error: {e}")
    
    # Test 3: Test CORS preflight
    try:
        response = requests.options(
            f"{backend_url}/auth/github/callback",
            headers={
                'Origin': 'http://172.17.14.65:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=10
        )
        print(f"✓ CORS preflight: {response.status_code}")
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        print(f"  CORS headers: {cors_headers}")
    except requests.RequestException as e:
        print(f"✗ CORS test error: {e}")
    
    # Test 4: Test callback with invalid code (should return error)
    try:
        response = requests.post(
            f"{backend_url}/auth/github/callback",
            headers={
                'Content-Type': 'application/json',
                'Origin': 'http://172.17.14.65:3000'
            },
            data=json.dumps({'code': 'invalid_test_code'}),
            timeout=10
        )
        print(f"✓ Callback test: {response.status_code}")
        if response.status_code in [400, 401, 500]:
            print("  Expected error response (good)")
        else:
            print(f"  Unexpected response: {response.text}")
    except requests.RequestException as e:
        print(f"✗ Callback test error: {e}")
    
    print("\n✅ OAuth endpoint tests completed!")
    return True

if __name__ == "__main__":
    test_github_callback()