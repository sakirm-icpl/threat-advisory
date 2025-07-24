#!/usr/bin/env python3
"""
Comprehensive test script for Unified CVE Search functionality
This script tests the unified search with the specific examples provided.
"""

import requests
import json
import time
import sys

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
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return None

def test_unified_search(token, test_name, query, expected_behavior):
    """Test unified search with specific query and expected behavior"""
    print(f"\n{'='*80}")
    print(f"🧪 Testing: {test_name}")
    print(f"📝 Query: '{query}'")
    print(f"🎯 Expected: {expected_behavior}")
    print('='*80)
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        params = {
            'query': query,
            'limit': 10
        }
        
        response = requests.get(f"{API_BASE_URL}/search/unified", headers=headers, params=params)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success!")
            print(f"📈 Total Results: {data.get('total_results', 0)}")
            print(f"🔍 Search Type: {data.get('search_type', 'N/A')}")
            print(f"⚙️  Method: {data.get('search_params', {}).get('method', 'N/A')}")
            
            # Show first few results
            results = data.get('results', [])
            if results:
                print(f"\n📋 First {min(3, len(results))} results:")
                for i, cve in enumerate(results[:3]):
                    print(f"  {i+1}. {cve.get('id', 'N/A')} - {cve.get('severity', 'N/A')}")
                    print(f"     📝 Description: {cve.get('description', 'N/A')[:100]}...")
                    
                    # Show vendor/product information
                    vendors_products = cve.get('vendors_products', [])
                    if vendors_products:
                        vendor_info = []
                        for vp in vendors_products[:2]:
                            vendor = vp.get('vendor', 'N/A')
                            product = vp.get('product', 'N/A')
                            vendor_info.append(f"{vendor}/{product}")
                        print(f"     🏢 Vendors/Products: {', '.join(vendor_info)}")
                    print()
            else:
                print("❌ No results found")
                
            # Verify expected behavior
            verify_expected_behavior(data, expected_behavior, query)
            
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def verify_expected_behavior(data, expected_behavior, query):
    """Verify that the results match expected behavior"""
    print(f"\n🔍 Verifying Expected Behavior:")
    
    results = data.get('results', [])
    search_type = data.get('search_type', '')
    method = data.get('search_params', {}).get('method', '')
    
    if expected_behavior == "vendor_only":
        # Should return CVEs for all vendor products
        if "vendor_only" in method or "vendor_only" in search_type:
            print("✅ Correctly detected as vendor-only search")
        else:
            print("❌ Should be detected as vendor-only search")
            
        # Check if results include multiple products from the vendor
        if results:
            vendors_products = set()
            for cve in results:
                for vp in cve.get('vendors_products', []):
                    vendor = vp.get('vendor', '').lower()
                    if query.lower() in vendor or vendor in query.lower():
                        product = vp.get('product', '')
                        if product:
                            vendors_products.add(product)
            
            if len(vendors_products) > 1:
                print(f"✅ Found multiple products from vendor: {', '.join(list(vendors_products)[:5])}")
            else:
                print("⚠️  Expected multiple products from vendor")
    
    elif expected_behavior == "vendor_product":
        # Should return CVEs for specific vendor + product
        if "vendor_product" in method or "vendor_product" in search_type:
            print("✅ Correctly detected as vendor + product search")
        else:
            print("❌ Should be detected as vendor + product search")
            
        # Check if results are focused on specific product
        if results:
            products = set()
            for cve in results:
                for vp in cve.get('vendors_products', []):
                    product = vp.get('product', '')
                    if product:
                        products.add(product)
            
            if len(products) <= 3:  # Should be focused on specific product
                print(f"✅ Results focused on specific product(s): {', '.join(products)}")
            else:
                print("⚠️  Expected more focused results on specific product")
    
    elif expected_behavior == "cve_id":
        # Should return specific CVE details
        if search_type == "cve_id":
            print("✅ Correctly detected as CVE ID search")
        else:
            print("❌ Should be detected as CVE ID search")
            
        if len(results) == 1:
            print("✅ Returned single CVE result")
        else:
            print("❌ Expected single CVE result")
    
    elif expected_behavior == "keyword":
        # Should return keyword-based results
        if "keyword" in method:
            print("✅ Correctly detected as keyword search")
        else:
            print("❌ Should be detected as keyword search")

def main():
    """Main test function"""
    print("🚀 Starting Comprehensive Unified CVE Search Tests")
    print(f"🎯 Testing against: {BASE_URL}")
    print("📋 Testing the specific examples provided:")
    print("   - 'apache' should return all CVEs affecting any Apache products")
    print("   - 'apache tomcat' should return CVEs specifically affecting Apache Tomcat")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token. Exiting.")
        sys.exit(1)
    
    print(f"✅ Authentication successful")
    
    # Test 1: Vendor-only search (apache)
    test_unified_search(
        token,
        "Vendor-Only Search: Apache",
        "apache",
        "vendor_only"
    )
    
    # Test 2: Vendor + Product search (apache tomcat)
    test_unified_search(
        token,
        "Vendor + Product Search: Apache Tomcat",
        "apache tomcat",
        "vendor_product"
    )
    
    # Test 3: CVE ID search
    test_unified_search(
        token,
        "CVE ID Search: CVE-2021-44228",
        "CVE-2021-44228",
        "cve_id"
    )
    
    # Test 4: Keyword search
    test_unified_search(
        token,
        "Keyword Search: log4j",
        "log4j",
        "keyword"
    )
    
    # Test 5: Another vendor-only search
    test_unified_search(
        token,
        "Vendor-Only Search: Microsoft",
        "microsoft",
        "vendor_only"
    )
    
    # Test 6: Another vendor + product search
    test_unified_search(
        token,
        "Vendor + Product Search: Microsoft Windows",
        "microsoft windows",
        "vendor_product"
    )
    
    # Test 7: Single word that might be ambiguous
    test_unified_search(
        token,
        "Ambiguous Single Word: tomcat",
        "tomcat",
        "vendor_only"
    )
    
    print(f"\n{'='*80}")
    print("🎉 All unified search tests completed!")
    print("📊 Summary:")
    print("   - Vendor-only searches should return all vendor products")
    print("   - Vendor + product searches should return specific product CVEs")
    print("   - CVE ID searches should return single CVE details")
    print("   - Keyword searches should return relevant CVEs")
    print('='*80)

if __name__ == "__main__":
    main() 