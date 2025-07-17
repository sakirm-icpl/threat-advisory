from flask import Blueprint, request, jsonify
from app.services.cve_service import CVEService
from app.services.auth import require_permission
import re

bp = Blueprint('cve', __name__, url_prefix='/api/cve')
cve_service = CVEService()

@bp.route('/search/unified', methods=['GET'])
@require_permission('read')
def search_cves_unified():
    """Unified search for CVEs by vendor, product, or CVE ID"""
    try:
        query = request.args.get('query', '').strip()
        limit = request.args.get('limit', 20, type=int)
        start_index = request.args.get('start_index', 0, type=int)
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Handle "All" option (-1) and larger limits
        if limit == -1:
            limit = 5000  # Set a reasonable maximum for "All"
        elif limit < 1 or limit > 5000:
            return jsonify({'error': 'Limit must be between 1 and 5000'}), 400
        
        # Detect search type based on query pattern
        cve_pattern = re.compile(r'^CVE-\d{4}-\d{4,}$', re.IGNORECASE)
        
        if cve_pattern.match(query):
            # CVE ID search
            print(f"DEBUG: Searching for specific CVE ID: {query}")
            results = cve_service.get_cve_details(query)
            if 'error' not in results:
                # Format as list for consistency
                return jsonify({
                    'results': [results],
                    'total_results': 1,
                    'search_type': 'cve_id',
                    'search_params': {'query': query}
                })
            else:
                return jsonify(results), 404
        else:
            # Vendor/Product/Keyword search
            print(f"DEBUG: Unified search for query: {query}, limit={limit}")
            results = cve_service.search_cves_unified(
                query=query,
                limit=limit,
                start_index=start_index
            )
            
            return jsonify(results)
        
    except Exception as e:
        print(f"ERROR: Exception in search_cves_unified: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/search/vendor-product', methods=['GET'])
@require_permission('read')
def search_cves_by_vendor_product():
    """Search for CVEs by vendor and product name using CPE-based search"""
    try:
        vendor = request.args.get('vendor')
        product = request.args.get('product')
        limit = request.args.get('limit', 20, type=int)
        start_index = request.args.get('start_index', 0, type=int)
        
        if not vendor or not product:
            return jsonify({'error': 'Both vendor and product parameters are required'}), 400
        
        # Handle "All" option (-1) and larger limits
        if limit == -1:
            limit = 5000  # Set a reasonable maximum for "All"
        elif limit < 1 or limit > 5000:
            return jsonify({'error': 'Limit must be between 1 and 5000'}), 400
        
        print(f"DEBUG: Searching CVEs for vendor={vendor}, product={product}, limit={limit}")
        results = cve_service.search_cves_by_vendor_product(
            vendor=vendor,
            product=product,
            limit=limit,
            start_index=start_index
        )
        
        return jsonify(results)
        
    except Exception as e:
        print(f"ERROR: Exception in search_cves_by_vendor_product: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/search/keyword', methods=['GET'])
@require_permission('read')
def search_cves_by_keyword():
    """Search for CVEs by keyword"""
    try:
        keyword = request.args.get('keyword')
        limit = request.args.get('limit', 20, type=int)
        start_index = request.args.get('start_index', 0, type=int)
        
        if not keyword:
            return jsonify({'error': 'Keyword parameter is required'}), 400
        
        # Handle "All" option (-1) and larger limits
        if limit == -1:
            limit = 5000  # Set a reasonable maximum for "All"
        elif limit < 1 or limit > 5000:
            return jsonify({'error': 'Limit must be between 1 and 5000'}), 400
        
        print(f"DEBUG: Searching CVEs with keyword={keyword}, limit={limit}")
        results = cve_service.search_cves_by_keyword(
            keyword=keyword,
            limit=limit,
            start_index=start_index
        )
        
        return jsonify(results)
        
    except Exception as e:
        print(f"ERROR: Exception in search_cves_by_keyword: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/recent', methods=['GET'])
@require_permission('read')
def get_recent_cves():
    """Get recent CVEs"""
    try:
        days = request.args.get('days', 7, type=int)
        limit = request.args.get('limit', 20, type=int)
        
        if days < 1 or days > 365:
            return jsonify({'error': 'Days must be between 1 and 365'}), 400
        
        if limit < 1 or limit > 100:
            return jsonify({'error': 'Limit must be between 1 and 100'}), 400
        
        print(f"DEBUG: Getting recent CVEs for last {days} days")
        results = cve_service.get_recent_cves(days=days, limit=limit)
        
        return jsonify(results)
        
    except Exception as e:
        print(f"ERROR: Exception in get_recent_cves: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/stats', methods=['GET'])
@require_permission('read')
def get_cve_stats():
    """Get CVE statistics"""
    try:
        print("DEBUG: Getting CVE statistics")
        
        # Get recent CVEs for statistics
        recent_results = cve_service.get_recent_cves(days=7, limit=100)
        recent_cves = recent_results.get('results', [])
        
        # Calculate statistics
        severity_distribution = {}
        vendor_product_counts = {}
        
        for cve in recent_cves:
            # Severity distribution
            severity = cve.get('severity', 'unknown').lower()
            severity_distribution[severity] = severity_distribution.get(severity, 0) + 1
            
            # Vendor/product distribution
            if cve.get('vendors_products'):
                for vp in cve['vendors_products']:
                    vendor_product = f"{vp.get('vendor', 'unknown')}/{vp.get('product', 'unknown')}"
                    vendor_product_counts[vendor_product] = vendor_product_counts.get(vendor_product, 0) + 1
        
        # Get top vendor/products
        top_vendor_products = sorted(
            [{'vendor_product': k, 'count': v} for k, v in vendor_product_counts.items()],
            key=lambda x: x['count'],
            reverse=True
        )[:10]
        
        stats = {
            'recent_cves_7_days': len(recent_cves),
            'severity_distribution': severity_distribution,
            'top_vendor_products': top_vendor_products
        }
        
        return jsonify(stats)
        
    except Exception as e:
        print(f"ERROR: Exception in get_cve_stats: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/details/<cve_id>', methods=['GET'])
@require_permission('read')
def get_cve_details(cve_id):
    """Get detailed information about a specific CVE"""
    try:
        print(f"DEBUG: Getting details for CVE {cve_id}")
        results = cve_service.get_cve_details(cve_id)
        
        return jsonify(results)
        
    except Exception as e:
        print(f"ERROR: Exception in get_cve_details: {e}")
        return jsonify({'error': str(e)}), 500 