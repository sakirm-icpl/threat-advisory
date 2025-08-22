import requests
import json
import os
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import time
import re
from functools import lru_cache

class CVEService:
    """Service for interacting with the National Vulnerability Database (NVD) API"""
    
    def __init__(self):
        # NVD API configuration
        self.nvd_base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
        # Get API key from environment variable (optional)
        self.api_key = os.getenv('NVD_API_KEY', '')
        
        # Session configuration with better timeout and retry settings
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'VersionIntel-CVE-Search/1.0',
            'Accept': 'application/json'
        })
        
        # Add API key if available
        if self.api_key:
            self.session.headers.update({'apiKey': self.api_key})
        
        # Rate limiting and timeout settings
        self.request_timeout = 30
        self.max_retries = 3
        self.retry_delay = 1  # seconds
    
    def search_cves_by_vendor_only(self, vendor: str, limit: int = 20, start_index: int = 0) -> Dict:
        """
        Search for CVEs by vendor only using dynamic CPE discovery.
        Returns all CVEs affecting any products from the specified vendor.
        """
        try:
            print(f"DEBUG: Starting vendor-only search for '{vendor}'")
            
            # Clean and normalize input
            vendor_clean = vendor.strip().lower()
            
            if not vendor_clean:
                return {
                    'error': 'Vendor name is required',
                    'results': [],
                    'total_results': 0
                }
            
            # First, get the total count from NVD for this vendor
            print(f"DEBUG: Getting total count for vendor '{vendor_clean}'")
            count_params = {
                'keywordSearch': vendor_clean,
                'resultsPerPage': 1,  # Just get count, not actual results
                'startIndex': 0
            }
            
            count_response = self._make_api_request(self.nvd_base_url, count_params)
            if not count_response:
                return {
                    'error': 'Failed to connect to NVD API',
                    'results': [],
                    'total_results': 0
                }
            
            count_data = count_response.json()
            total_available = count_data.get('totalResults', 0)
            print(f"DEBUG: NVD reports {total_available} total results for '{vendor_clean}'")
            
            # Check if start_index is beyond available data
            if start_index >= total_available:
                print(f"DEBUG: start_index {start_index} is beyond total available {total_available}")
                return {
                    'results': [],
                    'total_results': total_available,
                    'search_params': {
                        'vendor': vendor,
                        'method': 'vendor_only_keyword_search',
                        'nvd_total': total_available
                    }
                }
            
            # Now get the actual results we need
            # Use a larger limit to get more results for filtering, but respect the total available
            search_limit = min(200, total_available - start_index)
            if search_limit <= 0:
                search_limit = 1  # At least get 1 result to check
            
            print(f"DEBUG: Using keyword search for vendor '{vendor_clean}' with limit {search_limit} starting from {start_index}")
            keyword_result = self.search_cves_by_keyword(vendor_clean, search_limit, start_index)
            
            if keyword_result.get('results'):
                # Filter results to ensure they're actually related to the vendor
                filtered_results = []
                for cve in keyword_result['results']:
                    vendors_products = cve.get('vendors_products', [])
                    for vp in vendors_products:
                        vendor_name = vp.get('vendor', '').lower()
                        if vendor_clean in vendor_name or vendor_name in vendor_clean:
                            filtered_results.append(cve)
                            break
                
                # Calculate the actual total based on the ratio of filtered results
                if len(keyword_result['results']) > 0:
                    filter_ratio = len(filtered_results) / len(keyword_result['results'])
                    estimated_total = int(total_available * filter_ratio)
                else:
                    estimated_total = 0
                
                # Apply pagination to filtered results
                paginated_cves = filtered_results[:limit]  # Take only the requested limit
                
                print(f"DEBUG: Vendor-only search completed. Found {len(filtered_results)} filtered CVEs out of {len(keyword_result['results'])} searched, estimated total: {estimated_total}")
                
                return {
                    'results': paginated_cves,
                    'total_results': estimated_total,
                    'search_params': {
                        'vendor': vendor,
                        'method': 'vendor_only_keyword_search',
                        'nvd_total': total_available
                    }
                }
            
            return {
                'results': [],
                'total_results': 0,
                'search_params': {
                    'vendor': vendor,
                    'method': 'vendor_only_keyword_search',
                    'nvd_total': total_available
                }
            }
            
        except Exception as e:
            print(f"DEBUG: Error in vendor-only search: {str(e)}")
            return {
                'error': f'Search failed: {str(e)}',
                'results': [],
                'total_results': 0
            }
    
    def search_cves_by_vendor_product(self, vendor: str, product: str, 
                                    limit: int = 20, start_index: int = 0) -> Dict:
        """
        Search for CVEs by vendor and product using dynamic keyword search.
        This method provides comprehensive coverage by searching for vendor + product combinations.
        """
        try:
            print(f"DEBUG: Starting vendor/product search for '{vendor}' / '{product}'")
            
            # Clean and normalize input
            vendor_clean = vendor.strip().lower()
            product_clean = product.strip().lower()
            
            if not vendor_clean:
                return {
                    'error': 'Vendor name is required',
                    'results': [],
                    'total_results': 0
                }
            
            # Use keyword search for vendor + product combination
            search_query = f"{vendor_clean} {product_clean}"
            
            # First, get the total count from NVD for this search
            print(f"DEBUG: Getting total count for '{search_query}'")
            count_params = {
                'keywordSearch': search_query,
                'resultsPerPage': 1,  # Just get count, not actual results
                'startIndex': 0
            }
            
            count_response = self._make_api_request(self.nvd_base_url, count_params)
            if not count_response:
                return {
                    'error': 'Failed to connect to NVD API',
                    'results': [],
                    'total_results': 0
                }
            
            count_data = count_response.json()
            total_available = count_data.get('totalResults', 0)
            print(f"DEBUG: NVD reports {total_available} total results for '{search_query}'")
            
            # Check if start_index is beyond available data
            if start_index >= total_available:
                print(f"DEBUG: start_index {start_index} is beyond total available {total_available}")
                return {
                    'results': [],
                    'total_results': total_available,
                    'search_params': {
                        'vendor': vendor,
                        'product': product,
                        'method': 'vendor_product_keyword_search',
                        'nvd_total': total_available
                    }
                }
            
            # Now get the actual results we need
            search_limit = min(200, total_available - start_index)
            if search_limit <= 0:
                search_limit = 1  # At least get 1 result to check
            
            print(f"DEBUG: Using keyword search for '{search_query}' with limit {search_limit} starting from {start_index}")
            keyword_result = self.search_cves_by_keyword(search_query, search_limit, start_index)
            
            if keyword_result.get('results'):
                # Filter results to ensure they're actually related to the vendor + product
                filtered_results = []
                for cve in keyword_result['results']:
                    vendors_products = cve.get('vendors_products', [])
                    for vp in vendors_products:
                        vendor_name = vp.get('vendor', '').lower()
                        product_name = vp.get('product', '').lower()
                        
                        # Check if vendor matches and product matches
                        vendor_match = vendor_clean in vendor_name or vendor_name in vendor_clean
                        product_match = product_clean in product_name or product_name in product_clean
                        
                        if vendor_match and product_match:
                            filtered_results.append(cve)
                            break
                
                # Calculate the actual total based on the ratio of filtered results
                if len(keyword_result['results']) > 0:
                    filter_ratio = len(filtered_results) / len(keyword_result['results'])
                    estimated_total = int(total_available * filter_ratio)
                else:
                    estimated_total = 0
                
                # Apply pagination to filtered results
                paginated_cves = filtered_results[:limit]  # Take only the requested limit
                
                print(f"DEBUG: Vendor/product search completed. Found {len(filtered_results)} filtered CVEs out of {len(keyword_result['results'])} searched, estimated total: {estimated_total}")
                
                return {
                    'results': paginated_cves,
                    'total_results': estimated_total,
                    'search_params': {
                        'vendor': vendor,
                        'product': product,
                        'method': 'vendor_product_keyword_search',
                        'nvd_total': total_available
                    }
                }
            
            return {
                'results': [],
                'total_results': 0,
                'search_params': {
                    'vendor': vendor,
                    'product': product,
                    'method': 'vendor_product_keyword_search',
                    'nvd_total': total_available
                }
            }
            
        except Exception as e:
            print(f"DEBUG: Error in vendor/product search: {str(e)}")
            return {
                'error': f'Search failed: {str(e)}',
                'results': [],
                'total_results': 0
            }
    
    def _get_vendor_variations(self, vendor: str) -> List[str]:
        """Get common vendor name variations dynamically"""
        variations = [vendor]
        
        # Handle common vendor name patterns
        if ' ' in vendor:
            variations.extend([
                vendor.replace(' ', ''),
                vendor.replace(' ', '_'),
                vendor.replace(' ', '-'),
                vendor.split()[0]  # First word only
            ])
        
        # Handle common suffixes
        if vendor.endswith('_inc') or vendor.endswith('_corp'):
            variations.append(vendor[:-4])
        elif vendor.endswith('_corporation'):
            variations.append(vendor[:-12])
        elif vendor.endswith('_foundation'):
            variations.append(vendor[:-11])
        elif vendor.endswith('_software'):
            variations.append(vendor[:-9])
        
        return list(set(variations))
    
    def _get_product_variations(self, product: str) -> List[str]:
        """Get common product name variations"""
        variations = [product]
        
        # Handle common product name patterns
        if ' ' in product:
            variations.extend([
                product.replace(' ', ''),
                product.replace(' ', '_'),
                product.replace(' ', '-'),
                product.split()[0]  # First word only
            ])
        
        # Handle version numbers
        if re.search(r'\d+', product):
            variations.append(re.sub(r'\d+.*', '', product))
        
        return list(set(variations))
    
    def _clean_for_cpe(self, name: str) -> str:
        """Clean name for CPE format"""
        # Remove special characters and normalize
        cleaned = re.sub(r'[^a-zA-Z0-9_-]', '_', name.lower())
        cleaned = re.sub(r'_+', '_', cleaned)  # Replace multiple underscores with single
        cleaned = cleaned.strip('_')  # Remove leading/trailing underscores
        return cleaned or 'unknown'
    
    def search_cves_unified(self, query: str, limit: int = 20, start_index: int = 0) -> Dict:
        """
        Unified search for CVEs by vendor, product, CVE ID, or keyword.
        This method implements proper search logic that prioritizes CPE-based searches.
        """
        try:
            print(f"DEBUG: Starting unified search for query: '{query}'")
            
            # Clean and normalize input
            query_clean = query.strip()
            
            if not query_clean:
                return {
                    'error': 'Search query is required',
                    'results': [],
                    'total_results': 0
                }
            
            # Strategy 1: Check if query is a CVE ID
            cve_pattern = re.compile(r'^CVE-\d{4}-\d{4,}$', re.IGNORECASE)
            if cve_pattern.match(query_clean):
                print(f"DEBUG: Query matches CVE ID pattern: {query_clean}")
                cve_details = self.get_cve_details(query_clean)
                if 'error' not in cve_details:
                    return {
                        'results': [cve_details],
                        'total_results': 1,
                        'search_type': 'cve_id',
                        'search_params': {'query': query_clean}
                    }
                else:
                    return {
                        'results': [],
                        'total_results': 0,
                        'search_type': 'cve_id_not_found',
                        'search_params': {'query': query_clean},
                        'message': f'CVE {query_clean} not found'
                    }
            
            # Strategy 2: Check if it's likely a vendor-only search
            if self._is_likely_vendor_only(query_clean):
                print(f"DEBUG: Query appears to be vendor-only: '{query_clean}'")
                result = self.search_cves_by_vendor_only(query_clean, limit, start_index)
                result['search_type'] = 'vendor_only'
                return result
            
            # Strategy 3: Try vendor/product search (for queries with spaces, slashes, or hyphens)
            if ' ' in query_clean or '/' in query_clean or '-' in query_clean:
                vendor, product = self._parse_vendor_product(query_clean)
                if vendor and product:
                    print(f"DEBUG: Attempting vendor/product search: vendor='{vendor}', product='{product}'")
                    result = self.search_cves_by_vendor_product(vendor, product, limit, start_index)
                    result['search_type'] = 'vendor_product'
                    return result
            
            # Strategy 4: Fallback to keyword search
            print(f"DEBUG: Falling back to keyword search: '{query_clean}'")
            result = self.search_cves_by_keyword(query_clean, limit, start_index)
            result['search_type'] = 'keyword'
            return result
            
        except Exception as e:
            print(f"DEBUG: Error in unified search: {str(e)}")
            return {
                'error': f'Search failed: {str(e)}',
                'results': [],
                'total_results': 0
            }
    
    def _is_likely_vendor_only(self, query: str) -> bool:
        """Determine if a query is likely a vendor-only search"""
        query_lower = query.lower()
        
        # Check if it's a single word (likely vendor)
        if ' ' not in query and '/' not in query and '-' not in query:
            return True
        
        # Check for common vendor patterns
        vendor_patterns = [
            r'^[a-zA-Z]+$',  # Single word
            r'^[a-zA-Z]+_[a-zA-Z]+$',  # Two words with underscore
            r'^[a-zA-Z]+-[a-zA-Z]+$',  # Two words with hyphen
        ]
        
        for pattern in vendor_patterns:
            if re.match(pattern, query):
                return True
        
        return False
    
    def _parse_vendor_product(self, query: str) -> tuple:
        """Parse query into vendor and product parts"""
        # Split by common separators
        parts = re.split(r'[\s/-]+', query)
        
        if len(parts) >= 2:
            vendor = parts[0]
            product = ' '.join(parts[1:])  # Join remaining parts as product
            return vendor, product
        
        return None, None
    
    def search_cves_by_keyword(self, keyword: str, 
                             limit: int = 20, start_index: int = 0) -> Dict:
        """Search for CVEs by keyword using NVD API"""
        try:
            print(f"DEBUG: Starting keyword search for '{keyword}'")
            
            params = {
                'keywordSearch': keyword,
                'resultsPerPage': limit,
                'startIndex': start_index
            }
            
            response = self._make_api_request(self.nvd_base_url, params)
            if not response:
                return {
                    'error': 'Failed to connect to NVD API',
                    'results': [],
                    'total_results': 0
                }
            
            data = response.json()
            
            if 'vulnerabilities' not in data:
                return {
                    'results': [],
                    'total_results': 0
                }
            
            # Process results
            all_cves = []
            for vuln in data['vulnerabilities']:
                cve_data = vuln['cve']
                formatted_cve = self._format_cve_summary(cve_data)
                all_cves.append(formatted_cve)
            
            total_results = data.get('totalResults', len(all_cves))
            
            return {
                'results': all_cves,
                'total_results': total_results,
                'search_params': {
                    'keyword': keyword,
                    'method': 'keyword_search'
                }
            }
            
        except Exception as e:
            print(f"DEBUG: Error in keyword search: {str(e)}")
            return {
                'error': f'Search failed: {str(e)}',
                'results': [],
                'total_results': 0
            }
    
    def get_recent_cves(self, days: int = 30, limit: int = 20, start_index: int = 0) -> Dict:
        """Get recent CVEs from the last N days with pagination support"""
        try:
            print(f"DEBUG: Getting recent CVEs for last {days} days")
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Format dates for NVD API (ISO 8601 format)
            params = {
                'pubStartDate': start_date.strftime('%Y-%m-%dT%H:%M:%S.000-00:00'),
                'pubEndDate': end_date.strftime('%Y-%m-%dT%H:%M:%S.000-00:00'),
                'resultsPerPage': limit,
                'startIndex': start_index
            }
            
            print(f"DEBUG: Date range: {params['pubStartDate']} to {params['pubEndDate']}")
            
            response = self._make_api_request(self.nvd_base_url, params)
            if not response:
                return {
                    'error': 'Failed to connect to NVD API',
                    'results': [],
                    'total_results': 0
                }
            
            data = response.json()
            
            if 'vulnerabilities' not in data:
                return {
                    'results': [],
                    'total_results': 0
                }
            
            # Process results
            all_cves = []
            for vuln in data['vulnerabilities']:
                cve_data = vuln['cve']
                formatted_cve = self._format_cve_summary(cve_data)
                all_cves.append(formatted_cve)
            
            total_results = data.get('totalResults', len(all_cves))
            
            return {
                'results': all_cves,
                'total_results': total_results,
                'search_params': {
                    'days': days,
                    'limit': limit,
                    'start_index': start_index,
                    'method': 'recent_cves'
                }
            }
            
        except Exception as e:
            print(f"DEBUG: Error in get_recent_cves: {str(e)}")
            return {
                'error': f'Failed to get recent CVEs: {str(e)}',
                'results': [],
                'total_results': 0
            }
    
    def get_cve_details(self, cve_id: str) -> Dict:
        """Get detailed information for a specific CVE"""
        try:
            print(f"DEBUG: Getting details for CVE: {cve_id}")
            
            params = {
                'cveId': cve_id
            }
            
            response = self._make_api_request(self.nvd_base_url, params)
            if not response:
                return {
                    'error': 'Failed to connect to NVD API'
                }
            
            data = response.json()
            
            if 'vulnerabilities' not in data or not data['vulnerabilities']:
                return {
                    'error': f'CVE {cve_id} not found'
                }
            
            cve_data = data['vulnerabilities'][0]['cve']
            return self._format_cve_details(cve_data)
            
        except Exception as e:
            print(f"DEBUG: Error getting CVE details: {str(e)}")
            return {
                'error': f'Failed to get CVE details: {str(e)}'
            }
    
    def _make_api_request(self, url: str, params: Dict, retries: Optional[int] = None) -> Optional[requests.Response]:
        """Make API request with retry logic and rate limiting"""
        if retries is None:
            retries = self.max_retries
        
        for attempt in range(retries + 1):
            try:
                response = self.session.get(url, params=params, timeout=self.request_timeout)
                
                if response.status_code == 200:
                    return response
                elif response.status_code == 429:  # Rate limited
                    if attempt < retries:
                        wait_time = self.retry_delay * (2 ** attempt)
                        print(f"DEBUG: Rate limited, waiting {wait_time}s before retry")
                        time.sleep(wait_time)
                        continue
                else:
                    print(f"DEBUG: API request failed with status {response.status_code}")
                    return None
                    
            except requests.exceptions.RequestException as e:
                print(f"DEBUG: Request exception on attempt {attempt + 1}: {e}")
                if attempt < retries:
                    time.sleep(self.retry_delay)
                    continue
                else:
                    return None
        
        return None
    
    def _format_cve_summary(self, cve_data: Dict) -> Dict:
        """Format CVE data for summary view"""
        try:
            # Extract basic information
            cve_id = cve_data.get('id', '')
            
            # Get description
            description = ''
            descriptions = cve_data.get('descriptions', [])
            for desc in descriptions:
                if desc.get('lang') == 'en':
                    description = desc.get('value', '')
                    break
            
            # Get CVSS metrics
            metrics = cve_data.get('metrics', {})
            cvss_v3 = metrics.get('cvssMetricV31', [{}])[0] if 'cvssMetricV31' in metrics else metrics.get('cvssMetricV30', [{}])[0] if 'cvssMetricV30' in metrics else {}
            cvss_data = cvss_v3.get('cvssData', {})
            
            # Extract vendor/product information
            vendors_products = self._extract_vendors_products(cve_data.get('configurations', []))
            
            return {
                'id': cve_id,
                'description': description,
                'published_date': cve_data.get('published', ''),
                'last_modified_date': cve_data.get('lastModified', ''),
                'severity': cvss_data.get('baseSeverity', 'UNKNOWN'),
                'cvss_score': cvss_data.get('baseScore', 0),
                'cvss_vector': cvss_data.get('vectorString', ''),
                'vendors_products': vendors_products,
                'references': cve_data.get('references', []),
                'configurations': cve_data.get('configurations', [])
            }
            
        except Exception as e:
            print(f"DEBUG: Error formatting CVE summary: {e}")
            return {
                'id': cve_data.get('id', ''),
                'description': 'Error formatting CVE data',
                'published_date': '',
                'last_modified_date': '',
                'severity': 'UNKNOWN',
                'cvss_score': 0,
                'cvss_vector': '',
                'vendors_products': [],
                'references': [],
                'configurations': []
            }
    
    def _format_cve_details(self, cve_data: Dict) -> Dict:
        """Format CVE data for detailed view"""
        summary = self._format_cve_summary(cve_data)
        
        # Add additional details
        summary.update({
            'weaknesses': cve_data.get('weaknesses', []),
            'evaluatorComment': cve_data.get('evaluatorComment', ''),
            'evaluatorSolution': cve_data.get('evaluatorSolution', ''),
            'evaluatorImpact': cve_data.get('evaluatorImpact', ''),
            'cisaExploitAdd': cve_data.get('cisaExploitAdd', ''),
            'cisaActionDue': cve_data.get('cisaActionDue', ''),
            'cisaRequiredAction': cve_data.get('cisaRequiredAction', ''),
            'cisaVulnerabilityName': cve_data.get('cisaVulnerabilityName', '')
        })
        
        return summary
    
    def _extract_vendors_products(self, configurations: List) -> List[Dict]:
        """Extract vendor and product information from CVE configurations"""
        vendors_products = []
        
        try:
            for config in configurations:
                nodes = config.get('nodes', [])
                for node in nodes:
                    cpe_match = node.get('cpeMatch', [])
                    for match in cpe_match:
                        criteria = match.get('criteria', '')
                        if criteria:
                            cpe_info = self._parse_cpe_string(criteria)
                            if cpe_info:
                                vendors_products.append(cpe_info)
        except Exception as e:
            print(f"DEBUG: Error extracting vendors/products: {e}")
        
        return vendors_products
    
    def _parse_cpe_string(self, cpe_string: str) -> Optional[Dict]:
        """Parse CPE string to extract components"""
        try:
            # cpe:2.3:a:apache:httpd:2.4.41:*:*:*:*:*:*:*:*:*
            parts = cpe_string.split(':')
            if len(parts) >= 5:
                return {
                    'vendor': parts[3],
                    'product': parts[4],
                    'version': parts[5] if len(parts) > 5 and parts[5] != '*' else None,
                    'full_cpe': cpe_string
                }
        except Exception as e:
            print(f"DEBUG: Error parsing CPE string '{cpe_string}': {e}")
        
        return None 