#!/usr/bin/env python3
"""
Test script for the unified CVE search functionality
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/auth/login"
SEARCH_URL = f"{BASE_URL}/api/cve/search/unified"

# Test credentials
CREDENTIALS = {
    "username": "admin",
    "password": "Admin@1234"
}

def login():
    """Login and get access token"""
    try:
        response = requests.post(LOGIN_URL, json=CREDENTIALS)
        response.raise_for_status()
        data = response.json()
        return data.get('access_token')
    except Exception as e:
        print(f"Login failed: {e}")
        return None

def test_search(query, expected_type=None):
    """Test unified search with a specific query"""
    token = login()
    if not token:
        print("❌ Cannot test search - login failed")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    params = {"query": query, "limit": 10}
    
    try:
        print(f"\n🔍 Testing search: '{query}'")
        response = requests.get(SEARCH_URL, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            search_type = data.get('search_type', 'unknown')
            total_results = data.get('total_results', 0)
            results = data.get('results', [])
            
            print(f"✅ Search successful")
            print(f"   Search type: {search_type}")
            print(f"   Total results: {total_results}")
            print(f"   Results returned: {len(results)}")
            
            if expected_type and search_type != expected_type:
                print(f"   ⚠️  Expected type '{expected_type}', got '{search_type}'")
            
            if results:
                print(f"   First result: {results[0].get('cve_id', 'N/A')}")
            
        else:
            print(f"❌ Search failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Search error: {e}")

def main():
    """Run all test cases"""
    print("🚀 Testing Unified CVE Search Functionality")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        # CVE ID searches
        ("CVE-2023-1234", "cve_id"),
        ("cve-2021-44228", "cve_id"),  # Log4j
        
        # Vendor/Product searches
        ("Apache httpd", "vendor_product"),
        ("Microsoft Windows", "vendor_product"),
        ("Oracle Java", "vendor_product"),
        
        # Keyword searches
        ("log4j", "keyword"),
        ("heartbleed", "keyword"),
        ("shellshock", "keyword"),
        
        # Vendor-only searches
        ("Apache", "vendor_only"),
        ("Microsoft", "vendor_only"),
        ("Oracle", "vendor_only"),
        
        # Product-only searches
        ("httpd", "keyword"),
        ("Windows", "keyword"),
        ("Java", "keyword"),
    ]
    
    for query, expected_type in test_cases:
        test_search(query, expected_type)
        time.sleep(1)  # Small delay to avoid rate limiting
    
    print("\n" + "=" * 50)
    print("✅ Testing completed!")

if __name__ == "__main__":
    main() 