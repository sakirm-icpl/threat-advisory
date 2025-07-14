from flask import Blueprint, request, jsonify
from app.models.vendor import Vendor
from app.models.product import Product
from app.models.detection_method import DetectionMethod
from app.models.setup_guide import SetupGuide
from app.services.auth import require_permission
from sqlalchemy import or_

bp = Blueprint('search', __name__, url_prefix='/search')

@bp.route('', methods=['GET'])
@require_permission('read')
def search_all():
    """Unified search across all entities, grouped by type. For matched vendors, include all their products (with detection methods and setup guides)."""
    try:
        query = request.args.get('q', '')
        search_type = request.args.get('type', 'all')  # 'all', 'vendor', 'product'
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400

        vendor_results = []
        product_results = []
        method_results = []
        guide_results = []
        vendor_product_ids = set()
        product_ids = set()

        # Search vendors
        if search_type in ['all', 'vendor']:
        vendors = Vendor.query.filter(
            Vendor.name.ilike(f'%{query}%')
        ).all()
            
        for vendor in vendors:
            products = Product.query.filter_by(vendor_id=vendor.id).all()
            product_dicts = []
            for product in products:
                pdict = product.to_dict()
                methods = DetectionMethod.query.filter_by(product_id=product.id).all()
                guides = SetupGuide.query.filter_by(product_id=product.id).all()
                pdict['detection_methods'] = [m.to_dict() for m in methods]
                pdict['setup_guides'] = [g.to_dict() for g in guides]
                product_dicts.append(pdict)
                vendor_product_ids.add(product.id)
            vdict = vendor.to_dict()
            vdict['products'] = product_dicts
            vendor_results.append(vdict)

        # Search products (not already included under matched vendors)
        if search_type in ['all', 'product']:
        products = Product.query.filter(
                or_(
                    Product.name.ilike(f'%{query}%'),
                    Product.category.ilike(f'%{query}%'),
                    Product.description.ilike(f'%{query}%')
                )
        ).all()
            # Deduplicate products by ID
            product_dict = {}
        for product in products:
            if product.id in vendor_product_ids:
                continue  # skip products already included under vendors
                if product.id not in product_dict:
                    product_data = product.to_dict()
            methods = DetectionMethod.query.filter_by(product_id=product.id).all()
            guides = SetupGuide.query.filter_by(product_id=product.id).all()
                    product_data['detection_methods'] = [m.to_dict() for m in methods]
                    product_data['setup_guides'] = [g.to_dict() for g in guides]
                    product_dict[product.id] = product_data
            product_ids.add(product.id)
            product_results = list(product_dict.values())

        # Search detection methods (by name, technique, regex, etc.) - only if searching all
        if search_type == 'all':
        methods = DetectionMethod.query.filter(
            or_(
                DetectionMethod.name.ilike(f'%{query}%'),
                DetectionMethod.technique.ilike(f'%{query}%'),
                DetectionMethod.regex_python.ilike(f'%{query}%'),
                DetectionMethod.regex_ruby.ilike(f'%{query}%'),
                DetectionMethod.curl_command.ilike(f'%{query}%'),
                DetectionMethod.expected_response.ilike(f'%{query}%')
            )
        ).all()
        # Exclude methods already included under matched products
        method_results = [m.to_dict() for m in methods if m.product_id not in product_ids and m.product_id not in vendor_product_ids]

            # Search setup guides (by instructions) - only if searching all
        guides = SetupGuide.query.filter(
            SetupGuide.instructions.ilike(f'%{query}%')
        ).all()
        # Exclude guides already included under matched products
        guide_results = [g.to_dict() for g in guides if g.product_id not in product_ids and g.product_id not in vendor_product_ids]

        return jsonify({
            'vendors': vendor_results,
            'products': product_results,
            'methods': method_results,
            'guides': guide_results
        }), 200
    except Exception as e:
        print(f"[ERROR] Exception in search_all: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/advanced', methods=['POST'])
@require_permission('read')
def advanced_search():
    """Advanced search with filters"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Search criteria required'}), 400
        
        results = {}
        
        # Vendor search
        if 'vendors' in data:
            vendor_filters = data['vendors']
            query = Vendor.query
            
            if 'name' in vendor_filters:
                query = query.filter(Vendor.name.ilike(f"%{vendor_filters['name']}%"))
            
            vendors = query.all()
            results['vendors'] = [vendor.to_dict() for vendor in vendors]
        
        # Product search
        if 'products' in data:
            product_filters = data['products']
            query = Product.query
            
            if 'name' in product_filters:
                query = query.filter(Product.name.ilike(f"%{product_filters['name']}%"))
            if 'category' in product_filters:
                query = query.filter(Product.category.ilike(f"%{product_filters['category']}%"))
            if 'vendor_id' in product_filters:
                query = query.filter(Product.vendor_id == product_filters['vendor_id'])
            
            products = query.all()
            results['products'] = [product.to_dict() for product in products]
        
        # Method search
        if 'methods' in data:
            method_filters = data['methods']
            query = DetectionMethod.query
            
            if 'method_type' in method_filters:
                query = query.filter(DetectionMethod.method_type == method_filters['method_type'])
            if 'requires_auth' in method_filters:
                query = query.filter(DetectionMethod.requires_auth == method_filters['requires_auth'])
            if 'confidence_min' in method_filters:
                query = query.filter(DetectionMethod.confidence_level >= method_filters['confidence_min'])
            if 'confidence_max' in method_filters:
                query = query.filter(DetectionMethod.confidence_level <= method_filters['confidence_max'])
            if 'product_id' in method_filters:
                query = query.filter(DetectionMethod.product_id == method_filters['product_id'])
            
            methods = query.all()
            results['methods'] = [method.to_dict() for method in methods]
        
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 