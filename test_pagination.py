#!/usr/bin/env python3
"""
Test script to verify pagination works correctly on the last page
"""

import requests
import json

def test_pagination():
    """Test pagination on the last page for Apache search"""
    
    # Login to get token
    login_url = "http://localhost:8000/api/auth/login"
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        # Get authentication token
        response = requests.post(login_url, json=login_data)
        if response.status_code != 200:
            print(f"❌ Login failed: {response.status_code}")
            return
        
        token = response.json().get('access_token')
        if not token:
            print("❌ No access token received")
            return
        
        print("✅ Login successful")
        
        # Test Apache search on different pages
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test page 1
        print("\n🔍 Testing Page 1...")
        response = requests.get(
            "http://localhost:8000/api/cve/search/unified",
            headers=headers,
            params={"query": "apache", "limit": 20, "start_index": 0}
        )
        
        if response.status_code == 200:
            data = response.json()
            total_results = data.get('total_results', 0)
            results_count = len(data.get('results', []))
            print(f"✅ Page 1: {results_count} results, Total: {total_results}")
            
            # Calculate last page
            total_pages = (total_results + 19) // 20  # Ceiling division
            last_page_start = (total_pages - 1) * 20
            
            print(f"📄 Total pages: {total_pages}, Last page start index: {last_page_start}")
            
            # Test last page
            print(f"\n🔍 Testing Last Page ({total_pages})...")
            response = requests.get(
                "http://localhost:8000/api/cve/search/unified",
                headers=headers,
                params={"query": "apache", "limit": 20, "start_index": last_page_start}
            )
            
            if response.status_code == 200:
                data = response.json()
                results_count = len(data.get('results', []))
                print(f"✅ Last Page: {results_count} results")
                
                if results_count > 0:
                    print("🎉 SUCCESS: Last page returns results!")
                else:
                    print("⚠️  WARNING: Last page has no results")
            else:
                print(f"❌ Last page request failed: {response.status_code}")
                print(f"Response: {response.text}")
            
            # Test beyond last page (should return empty results, not error)
            print(f"\n🔍 Testing Beyond Last Page...")
            beyond_start = total_pages * 20
            response = requests.get(
                "http://localhost:8000/api/cve/search/unified",
                headers=headers,
                params={"query": "apache", "limit": 20, "start_index": beyond_start}
            )
            
            if response.status_code == 200:
                data = response.json()
                results_count = len(data.get('results', []))
                print(f"✅ Beyond Last Page: {results_count} results (should be 0)")
                
                if results_count == 0:
                    print("🎉 SUCCESS: Beyond last page correctly returns empty results!")
                else:
                    print("⚠️  WARNING: Beyond last page has unexpected results")
            else:
                print(f"❌ Beyond last page request failed: {response.status_code}")
                print(f"Response: {response.text}")
                
        else:
            print(f"❌ Page 1 request failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error during test: {e}")

if __name__ == "__main__":
    print("🚀 Starting Pagination Test")
    print("=" * 50)
    test_pagination()
    print("=" * 50)
    print("�� Test completed") 