#!/usr/bin/env python3
"""
CVE Search Client Script

This script queries the open-source cve-search API to find CVEs affected by a specific vendor and product.
It provides comprehensive error handling and formatted output.

Usage:
    python cve_search_client.py <vendor> <product>
    python cve_search_client.py --interactive
"""

import requests
import json
import sys
import argparse
from typing import Dict, List, Optional
from datetime import datetime
import time


class CVESearchClient:
    """Client for interacting with the cve-search API"""
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        """
        Initialize the CVE Search client
        
        Args:
            base_url: Base URL of the cve-search API server
        """
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'CVE-Search-Client/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        
    def check_server_status(self) -> bool:
        """
        Check if the cve-search server is running and accessible
        
        Returns:
            True if server is accessible, False otherwise
        """
        try:
            # Try to connect to the server with a short timeout
            response = self.session.get(f"{self.base_url}/", timeout=5)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False
    
    def search_cves_by_vendor_product(self, vendor: str, product: str) -> Dict:
        """
        Search for CVEs by vendor and product using the cve-search API
        
        Args:
            vendor: Vendor name (e.g., 'apache', 'microsoft')
            product: Product name (e.g., 'http_server', 'windows')
            
        Returns:
            Dictionary containing CVE search results and metadata
        """
        try:
            # Construct the API endpoint URL
            endpoint = f"{self.base_url}/api/cvefor/{vendor}/{product}"
            
            print(f"Querying: {endpoint}")
            
            # Make the request
            response = self.session.get(endpoint, timeout=30)
            
            # Handle different response status codes
            if response.status_code == 200:
                data = response.json()
                return self._process_successful_response(data, vendor, product)
            elif response.status_code == 404:
                return {
                    'error': f'No CVEs found for vendor "{vendor}" and product "{product}"',
                    'results': [],
                    'total_results': 0,
                    'search_params': {'vendor': vendor, 'product': product}
                }
            elif response.status_code == 500:
                return {
                    'error': 'Internal server error from cve-search API',
                    'results': [],
                    'total_results': 0,
                    'search_params': {'vendor': vendor, 'product': product}
                }
            else:
                return {
                    'error': f'Unexpected HTTP status code: {response.status_code}',
                    'results': [],
                    'total_results': 0,
                    'search_params': {'vendor': vendor, 'product': product}
                }
                
        except requests.exceptions.ConnectionError:
            return {
                'error': f'Failed to connect to cve-search server at {self.base_url}. '
                        f'Please ensure the server is running and accessible.',
                'results': [],
                'total_results': 0,
                'search_params': {'vendor': vendor, 'product': product}
            }
        except requests.exceptions.Timeout:
            return {
                'error': 'Request timed out. The server may be overloaded or the query is too complex.',
                'results': [],
                'total_results': 0,
                'search_params': {'vendor': vendor, 'product': product}
            }
        except requests.exceptions.RequestException as e:
            return {
                'error': f'Request failed: {str(e)}',
                'results': [],
                'total_results': 0,
                'search_params': {'vendor': vendor, 'product': product}
            }
        except json.JSONDecodeError:
            return {
                'error': 'Invalid JSON response from server',
                'results': [],
                'total_results': 0,
                'search_params': {'vendor': vendor, 'product': product}
            }
        except Exception as e:
            return {
                'error': f'Unexpected error: {str(e)}',
                'results': [],
                'total_results': 0,
                'search_params': {'vendor': vendor, 'product': product}
            }
    
    def _process_successful_response(self, data: Dict, vendor: str, product: str) -> Dict:
        """
        Process a successful response from the cve-search API
        
        Args:
            data: Raw response data from the API
            vendor: Original vendor parameter
            product: Original product parameter
            
        Returns:
            Processed and formatted response
        """
        try:
            # Handle different response formats from cve-search
            if isinstance(data, list):
                # Direct list of CVEs
                cves = data
            elif isinstance(data, dict):
                # Dictionary with CVEs in a specific key
                if 'data' in data:
                    cves = data['data']
                elif 'results' in data:
                    cves = data['results']
                elif 'cves' in data:
                    cves = data['cves']
                else:
                    # Assume the entire dict is a single CVE or contains CVEs
                    cves = [data] if self._is_cve_data(data) else []
            else:
                cves = []
            
            # Process each CVE
            processed_cves = []
            for cve in cves:
                if self._is_cve_data(cve):
                    processed_cve = self._format_cve_data(cve)
                    processed_cves.append(processed_cve)
            
            return {
                'results': processed_cves,
                'total_results': len(processed_cves),
                'search_params': {'vendor': vendor, 'product': product},
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'error': f'Failed to process response data: {str(e)}',
                'results': [],
                'total_results': 0,
                'search_params': {'vendor': vendor, 'product': product}
            }
    
    def _is_cve_data(self, data: Dict) -> bool:
        """
        Check if the data represents a CVE entry
        
        Args:
            data: Data to check
            
        Returns:
            True if data appears to be CVE data
        """
        if not isinstance(data, dict):
            return False
        
        # Check for common CVE identifiers
        cve_indicators = ['id', 'cve_id', 'cve', 'summary', 'description', 'cvss']
        return any(indicator in data for indicator in cve_indicators)
    
    def _format_cve_data(self, cve: Dict) -> Dict:
        """
        Format CVE data into a standardized structure
        
        Args:
            cve: Raw CVE data from the API
            
        Returns:
            Formatted CVE data
        """
        formatted = {
            'id': self._extract_cve_id(cve),
            'summary': self._extract_summary(cve),
            'cvss_score': self._extract_cvss_score(cve),
            'publish_date': self._extract_publish_date(cve),
            'severity': self._extract_severity(cve),
            'references': self._extract_references(cve),
            'raw_data': cve  # Keep original data for debugging
        }
        
        return formatted
    
    def _extract_cve_id(self, cve: Dict) -> str:
        """Extract CVE ID from various possible field names"""
        for field in ['id', 'cve_id', 'cve', 'cveid']:
            if field in cve and cve[field]:
                return str(cve[field])
        return 'Unknown'
    
    def _extract_summary(self, cve: Dict) -> str:
        """Extract summary/description from various possible field names"""
        for field in ['summary', 'description', 'desc', 'title']:
            if field in cve and cve[field]:
                return str(cve[field])
        return 'No summary available'
    
    def _extract_cvss_score(self, cve: Dict) -> Optional[float]:
        """Extract CVSS score from various possible field names"""
        for field in ['cvss', 'cvss_score', 'score', 'cvss_v3', 'cvss_v2']:
            if field in cve:
                value = cve[field]
                if isinstance(value, (int, float)):
                    return float(value)
                elif isinstance(value, dict):
                    # Handle nested CVSS objects
                    for subfield in ['score', 'base_score', 'vector_string']:
                        if subfield in value and isinstance(value[subfield], (int, float)):
                            return float(value[subfield])
        return None
    
    def _extract_publish_date(self, cve: Dict) -> Optional[str]:
        """Extract publish date from various possible field names"""
        for field in ['published', 'publish_date', 'date', 'created', 'published_date']:
            if field in cve and cve[field]:
                return str(cve[field])
        return None
    
    def _extract_severity(self, cve: Dict) -> Optional[str]:
        """Extract severity from various possible field names"""
        for field in ['severity', 'risk', 'impact', 'cvss_severity']:
            if field in cve and cve[field]:
                return str(cve[field])
        return None
    
    def _extract_references(self, cve: Dict) -> List[str]:
        """Extract references from various possible field names"""
        for field in ['references', 'refs', 'links', 'urls']:
            if field in cve and isinstance(cve[field], list):
                return [str(ref) for ref in cve[field] if ref]
        return []


def print_results(results: Dict):
    """
    Print CVE search results in a formatted way
    
    Args:
        results: Results dictionary from CVESearchClient
    """
    if 'error' in results:
        print(f"\n❌ Error: {results['error']}")
        return
    
    total_results = results.get('total_results', 0)
    search_params = results.get('search_params', {})
    
    print(f"\n🔍 Search Results for {search_params.get('vendor', 'Unknown')} / {search_params.get('product', 'Unknown')}")
    print(f"📊 Total CVEs found: {total_results}")
    
    if total_results == 0:
        print("No CVEs found for the specified vendor and product.")
        return
    
    print("\n" + "="*80)
    
    for i, cve in enumerate(results.get('results', []), 1):
        print(f"\n{i}. CVE ID: {cve['id']}")
        print(f"   Summary: {cve['summary'][:100]}{'...' if len(cve['summary']) > 100 else ''}")
        
        if cve['cvss_score']:
            print(f"   CVSS Score: {cve['cvss_score']}")
        
        if cve['severity']:
            print(f"   Severity: {cve['severity']}")
        
        if cve['publish_date']:
            print(f"   Published: {cve['publish_date']}")
        
        if cve['references']:
            print(f"   References: {len(cve['references'])} found")
        
        print("-" * 40)


def interactive_mode(client: CVESearchClient):
    """
    Run the client in interactive mode
    
    Args:
        client: Initialized CVESearchClient instance
    """
    print("🔍 CVE Search Interactive Mode")
    print("=" * 40)
    
    # Check server status
    if not client.check_server_status():
        print(f"❌ Warning: Cannot connect to cve-search server at {client.base_url}")
        print("   Please ensure the server is running and accessible.")
        print("   You can still try searches, but they may fail.\n")
    else:
        print(f"✅ Connected to cve-search server at {client.base_url}\n")
    
    while True:
        try:
            vendor = input("Enter vendor name (or 'quit' to exit): ").strip()
            if vendor.lower() in ['quit', 'exit', 'q']:
                break
            
            if not vendor:
                print("Please enter a vendor name.")
                continue
            
            product = input("Enter product name: ").strip()
            if not product:
                print("Please enter a product name.")
                continue
            
            print(f"\nSearching for CVEs affecting {vendor}/{product}...")
            results = client.search_cves_by_vendor_product(vendor, product)
            print_results(results)
            
            print("\n" + "="*80)
            
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except EOFError:
            print("\n\nGoodbye!")
            break


def main():
    """Main function to handle command line arguments and execute the script"""
    parser = argparse.ArgumentParser(
        description='Search for CVEs by vendor and product using cve-search API',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python cve_search_client.py apache http_server
  python cve_search_client.py microsoft windows
  python cve_search_client.py --server http://192.168.1.100:5000 apache tomcat
  python cve_search_client.py --interactive
        """
    )
    
    parser.add_argument('vendor', nargs='?', help='Vendor name (e.g., apache, microsoft)')
    parser.add_argument('product', nargs='?', help='Product name (e.g., http_server, windows)')
    parser.add_argument('--server', '-s', default='http://localhost:5000',
                       help='cve-search server URL (default: http://localhost:5000)')
    parser.add_argument('--interactive', '-i', action='store_true',
                       help='Run in interactive mode')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Enable verbose output')
    
    args = parser.parse_args()
    
    # Initialize client
    client = CVESearchClient(args.server)
    
    if args.interactive:
        interactive_mode(client)
    elif args.vendor and args.product:
        # Single search mode
        if args.verbose:
            print(f"🔍 Searching for CVEs affecting {args.vendor}/{args.product}")
            print(f"🌐 Server: {args.server}")
        
        results = client.search_cves_by_vendor_product(args.vendor, args.product)
        print_results(results)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main() 