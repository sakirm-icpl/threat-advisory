from flask import Blueprint, request, jsonify
from app.services.cve_service import CVEService
from app.services.rbac import require_permission
from app.services.ai_researcher import AIResearcherService
import re

bp = Blueprint('cve', __name__, url_prefix='/api/cve')
cve_service = CVEService()
ai_service = AIResearcherService()

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
        
        # Use the unified service method which handles all search types
        print(f"DEBUG: Unified search for query: {query}, limit={limit}")
        results = cve_service.search_cves_unified(
            query=query,
            limit=limit,
            start_index=start_index
        )
        
        # Handle CVE ID not found case
        if results.get('search_type') == 'cve_id_not_found':
            return jsonify(results), 404
        
        return jsonify(results)
        
    except Exception as e:
        print(f"ERROR: Exception in search_cves_unified: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/search/vendor', methods=['GET'])
@require_permission('read')
def search_cves_by_vendor():
    """Search for CVEs by vendor only - returns all CVEs affecting any products from the vendor"""
    try:
        vendor = request.args.get('vendor')
        limit = request.args.get('limit', 20, type=int)
        start_index = request.args.get('start_index', 0, type=int)
        
        if not vendor:
            return jsonify({'error': 'Vendor parameter is required'}), 400
        
        # Handle "All" option (-1) and larger limits
        if limit == -1:
            limit = 5000  # Set a reasonable maximum for "All"
        elif limit < 1 or limit > 5000:
            return jsonify({'error': 'Limit must be between 1 and 5000'}), 400
        
        print(f"DEBUG: Searching CVEs for vendor={vendor}, limit={limit}")
        results = cve_service.search_cves_by_vendor_only(
            vendor=vendor,
            limit=limit,
            start_index=start_index
        )
        
        return jsonify(results)
        
    except Exception as e:
        print(f"ERROR: Exception in search_cves_by_vendor: {e}")
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
    """Get recent CVEs from the last N days"""
    try:
        days = request.args.get('days', 30, type=int)
        limit = request.args.get('limit', 20, type=int)
        start_index = request.args.get('start_index', 0, type=int)
        
        if days < 1 or days > 365:
            return jsonify({'error': 'Days must be between 1 and 365'}), 400
        
        if limit < 1 or limit > 1000:
            return jsonify({'error': 'Limit must be between 1 and 1000'}), 400
        
        if start_index < 0:
            return jsonify({'error': 'start_index must be >= 0'}), 400
        
        print(f"DEBUG: Getting recent CVEs for last {days} days, limit={limit}, start_index={start_index}")
        results = cve_service.get_recent_cves(days=days, limit=limit, start_index=start_index)
        
        return jsonify(results)
        
    except Exception as e:
        print(f"ERROR: Exception in get_recent_cves: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/stats', methods=['GET'])
@require_permission('read')
def get_cve_stats():
    """Get CVE statistics and summary information"""
    try:
        # Fetch first page to get total count
        batch_size = 200
        first_page = cve_service.get_recent_cves(days=30, limit=batch_size, start_index=0)

        if 'error' in first_page:
            return jsonify(first_page), 500

        total_recent = first_page.get('total_results', 0)
        # Determine how many to aggregate (cap to avoid excessive requests)
        max_to_aggregate = min(total_recent, 5000)

        aggregated = list(first_page.get('results', []))
        start_index = len(aggregated)

        while start_index < max_to_aggregate:
            page_limit = min(batch_size, max_to_aggregate - start_index)
            page = cve_service.get_recent_cves(days=30, limit=page_limit, start_index=start_index)
            if 'error' in page:
                break
            page_results = page.get('results', [])
            if not page_results:
                break
            aggregated.extend(page_results)
            start_index += len(page_results)

        # Calculate statistics from aggregated set
        severity_counts = {}
        vendor_counts = {}

        for cve in aggregated:
            severity = cve.get('severity', 'UNKNOWN')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1

            for vp in cve.get('vendors_products', []):
                vendor = vp.get('vendor', 'Unknown')
                vendor_counts[vendor] = vendor_counts.get(vendor, 0) + 1

        top_vendors = sorted(vendor_counts.items(), key=lambda x: x[1], reverse=True)[:10]

        return jsonify({
            'total_recent_cves': total_recent,
            'considered_results': len(aggregated),
            'severity_distribution': severity_counts,
            'top_vendors': top_vendors,
            'search_params': {
                'days': 30,
                'method': 'stats_calculation',
                'batch_size': batch_size,
                'max_aggregated': max_to_aggregate
            }
        })
        
    except Exception as e:
        print(f"ERROR: Exception in get_cve_stats: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/details/<cve_id>', methods=['GET'])
@require_permission('read')
def get_cve_details(cve_id):
    """Get detailed information for a specific CVE"""
    try:
        # Validate CVE ID format
        cve_pattern = re.compile(r'^CVE-\d{4}-\d{4,}$', re.IGNORECASE)
        if not cve_pattern.match(cve_id):
            return jsonify({'error': 'Invalid CVE ID format'}), 400
        
        print(f"DEBUG: Getting details for CVE: {cve_id}")
        results = cve_service.get_cve_details(cve_id)
        
        if 'error' in results:
            return jsonify(results), 404
        
        return jsonify(results)
        
    except Exception as e:
        print(f"ERROR: Exception in get_cve_details: {e}")
        return jsonify({'error': str(e)}), 500 


@bp.route('/ai/remediation/<cve_id>', methods=['GET'])
@require_permission('read')
def ai_cve_remediation(cve_id):
    """Generate remediation and patching guidance for a CVE via LLM.

    1) Fetch CVE details from NVD
    2) Build research prompt per spec
    3) Call LLM provider (OpenAI if configured)
    4) Return parsed JSON or error
    """
    try:
        # Validate CVE ID format
        cve_pattern = re.compile(r'^CVE-\d{4}-\d{4,}$', re.IGNORECASE)
        if not cve_pattern.match(cve_id):
            return jsonify({'error': 'Invalid CVE ID format'}), 400

        # Ensure AI provider configured
        if not ai_service.is_configured():
            return jsonify({'error': 'LLM provider not configured. Set OPENAI_API_KEY on backend to enable this feature.'}), 503

        # Get CVE details (summary with references)
        details = cve_service.get_cve_details(cve_id)
        if 'error' in details:
            return jsonify(details), 404

        result = ai_service.generate_ai_remediation(details)
        status = 200 if 'data' in result else 500
        return jsonify(result), status
    except Exception as e:
        print(f"ERROR: Exception in ai_cve_remediation: {e}")
        return jsonify({'error': str(e)}), 500