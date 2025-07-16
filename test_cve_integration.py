#!/usr/bin/env python3
"""
Test script for CVE integration functionality
Tests the CVE search API endpoints and functionality
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE_URL = "http://172.17.14.65:8000"
LOGIN_URL = f"{API_BASE_URL}/auth/login"

def login():
    """Login and get JWT token"""
    login_data = {
        "username": "admin",
        "password": "Admin@1234"
    }
    
    try:
        response = requests.post(LOGIN_URL, json=login_data)
        response.raise_for_status()
        token = response.json().get('access_token')
        print(f"✅ Login successful")
        return token
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return None

def test_cve_search_by_vendor_product(token):
    """Test CVE search by vendor and product"""
    print("\n🔍 Testing CVE search by vendor/product...")
    
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "vendor": "Apache",
        "product": "httpd",
        "limit": 5
    }
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/cve/search/vendor-product", 
                              headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        if data.get('error'):
            print(f"❌ Error: {data['error']}")
            return False
        
        results = data.get('results', [])
        total = data.get('total_results', 0)
        
        print(f"✅ Found {total} CVEs for Apache httpd")
        if results:
            print(f"   Sample CVE: {results[0].get('cve_id', 'N/A')}")
            print(f"   Severity: {results[0].get('severity', 'N/A')}")
            print(f"   CVSS Score: {results[0].get('cvss_score', 'N/A')}")
        
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_cve_search_by_keyword(token):
    """Test CVE search by keyword"""
    print("\n🔍 Testing CVE search by keyword...")
    
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "keyword": "log4j",
        "limit": 5
    }
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/cve/search/keyword", 
                              headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        if data.get('error'):
            print(f"❌ Error: {data['error']}")
            return False
        
        results = data.get('results', [])
        total = data.get('total_results', 0)
        
        print(f"✅ Found {total} CVEs for keyword 'log4j'")
        if results:
            print(f"   Sample CVE: {results[0].get('cve_id', 'N/A')}")
            print(f"   Description: {results[0].get('description', 'N/A')[:100]}...")
        
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_recent_cves(token):
    """Test recent CVEs endpoint"""
    print("\n🔍 Testing recent CVEs...")
    
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "days": 7,
        "limit": 5
    }
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/cve/recent", 
                              headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        if data.get('error'):
            print(f"❌ Error: {data['error']}")
            return False
        
        results = data.get('results', [])
        total = data.get('total_results', 0)
        
        print(f"✅ Found {total} recent CVEs (last 7 days)")
        if results:
            print(f"   Sample CVE: {results[0].get('cve_id', 'N/A')}")
            print(f"   Published: {results[0].get('published_date', 'N/A')}")
        
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_cve_details(token):
    """Test CVE details endpoint"""
    print("\n🔍 Testing CVE details...")
    
    headers = {"Authorization": f"Bearer {token}"}
    cve_id = "CVE-2021-44228"  # Log4Shell
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/cve/details/{cve_id}", 
                              headers=headers)
        response.raise_for_status()
        data = response.json()
        
        if data.get('error'):
            print(f"❌ Error: {data['error']}")
            return False
        
        print(f"✅ Retrieved details for {cve_id}")
        print(f"   Description: {data.get('description', 'N/A')[:100]}...")
        print(f"   Severity: {data.get('severity', 'N/A')}")
        print(f"   CVSS Score: {data.get('cvss_score', 'N/A')}")
        print(f"   References: {len(data.get('references', []))}")
        print(f"   Weaknesses: {len(data.get('weaknesses', []))}")
        
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_cve_stats(token):
    """Test CVE statistics endpoint"""
    print("\n🔍 Testing CVE statistics...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/cve/stats", headers=headers)
        response.raise_for_status()
        data = response.json()
        
        if data.get('error'):
            print(f"❌ Error: {data['error']}")
            return False
        
        print(f"✅ Retrieved CVE statistics")
        print(f"   Recent CVEs (7 days): {data.get('recent_cves_7_days', 0)}")
        print(f"   Severity distribution: {data.get('severity_distribution', {})}")
        print(f"   Top vendor/products: {len(data.get('top_vendor_products', []))}")
        
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_database_search(token):
    """Test CVE search from database"""
    print("\n🔍 Testing CVE search from database...")
    
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "limit": 3
    }
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/cve/search/from-database", 
                              headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        if data.get('error'):
            print(f"❌ Error: {data['error']}")
            return False
        
        searches = data.get('searches', [])
        total = data.get('total_cves_found', 0)
        
        print(f"✅ Found {total} total CVEs from database searches")
        print(f"   Number of vendor/product searches: {len(searches)}")
        
        if searches:
            sample = searches[0]
            print(f"   Sample search: {sample.get('vendor', 'N/A')} / {sample.get('product', 'N/A')}")
            print(f"   CVEs found: {sample.get('cve_results', {}).get('total_results', 0)}")
        
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Run all CVE integration tests"""
    print("🚀 Starting CVE Integration Tests")
    print("=" * 50)
    
    # Login
    token = login()
    if not token:
        print("❌ Cannot proceed without authentication")
        return
    
    # Run tests
    tests = [
        test_cve_search_by_vendor_product,
        test_cve_search_by_keyword,
        test_recent_cves,
        test_cve_details,
        test_cve_stats,
        test_database_search
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test(token):
                passed += 1
            time.sleep(1)  # Rate limiting
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All CVE integration tests passed!")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main() 