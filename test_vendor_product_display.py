#!/usr/bin/env python3
"""
Test script to verify vendor/product display format in CVE search results
"""

import requests
import json

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

def test_vendor_product_display():
    """Test vendor/product display in search results"""
    token = login()
    if not token:
        print("❌ Cannot test - login failed")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test queries that should return vendor/product information
    test_queries = [
        "Apache httpd",
        "Microsoft Windows",
        "Oracle Java"
    ]
    
    for query in test_queries:
        print(f"\n🔍 Testing vendor/product display for: '{query}'")
        
        params = {"query": query, "limit": 3}
        
        try:
            response = requests.get(SEARCH_URL, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                print(f"✅ Found {len(results)} results")
                
                for i, cve in enumerate(results[:2]):  # Show first 2 results
                    print(f"\n  Result {i+1}:")
                    print(f"    CVE ID: {cve.get('cve_id', 'N/A')}")
                    
                    vendors_products = cve.get('vendors_products', [])
                    if vendors_products:
                        print(f"    Vendor/Product pairs: {len(vendors_products)}")
                        for vp in vendors_products:
                            vendor = vp.get('vendor', 'Unknown')
                            product = vp.get('product', 'Unknown')
                            print(f"      Vendor: {vendor} | Product: {product}")
                    else:
                        print(f"    ⚠️  No vendor/product information found")
                    
                    print(f"    Severity: {cve.get('severity', 'Unknown')}")
                    print(f"    CVSS Score: {cve.get('cvss_score', 'N/A')}")
                    
            else:
                print(f"❌ Search failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")

def main():
    """Run the test"""
    print("🚀 Testing Vendor/Product Display Format")
    print("=" * 50)
    
    test_vendor_product_display()
    
    print("\n" + "=" * 50)
    print("✅ Testing completed!")
    print("\n📝 Check the frontend at http://localhost:3000 to see the new display format")

if __name__ == "__main__":
    main() 