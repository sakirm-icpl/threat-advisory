import requests
import json
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
        self.api_key = "523ff249-3119-49fa-a1d6-31ba53131052"  # Optional: NVD API key for higher rate limits
        
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
    
    def search_cves_by_vendor_product(self, vendor: str, product: str, 
                                    limit: int = 20, start_index: int = 0) -> Dict:
        """
        Optimized search for CVEs by vendor and product name using multiple strategies.
        This method provides comprehensive coverage with better performance and stability.
        """
        try:
            print(f"DEBUG: Starting optimized vendor/product search for '{vendor}' / '{product}'")
            
            # Clean and normalize input
            vendor_clean = vendor.strip().lower()
            product_clean = product.strip().lower()
            
            if not vendor_clean or not product_clean:
                return {
                    'error': 'Both vendor and product names are required',
                    'results': [],
                    'total_results': 0
                }
            
            # Strategy 1: Direct CPE search with optimized patterns
            cpe_results = self._search_with_cpe_patterns(vendor_clean, product_clean, limit)
            
            # Strategy 2: Keyword search as backup
            keyword_results = self._search_with_keywords(vendor_clean, product_clean, limit)
            
            # Strategy 3: Broader vendor search if specific product not found
            vendor_results = self._search_vendor_only(vendor_clean, product_clean, limit)
            
            # Combine and deduplicate results
            all_cves = self._combine_and_deduplicate_results(
                cpe_results, keyword_results, vendor_results
            )
            
            # Sort by published date (newest first)
            all_cves.sort(key=lambda x: x.get('published_date', ''), reverse=True)
            
            # Apply pagination
            total_count = len(all_cves)
            paginated_cves = all_cves[start_index:start_index + limit]
            
            print(f"DEBUG: Search completed. Found {total_count} total CVEs, returning {len(paginated_cves)}")
            
            return {
                'results': paginated_cves,
                'total_results': total_count,
                'search_params': {
                    'vendor': vendor,
                    'product': product,
                    'cpe_results': len(cpe_results),
                    'keyword_results': len(keyword_results),
                    'vendor_results': len(vendor_results),
                    'method': 'optimized_multi_strategy'
                }
            }
            
        except Exception as e:
            print(f"DEBUG: Error in optimized search: {str(e)}")
            return {
                'error': f'Search failed: {str(e)}',
                'results': [],
                'total_results': 0
            }
    
    def _search_with_cpe_patterns(self, vendor: str, product: str, limit: int) -> List[Dict]:
        """Search using optimized CPE patterns"""
        try:
            # Generate optimized CPE patterns
            patterns = self._generate_optimized_cpe_patterns(vendor, product)
            
            all_cves = []
            cve_ids_seen = set()
            
            for pattern in patterns[:5]:  # Limit to top 5 patterns for performance
                try:
                    params = {
                        'cpeName': pattern,
                        'resultsPerPage': min(limit * 2, 100)
                    }
                    
                    response = self._make_api_request(self.nvd_base_url, params)
                    if not response:
                        continue
                    
                    data = response.json()
                    if 'vulnerabilities' in data:
                        for vuln in data['vulnerabilities']:
                            cve_data = vuln['cve']
                            cve_id = cve_data.get('id', '')
                            
                            if cve_id not in cve_ids_seen:
                                cve_ids_seen.add(cve_id)
                                formatted_cve = self._format_cve_summary(cve_data)
                                all_cves.append(formatted_cve)
                    
                    # Add small delay to respect rate limits
                    time.sleep(0.1)
                    
                except Exception as e:
                    print(f"DEBUG: Error with CPE pattern '{pattern}': {e}")
                    continue
            
            return all_cves
            
        except Exception as e:
            print(f"DEBUG: Error in CPE pattern search: {e}")
            return []
    
    def _search_with_keywords(self, vendor: str, product: str, limit: int) -> List[Dict]:
        """Search using keyword combinations"""
        try:
            # Try different keyword combinations
            keywords = [
                f"{vendor} {product}",
                f'"{vendor}" "{product}"',
                f"{vendor}_{product}",
                f"{vendor}-{product}"
            ]
            
            all_cves = []
            cve_ids_seen = set()
            
            for keyword in keywords:
                try:
                    params = {
                        'keywordSearch': keyword,
                        'resultsPerPage': min(limit * 2, 100)
                    }
                    
                    response = self._make_api_request(self.nvd_base_url, params)
                    if not response:
                        continue
                    
                    data = response.json()
                    if 'vulnerabilities' in data:
                        for vuln in data['vulnerabilities']:
                            cve_data = vuln['cve']
                            cve_id = cve_data.get('id', '')
                            
                            if cve_id not in cve_ids_seen:
                                cve_ids_seen.add(cve_id)
                                formatted_cve = self._format_cve_summary(cve_data)
                                all_cves.append(formatted_cve)
                    
                    time.sleep(0.1)
                    
                except Exception as e:
                    print(f"DEBUG: Error with keyword '{keyword}': {e}")
                    continue
            
            return all_cves
            
        except Exception as e:
            print(f"DEBUG: Error in keyword search: {e}")
            return []
    
    def _search_vendor_only(self, vendor: str, product: str, limit: int) -> List[Dict]:
        """Search for vendor-only CVEs when product-specific search fails"""
        try:
            # Only use this if we have very few results from other methods
            params = {
                'keywordSearch': vendor,
                'resultsPerPage': min(limit, 50)
            }
            
            response = self._make_api_request(self.nvd_base_url, params)
            if not response:
                return []
            
            data = response.json()
            all_cves = []
            
            if 'vulnerabilities' in data:
                for vuln in data['vulnerabilities']:
                    cve_data = vuln['cve']
                    # Filter for CVEs that might be related to the product
                    if self._is_related_to_product(cve_data, product):
                        formatted_cve = self._format_cve_summary(cve_data)
                        all_cves.append(formatted_cve)
            
            return all_cves
            
        except Exception as e:
            print(f"DEBUG: Error in vendor-only search: {e}")
            return []
    
    def _generate_optimized_cpe_patterns(self, vendor: str, product: str) -> List[str]:
        """Generate optimized CPE patterns for better coverage"""
        patterns = []
        
        # Clean vendor and product names
        vendor_clean = self._clean_for_cpe(vendor)
        product_clean = self._clean_for_cpe(product)
        
        # Standard patterns
        patterns.extend([
            f"cpe:2.3:a:{vendor_clean}:{product_clean}:*:*:*:*:*:*:*:*:*",
            f"cpe:2.3:a:{vendor_clean}:*:{product_clean}:*:*:*:*:*:*:*:*",
            f"cpe:2.3:a:{vendor_clean}:*:*:{product_clean}:*:*:*:*:*:*:*"
        ])
        
        # Handle common variations
        vendor_variations = self._get_vendor_variations(vendor)
        product_variations = self._get_product_variations(product)
        
        for v in vendor_variations[:3]:  # Limit variations for performance
            for p in product_variations[:3]:
                v_clean = self._clean_for_cpe(v)
                p_clean = self._clean_for_cpe(p)
                patterns.append(f"cpe:2.3:a:{v_clean}:{p_clean}:*:*:*:*:*:*:*:*:*")
        
        return list(set(patterns))  # Remove duplicates
    
    def _get_vendor_variations(self, vendor: str) -> List[str]:
        """Get common vendor name variations"""
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
    
    def _is_related_to_product(self, cve_data: Dict, product: str) -> bool:
        """Check if CVE is related to the product"""
        try:
            # Check description
            descriptions = cve_data.get('descriptions', [])
            for desc in descriptions:
                if desc.get('lang') == 'en':
                    description = desc.get('value', '').lower()
                    if product.lower() in description:
                        return True
            
            # Check configurations
            configurations = cve_data.get('configurations', [])
            for config in configurations:
                nodes = config.get('nodes', [])
                for node in nodes:
                    cpe_match = node.get('cpeMatch', [])
                    for match in cpe_match:
                        criteria = match.get('criteria', '').lower()
                        if product.lower() in criteria:
                            return True
            
            return False
            
        except Exception:
            return False
    
    def _combine_and_deduplicate_results(self, *result_lists) -> List[Dict]:
        """Combine and deduplicate CVE results"""
        all_cves = []
        cve_ids_seen = set()
        
        for result_list in result_lists:
            for cve in result_list:
                cve_id = cve.get('cve_id', '')
                if cve_id and cve_id not in cve_ids_seen:
                    cve_ids_seen.add(cve_id)
                    all_cves.append(cve)
        
        return all_cves
    
    def _make_api_request(self, url: str, params: Dict, retries: Optional[int] = None) -> Optional[requests.Response]:
        """Make API request with retry logic and error handling"""
        if retries is None:
            retries = self.max_retries
        
        for attempt in range(retries + 1):
            try:
                response = self.session.get(
                    url, 
                    params=params, 
                    timeout=self.request_timeout
                )
                response.raise_for_status()
                return response
                
            except requests.exceptions.Timeout:
                print(f"DEBUG: Request timeout (attempt {attempt + 1}/{retries + 1})")
                if attempt < retries:
                    time.sleep(self.retry_delay * (attempt + 1))
                continue
                
            except requests.exceptions.RequestException as e:
                print(f"DEBUG: Request error (attempt {attempt + 1}/{retries + 1}): {e}")
                if attempt < retries:
                    time.sleep(self.retry_delay * (attempt + 1))
                continue
        
        return None

    def search_cves_by_keyword(self, keyword: str, 
                             limit: int = 20, start_index: int = 0) -> Dict:
        """
        Search for CVEs by keyword with improved error handling
        """
        try:
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
            return self._process_cve_results(data, keyword=keyword)
            
        except Exception as e:
            return {
                'error': f'Search failed: {str(e)}',
                'results': [],
                'total_results': 0
            }
    
    def get_recent_cves(self, days: int = 30, limit: int = 20) -> Dict:
        """
        Get recent CVEs from the last N days with improved date formatting
        """
        try:
            from datetime import datetime, timedelta
            
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Format dates for NVD API (ISO 8601 format with Z suffix for UTC)
            start_str = start_date.strftime('%Y-%m-%dT%H:%M:%S.000Z')
            end_str = end_date.strftime('%Y-%m-%dT%H:%M:%S.000Z')
            
            params = {
                'pubStartDate': start_str,
                'pubEndDate': end_str,
                'resultsPerPage': limit
            }
            
            print(f"DEBUG: Getting recent CVEs from {start_str} to {end_str}")
            
            response = self._make_api_request(self.nvd_base_url, params)
            if not response:
                return {
                    'error': 'Failed to connect to NVD API',
                    'results': [],
                    'total_results': 0
                }
            
            data = response.json()
            
            print(f"DEBUG: NVD API response status: {response.status_code}")
            print(f"DEBUG: NVD API response data keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            return self._process_cve_results(data, recent=True)
            
        except Exception as e:
            return {
                'error': f'Failed to fetch recent CVEs: {str(e)}',
                'results': [],
                'total_results': 0
            }
    
    def get_cve_details(self, cve_id: str) -> Dict:
        """
        Get detailed information about a specific CVE
        """
        try:
            params = {
                'cveId': cve_id
            }
            
            response = self._make_api_request(self.nvd_base_url, params)
            if not response:
                return {
                    'error': 'Failed to connect to NVD API',
                    'cve_id': cve_id
                }
            
            data = response.json()
            
            if data.get('vulnerabilities'):
                cve_data = data['vulnerabilities'][0]['cve']
                return self._format_cve_details(cve_data)
            else:
                return {
                    'error': f'CVE {cve_id} not found',
                    'cve_id': cve_id
                }
                
        except Exception as e:
            return {
                'error': f'Failed to fetch CVE details: {str(e)}',
                'cve_id': cve_id
            }
    
    def _process_cve_results(self, data: Dict, vendor: Optional[str] = None, 
                           product: Optional[str] = None, keyword: Optional[str] = None, 
                           recent: bool = False) -> Dict:
        """Process and format CVE search results"""
        results = []
        total_results = data.get('totalResults', 0)
        
        if 'vulnerabilities' in data:
            for vuln in data['vulnerabilities']:
                cve_data = vuln['cve']
                formatted_cve = self._format_cve_summary(cve_data)
                results.append(formatted_cve)
        
        return {
            'results': results,
            'total_results': total_results,
            'search_params': {
                'vendor': vendor,
                'product': product,
                'keyword': keyword,
                'recent': recent
            }
        }
    
    def _format_cve_summary(self, cve_data: Dict) -> Dict:
        """Format CVE data for summary view"""
        cve_id = cve_data.get('id', '')
        descriptions = cve_data.get('descriptions', [])
        english_description = next(
            (desc['value'] for desc in descriptions if desc['lang'] == 'en'),
            'No description available'
        )
        
        # Extract CVSS metrics
        metrics = cve_data.get('metrics', {})
        cvss_v3 = metrics.get('cvssMetricV31', [{}])[0] if metrics.get('cvssMetricV31') else {}
        cvss_data = cvss_v3.get('cvssData', {}) if cvss_v3 else {}
        
        # Extract vendor/product info
        configurations = cve_data.get('configurations', [])
        vendors_products = self._extract_vendors_products(configurations)
        
        return {
            'cve_id': cve_id,
            'description': english_description[:200] + '...' if len(english_description) > 200 else english_description,
            'full_description': english_description,
            'published_date': cve_data.get('published', ''),
            'last_modified': cve_data.get('lastModified', ''),
            'severity': cvss_data.get('baseSeverity', 'Unknown'),
            'cvss_score': cvss_data.get('baseScore', 0),
            'vendors_products': vendors_products,
            'url': f"https://nvd.nist.gov/vuln/detail/{cve_id}"
        }
    
    def _format_cve_details(self, cve_data: Dict) -> Dict:
        """Format detailed CVE information"""
        summary = self._format_cve_summary(cve_data)
        
        # Add additional details
        references = cve_data.get('references', [])
        weaknesses = cve_data.get('weaknesses', [])
        
        return {
            **summary,
            'references': [
                {
                    'url': ref.get('url', ''),
                    'name': ref.get('name', ''),
                    'tags': ref.get('tags', [])
                }
                for ref in references
            ],
            'weaknesses': [
                {
                    'source': weakness.get('source', ''),
                    'type': weakness.get('type', ''),
                    'description': weakness.get('description', [{}])[0].get('value', '') if weakness.get('description') else ''
                }
                for weakness in weaknesses
            ]
        }
    
    def _extract_vendors_products(self, configurations: List) -> List[Dict]:
        """Extract vendor and product information from CVE configurations"""
        vendors_products = []
        
        for config in configurations:
            nodes = config.get('nodes', [])
            for node in nodes:
                cpe_match = node.get('cpeMatch', [])
                for match in cpe_match:
                    cpe_uri = match.get('criteria', '')
                    if cpe_uri:
                        # Parse CPE URI: cpe:2.3:a:vendor:product:version:...
                        parts = cpe_uri.split(':')
                        if len(parts) >= 5:
                            vendor = parts[3]
                            product = parts[4]
                            if vendor and product:
                                vendors_products.append({
                                    'vendor': vendor,
                                    'product': product,
                                    'cpe_uri': cpe_uri
                                })
        
        return vendors_products 

    def search_cves_unified(self, query: str, limit: int = 20, start_index: int = 0) -> Dict:
        """
        Unified search for CVEs by vendor, product, or keyword.
        This method intelligently determines the best search strategy based on the query.
        """
        try:
            print(f"DEBUG: Starting unified search for query: '{query}'")
            
            # Clean and normalize input
            query_clean = query.strip().lower()
            
            if not query_clean:
                return {
                    'error': 'Search query is required',
                    'results': [],
                    'total_results': 0
                }
            
            # Strategy 1: Try vendor/product search first (if query contains space or common separators)
            if ' ' in query_clean or '/' in query_clean or '-' in query_clean:
                # Split query into potential vendor/product parts
                parts = re.split(r'[\s/-]+', query_clean)
                if len(parts) >= 2:
                    vendor = parts[0]
                    product = ' '.join(parts[1:])  # Join remaining parts as product
                    
                    print(f"DEBUG: Attempting vendor/product search: vendor='{vendor}', product='{product}'")
                    vendor_product_results = self.search_cves_by_vendor_product(
                        vendor=vendor,
                        product=product,
                        limit=limit,
                        start_index=start_index
                    )
                    
                    if vendor_product_results.get('results') and len(vendor_product_results['results']) > 0:
                        vendor_product_results['search_type'] = 'vendor_product'
                        vendor_product_results['search_params']['query'] = query
                        return vendor_product_results
            
            # Strategy 2: Try keyword search
            print(f"DEBUG: Attempting keyword search for: '{query_clean}'")
            keyword_results = self.search_cves_by_keyword(
                keyword=query_clean,
                limit=limit,
                start_index=start_index
            )
            
            if keyword_results.get('results') and len(keyword_results['results']) > 0:
                keyword_results['search_type'] = 'keyword'
                keyword_results['search_params']['query'] = query
                return keyword_results
            
            # Strategy 3: Try vendor-only search as fallback
            print(f"DEBUG: Attempting vendor-only search for: '{query_clean}'")
            vendor_results = self._search_vendor_only(query_clean, '', limit)
            
            if vendor_results:
                # Format vendor-only results
                total_count = len(vendor_results)
                paginated_results = vendor_results[start_index:start_index + limit]
                
                return {
                    'results': paginated_results,
                    'total_results': total_count,
                    'search_type': 'vendor_only',
                    'search_params': {
                        'query': query,
                        'vendor': query_clean,
                        'method': 'vendor_only_fallback'
                    }
                }
            
            # No results found
            return {
                'results': [],
                'total_results': 0,
                'search_type': 'no_results',
                'search_params': {'query': query},
                'message': f'No CVEs found for query: "{query}"'
            }
            
        except Exception as e:
            print(f"DEBUG: Error in unified search: {str(e)}")
            return {
                'error': f'Search failed: {str(e)}',
                'results': [],
                'total_results': 0,
                'search_type': 'error'
            } 