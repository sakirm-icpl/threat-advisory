#!/usr/bin/env python3
"""
Test script for the CVE Search Client

This script demonstrates how to use the CVESearchClient class to query the cve-search API.
"""

from cve_search_client import CVESearchClient, print_results


def test_cve_search():
    """Test the CVE search functionality with example queries"""
    
    # Initialize the client
    # You can change the server URL if your cve-search is running on a different host/port
    client = CVESearchClient("http://localhost:8000")
    
    # Test cases - common vendors and products
    test_cases = [
        ("apache", "http_server"),
        ("microsoft", "windows"),
        ("openssl", "openssl"),
        ("nginx", "nginx"),
        ("mozilla", "firefox"),
        ("google", "chrome"),
        ("oracle", "mysql"),
        ("postgresql", "postgresql"),
        ("redis", "redis"),
        ("elasticsearch", "elasticsearch")
    ]
    
    print("🔍 Testing CVE Search Client")
    print("=" * 50)
    
    # Check server status first
    if client.check_server_status():
        print("✅ cve-search server is accessible")
    else:
        print("❌ Warning: cve-search server is not accessible")
        print("   Make sure the server is running at http://localhost:8000")
        print("   You can still run the tests, but they may fail.\n")
    
    print()
    
    # Run test cases
    for vendor, product in test_cases:
        print(f"Testing: {vendor}/{product}")
        print("-" * 30)
        
        try:
            results = client.search_cves_by_vendor_product(vendor, product)
            print_results(results)
            
            # Add a small delay between requests to be respectful to the server
            import time
            time.sleep(1)
            
        except Exception as e:
            print(f"❌ Error testing {vendor}/{product}: {e}")
        
        print("\n" + "="*50 + "\n")


def test_single_search():
    """Test a single search with custom parameters"""
    
    # You can modify these values to test specific vendors/products
    vendor = "apache"
    product = "tomcat"
    server_url = "http://localhost:8000"
    
    print(f"🔍 Single Search Test: {vendor}/{product}")
    print(f"🌐 Server: {server_url}")
    print("=" * 50)
    
    client = CVESearchClient(server_url)
    results = client.search_cves_by_vendor_product(vendor, product)
    print_results(results)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "single":
        test_single_search()
    else:
        test_cve_search() 