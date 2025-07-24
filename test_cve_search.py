#!/usr/bin/env python3
"""
Test script for CVE Search functionality
This script tests the new CVE search implementation to verify it works correctly.
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE_URL = f"{BASE_URL}/api/cve"

# Test credentials (use default admin credentials)
LOGIN_DATA = {
    "username": "admin",
    "password": "Admin@1234"
}

def get_auth_token():
    """Get authentication token"""
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=LOGIN_DATA)
        if response.status_code == 200:
            data = response.json()
            return data.get('access_token')
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error during login: {e}")
        return None

def test_cve_search(token, test_name, endpoint, params):
    """Test a CVE search endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {test_name}")
    print(f"Endpoint: {endpoint}")
    print(f"Params: {params}")
    print('='*60)
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE_URL}{endpoint}", headers=headers, params=params)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success!")
            print(f"Total Results: {data.get('total_results', 0)}")
            print(f"Search Type: {data.get('search_type', 'N/A')}")
            print(f"Method: {data.get('search_params', {}).get('method', 'N/A')}")
            
            # Show first few results
            results = data.get('results', [])
            if results:
                print(f"\nFirst {min(3, len(results))} results:")
                for i, cve in enumerate(results[:3]):
                    print(f"  {i+1}. {cve.get('id', 'N/A')} - {cve.get('severity', 'N/A')}")
                    print(f"     Description: {cve.get('description', 'N/A')[:100]}...")
                    if cve.get('vendors_products'):
                        vendors = [f"{vp.get('vendor', 'N/A')}/{vp.get('product', 'N/A')}" 
                                 for vp in cve['vendors_products'][:2]]
                        print(f"     Vendors/Products: {', '.join(vendors)}")
                    print()
            else:
                print("No results found")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def main():
    """Main test function"""
    print("🚀 Starting CVE Search Tests")
    print(f"Testing against: {BASE_URL}")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token. Exiting.")
        return
    
    print(f"✅ Authentication successful")
    
    # Test 1: Vendor-only search (Apache)
    test_cve_search(
        token,
        "Vendor-Only Search: Apache",
        "/search/vendor",
        {"vendor": "apache", "limit": 10}
    )
    
    # Test 2: Vendor + Product search (Apache Tomcat)
    test_cve_search(
        token,
        "Vendor + Product Search: Apache Tomcat",
        "/search/vendor-product",
        {"vendor": "apache", "product": "tomcat", "limit": 10}
    )
    
    # Test 3: Unified search - vendor only
    test_cve_search(
        token,
        "Unified Search: Vendor Only (apache)",
        "/search/unified",
        {"query": "apache", "limit": 10}
    )
    
    # Test 4: Unified search - vendor + product
    test_cve_search(
        token,
        "Unified Search: Vendor + Product (apache tomcat)",
        "/search/unified",
        {"query": "apache tomcat", "limit": 10}
    )
    
    # Test 5: Unified search - CVE ID
    test_cve_search(
        token,
        "Unified Search: CVE ID (CVE-2021-44228)",
        "/search/unified",
        {"query": "CVE-2021-44228", "limit": 10}
    )
    
    # Test 6: Keyword search
    test_cve_search(
        token,
        "Keyword Search: log4j",
        "/search/keyword",
        {"keyword": "log4j", "limit": 10}
    )
    
    # Test 7: Recent CVEs
    test_cve_search(
        token,
        "Recent CVEs (last 7 days)",
        "/recent",
        {"days": 7, "limit": 10}
    )
    
    # Test 8: CVE Statistics
    test_cve_search(
        token,
        "CVE Statistics",
        "/stats",
        {}
    )
    
    print(f"\n{'='*60}")
    print("🎉 All tests completed!")
    print('='*60)

if __name__ == "__main__":
    main() 