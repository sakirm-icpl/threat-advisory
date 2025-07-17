#!/usr/bin/env python3
"""
Debug script to test dashboard endpoints and identify 422 errors
"""
import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, method="GET", data=None, headers=None):
    """Test a specific endpoint and return the response"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        else:
            print(f"Unsupported method: {method}")
            return None
            
        print(f"\n=== Testing {method} {endpoint} ===")
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"Response: {json.dumps(response_data, indent=2)}")
        except:
            print(f"Response Text: {response.text}")
            
        return response
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def main():
    print("Dashboard Debug Script")
    print("=" * 50)
    
    # Test health endpoint first
    print("\n1. Testing health endpoint...")
    test_endpoint("/health")
    
    # Test dashboard endpoints
    print("\n2. Testing dashboard summary...")
    test_endpoint("/dashboard/summary")
    
    print("\n3. Testing recent activity...")
    test_endpoint("/dashboard/recent-activity")
    
    # Test individual data endpoints
    print("\n4. Testing vendors endpoint...")
    test_endpoint("/vendors")
    
    print("\n5. Testing products endpoint...")
    test_endpoint("/products")
    
    print("\n6. Testing methods endpoint...")
    test_endpoint("/methods")
    
    print("\n7. Testing setup guides endpoint...")
    test_endpoint("/setup-guides")
    
    print("\n8. Testing users endpoint...")
    test_endpoint("/auth/users")
    
    print("\nDebug complete!")

if __name__ == "__main__":
    main() 