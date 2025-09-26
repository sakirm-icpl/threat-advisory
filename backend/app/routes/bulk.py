from flask import Blueprint, request, jsonify, send_file, make_response, Response
from app.models.vendor import Vendor
from app.models.product import Product
from app.models.detection_method import DetectionMethod
from app.models.setup_guide import SetupGuide
from app.services.rbac import require_admin
from app import db
import json
import io
from datetime import datetime, timezone
from sqlalchemy import func, and_, or_
from collections import OrderedDict
import sys
import traceback
from copy import deepcopy

# Blueprint definition
bp = Blueprint('bulk', __name__, url_prefix='/bulk')

# Sample JSON structure for validation and filtering
SAMPLE_JSON = {
    'vendor': {
        'name': '',
        'products': [
            {
                'name': '',
                'category': '',
                'description': '',
                'detection_methods': [
                    {
                        'name': '',
                        'technique': '',
                        'regex_python': '',
                        'regex_ruby': '',
                        'curl_command': '',
                        'expected_response': '',
                        'requires_auth': False
                    }
                ],
                'setup_guides': [
                    {
                        'title': '',
                        'content': ''
                    }
                ]
            }
        ]
    }
}

# Helper Functions
def filter_json_by_sample(input_obj, sample_obj):
    """Deeply filter an object to only allowed keys (structure-preserving)"""
    if isinstance(sample_obj, list) and isinstance(input_obj, list):
        return [filter_json_by_sample(item, sample_obj[0]) for item in input_obj]
    elif isinstance(sample_obj, dict) and isinstance(input_obj, dict):
        filtered = {}
        for key in sample_obj:
            if key in input_obj:
                filtered[key] = filter_json_by_sample(input_obj[key], sample_obj[key])
        return filtered
    else:
        return input_obj

def deep_equal(a, b):
    """Deep compare two dicts/lists"""
    if isinstance(a, dict) and isinstance(b, dict):
        if set(a.keys()) != set(b.keys()):
            return False
        return all(deep_equal(a[k], b[k]) for k in a)
    elif isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            return False
        # Compare lists as sets of dicts (order-insensitive)
        a_sorted = sorted(a, key=lambda x: str(x))
        b_sorted = sorted(b, key=lambda x: str(x))
        return all(deep_equal(x, y) for x, y in zip(a_sorted, b_sorted))
    else:
        return a == b

def flatten_import_json(nested_json):
    """Flatten nested vendor->products->methods/guides JSON into flat lists for import."""
    vendors = []
    products = []
    methods = []
    guides = []
    
    # Support both {vendor: {...}} and {vendors: [...]}
    vendor_objs = []
    if 'vendor' in nested_json:
        vendor_objs.append(nested_json['vendor'])
    if 'vendors' in nested_json:
        vendor_objs.extend(nested_json['vendors'])
    
    for v in vendor_objs:
        v_name = v.get('name', '').strip()
        if not v_name:
            continue
        vendors.append({'name': v_name})
        
        for p in v.get('products', []):
            p_name = p.get('name', '').strip()
            if not p_name:
                continue
            products.append({
                'name': p_name,
                'vendor': v_name,
                'category': p.get('category', ''),
                'description': p.get('description', '')
            })
            
            for m in p.get('detection_methods', []):
                methods.append({
                    'name': m.get('name', ''),
                    'product': p_name,
                    'technique': m.get('technique', ''),
                    'regex_python': m.get('regex_python', ''),
                    'regex_ruby': m.get('regex_ruby', ''),
                    'curl_command': m.get('curl_command', ''),
                    'expected_response': m.get('expected_response', ''),
                    'requires_auth': m.get('requires_auth', False)
                })
            
            for g in p.get('setup_guides', []):
                guides.append({
                    'title': g.get('title', ''),
                    'product': p_name,
                    'content': g.get('content', '')
                })
    
    return {
        'vendors': vendors,
        'products': products,
        'methods': methods,
        'guides': guides
    }

def isoformat_z(dt):
    """Convert datetime to ISO format with Z suffix"""
    if not dt:
        return ""
    if isinstance(dt, str):
        return dt
    try:
        return dt.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
    except Exception:
        return str(dt)

def clean_method(method):
    """Clean method data for export"""
    return OrderedDict([
        ('name', str(method.name) if method.name else ""),
        ('technique', str(method.technique) if method.technique else ""),
        ('regex_python', str(method.regex_python) if method.regex_python else ""),
        ('regex_ruby', str(method.regex_ruby) if method.regex_ruby else ""),
        ('curl_command', str(method.curl_command) if method.curl_command else ""),
        ('expected_response', str(method.expected_response) if method.expected_response else ""),
        ('requires_auth', bool(method.requires_auth)),
        ('created_at', isoformat_z(getattr(method, 'created_at', None))),
        ('updated_at', isoformat_z(getattr(method, 'updated_at', None)))
    ])

def clean_guide(guide, product_name=None):
    """Clean guide data for export"""
    title = getattr(guide, 'title', None)
    if not title or str(title).strip() == "" or title == 'null':
        title = product_name or "Untitled"
    content = getattr(guide, 'instructions', None) or getattr(guide, 'content', None) or ""
    return OrderedDict([
        ('title', str(title)),
        ('content', str(content)),
        ('created_at', isoformat_z(getattr(guide, 'created_at', None))),
        ('updated_at', isoformat_z(getattr(guide, 'updated_at', None)))
    ])

def clean_product(product):
    """Clean product data for export"""
    methods = DetectionMethod.query.filter_by(product_id=product.id).all()
    guides = SetupGuide.query.filter_by(product_id=product.id).all()
    return OrderedDict([
        ('name', str(product.name) if product.name else ""),
        ('category', str(product.category) if product.category else ""),
        ('description', str(product.description) if product.description else ""),
        ('created_at', isoformat_z(getattr(product, 'created_at', None))),
        ('updated_at', isoformat_z(getattr(product, 'updated_at', None))),
        ('detection_methods', [clean_method(m) for m in methods]),
        ('setup_guides', [clean_guide(g, product.name) for g in guides])
    ])

def clean_vendor(vendor):
    """Clean vendor data for export"""
    products = Product.query.filter_by(vendor_id=vendor.id).all()
    return OrderedDict([
        ('name', str(vendor.name) if vendor.name else ""),
        ('created_at', isoformat_z(getattr(vendor, 'created_at', None))),
        ('updated_at', isoformat_z(getattr(vendor, 'updated_at', None))),
        ('products', [clean_product(p) for p in products])
    ])

def safe_json_dumps(obj):
    """Safely dump JSON with fallback for non-serializable objects"""
    def fallback(o):
        return str(o)
    return json.dumps(obj, ensure_ascii=False, default=fallback)

# Import Routes
@bp.route('/import-preview', methods=['POST'])
@require_admin
def import_preview():
    """Preview what will be imported or replaced, with deep comparison and structure cleaning. Supports single or multiple vendors."""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Handle both direct data and data wrapped in 'data' property
        import_data = data.get('data', data)
        if not import_data:
            return jsonify({'error': 'No data provided'}), 400

        # Support both single-vendor and multi-vendor preview
        vendors_to_preview = []
        if 'vendor' in import_data:
            vendors_to_preview = [import_data['vendor']]
        elif 'vendors' in import_data:
            vendors_to_preview = import_data['vendors']
        else:
            return jsonify({'error': 'No vendor(s) provided'}), 400

        # DB snapshot
        vendor_name_to_obj = {v.name: v for v in Vendor.query.all()}
        product_name_to_obj = {p.name: p for p in Product.query.all()}

        # Combined preview for all vendors
        combined_preview = {
            'can_add': False, 
            'can_replace': False, 
            'add': {'vendors': []}, 
            'replace': {'vendors': []}, 
            'error': None
        }
        
        # Track if ALL vendors have all data existing
        all_vendors_exist_completely = True

        for vendor_data in vendors_to_preview:
            # Clean/filter the uploaded JSON to match the sample structure
            cleaned_json = filter_json_by_sample({'vendor': vendor_data}, SAMPLE_JSON)
            vendor = cleaned_json.get('vendor')
            if not vendor or not vendor.get('name'):
                combined_preview['error'] = 'Vendor name is required.'
                return jsonify(combined_preview), 400

            v_name = vendor['name']
            db_vendor = vendor_name_to_obj.get(v_name)

            # Deep comparison logic for this vendor
            preview = {'can_add': False, 'can_replace': False, 'add': {}, 'replace': {}, 'error': None}

            if not db_vendor:
                preview['can_add'] = True
                preview['add'] = cleaned_json
                combined_preview['can_add'] = True
                combined_preview['add']['vendors'].append(cleaned_json)
                continue

            db_products = [p for p in Product.query.filter_by(vendor_id=db_vendor.id).all()]
            add_products = []
            replace_products = []
            all_products_unchanged = True

            for prod in vendor.get('products', []):
                p_name = prod.get('name')
                if not p_name:
                    continue
                db_prod = next((p for p in db_products if p.name == p_name), None)
                if not db_prod:
                    add_products.append(prod)
                    all_products_unchanged = False
                    continue

                # Product exists, compare children
                db_methods = [m for m in DetectionMethod.query.filter_by(product_id=db_prod.id).all()]
                db_guides = [g for g in SetupGuide.query.filter_by(product_id=db_prod.id).all()]
                prod_methods = prod.get('detection_methods', [])
                add_methods = []
                changed_methods = []

                for m in prod_methods:
                    m_name = m.get('name')
                    if not m_name:
                        continue
                    found_equivalent = False
                    for db_m in db_methods:
                        db_m_dict = {k: getattr(db_m, k) for k in ['technique','regex_python','regex_ruby','curl_command','expected_response','requires_auth']}
                        m_compare = {k: m.get(k) for k in ['technique','regex_python','regex_ruby','curl_command','expected_response','requires_auth']}
                        if deep_equal(m_compare, db_m_dict):
                            found_equivalent = True
                            break
                    if not found_equivalent:
                        # If method name exists, it's a change; if not, it's new
                        if any(db_m.name == m_name for db_m in db_methods):
                            changed_methods.append(m)
                        else:
                            add_methods.append(m)
                        all_products_unchanged = False

                prod_guides = prod.get('setup_guides', [])
                add_guides = []
                changed_guides = []

                for g in prod_guides:
                    g_title = g.get('title')
                    g_content = g.get('content', '')
                    if not g_title or not g_content:
                        continue
                    found_equivalent = False
                    for db_g in db_guides:
                        expected_title = f"Title: {g_title}\n\n{g_content}"
                        if db_g.instructions == g_content or db_g.instructions == expected_title:
                            found_equivalent = True
                            break
                    if not found_equivalent:
                        # If guide title exists, it's a change; if not, it's new
                        if any(g_title in (db_g.instructions or '') for db_g in db_guides):
                            changed_guides.append(g)
                        else:
                            add_guides.append(g)
                        all_products_unchanged = False

                # If there are any new or changed methods/guides, allow add/replace
                if add_methods or changed_methods or add_guides or changed_guides:
                    # For Add mode, new methods/guides are added
                    if add_methods or add_guides:
                        add_products.append({
                            'name': p_name,
                            'add_methods': add_methods,
                            'add_guides': add_guides
                        })
                    # For Replace mode, new or changed methods/guides are replaced
                    if add_methods or changed_methods or add_guides or changed_guides:
                        replace_products.append({
                            'name': p_name,
                            'add_methods': add_methods,
                            'changed_methods': changed_methods,
                            'add_guides': add_guides,
                            'changed_guides': changed_guides
                        })

            # If all products exist and match for this vendor, mark it
            if not add_products and not replace_products and all_products_unchanged:
                # This vendor has all data existing, but don't return error yet
                # Continue checking other vendors
                pass
            else:
                # This vendor has some new/changed data
                all_vendors_exist_completely = False

            # If there are products to add, can_add
            if add_products:
                preview['can_add'] = True
                preview['add'] = {'vendor': {'name': v_name, 'products': add_products}}
                combined_preview['can_add'] = True
                combined_preview['add']['vendors'].append({'vendor': {'name': v_name, 'products': add_products}})

            # If there are products to replace (new or changed children), can_replace
            if replace_products:
                preview['can_replace'] = True
                preview['replace'] = {'vendor': {'name': v_name, 'products': replace_products}}
                combined_preview['can_replace'] = True
                combined_preview['replace']['vendors'].append({'vendor': {'name': v_name, 'products': replace_products}})

        # After checking all vendors, set error only if ALL vendors have all data existing
        if all_vendors_exist_completely and not combined_preview['can_add'] and not combined_preview['can_replace']:
            combined_preview['error'] = 'The data already exists.'
            return jsonify(combined_preview), 200

        return jsonify(combined_preview), 200

    except Exception as e:
        import sys, traceback
        print("IMPORT PREVIEW ERROR:", file=sys.stderr, flush=True)
        print(traceback.format_exc(), file=sys.stderr, flush=True)
        return jsonify({'error': str(e)}), 500

@bp.route('/import', methods=['POST'])
@require_admin
def import_data():
    """Import data from JSON with proper handling of nested structure and add/replace modes. Supports single or multiple vendors."""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Handle both direct data and data wrapped in 'data' property
        import_data = data.get('data', data)
        if not import_data:
            return jsonify({'error': 'No data provided'}), 400

        # Support both single-vendor and multi-vendor import
        vendors_to_import = []
        if 'vendor' in import_data:
            vendors_to_import = [import_data['vendor']]
        elif 'vendors' in import_data:
            vendors_to_import = import_data['vendors']
        else:
            return jsonify({'error': 'No vendor(s) provided'}), 400

        mode = data.get('mode', 'add')  # 'add' or 'replace'
        overall_summary = {
            'vendors': {'added': [], 'errors': []},
            'products': {'added': [], 'errors': []},
            'methods': {'added': [], 'errors': []},
            'guides': {'added': [], 'errors': []},
            'errors': []
        }

        for vendor_data in vendors_to_import:
            # Clean/filter the uploaded JSON to match the sample structure
            cleaned_json = filter_json_by_sample({'vendor': vendor_data}, SAMPLE_JSON)
            vendor_data = cleaned_json.get('vendor')
            if not vendor_data or not vendor_data.get('name'):
                overall_summary['vendors']['errors'].append('Vendor name is required')
                continue

            vendor_name = vendor_data['name'].strip()
            existing_vendor = Vendor.query.filter_by(name=vendor_name).first()

            if not existing_vendor:
                try:
                    existing_vendor = Vendor(name=vendor_name)
                    db.session.add(existing_vendor)
                    db.session.flush()
                    overall_summary['vendors']['added'].append({'name': vendor_name})
                except Exception as e:
                    overall_summary['vendors']['errors'].append(f"Vendor {vendor_name}: {str(e)}")
                    db.session.rollback()
                    continue

            for product_data in vendor_data.get('products', []):
                product_name = product_data.get('name', '').strip()
                if not product_name:
                    overall_summary['products']['errors'].append('Product with missing name')
                    continue

                existing_product = Product.query.filter_by(name=product_name, vendor_id=existing_vendor.id).first()

                if not existing_product:
                    try:
                        existing_product = Product(
                            name=product_name,
                            vendor_id=existing_vendor.id,
                            category=product_data.get('category'),
                            description=product_data.get('description')
                        )
                        db.session.add(existing_product)
                        db.session.flush()
                        overall_summary['products']['added'].append({'name': product_name, 'vendor': vendor_name})
                    except Exception as e:
                        overall_summary['products']['errors'].append(f"Product {product_name}: {str(e)}")
                        continue

                # REPLACE MODE: Delete only what is present in import
                if mode == 'replace':
                    if 'detection_methods' in product_data:
                        DetectionMethod.query.filter_by(product_id=existing_product.id).delete()
                    if 'setup_guides' in product_data:
                        SetupGuide.query.filter_by(product_id=existing_product.id).delete()
                    db.session.flush()

                # Process detection methods
                for method_data in product_data.get('detection_methods', []):
                    method_name = method_data.get('name', '').strip()
                    if not method_name:
                        overall_summary['methods']['errors'].append(f"Method missing name for product {product_name}")
                        continue

                    if mode == 'add':
                        existing_method = DetectionMethod.query.filter_by(name=method_name, product_id=existing_product.id).first()
                        if existing_method:
                            continue
                    try:
                        method = DetectionMethod(
                            name=method_name,
                            product_id=existing_product.id,
                            technique=method_data.get('technique'),
                            regex_python=method_data.get('regex_python'),
                            regex_ruby=method_data.get('regex_ruby'),
                            curl_command=method_data.get('curl_command'),
                            expected_response=method_data.get('expected_response'),
                            requires_auth=method_data.get('requires_auth', False)
                        )
                        db.session.add(method)
                        overall_summary['methods']['added'].append({
                            'name': method_name, 
                            'product': product_name, 
                            'action': 'replaced' if mode == 'replace' else 'added'
                        })
                    except Exception as e:
                        overall_summary['methods']['errors'].append(f"Method {method_name}: {str(e)}")

                # Process setup guides
                for guide_data in product_data.get('setup_guides', []):
                    guide_title = guide_data.get('title', '').strip()
                    if not guide_title:
                        overall_summary['guides']['errors'].append(f"Guide missing title for product {product_name}")
                        continue

                    guide_content = guide_data.get('content', '')
                    if not guide_content:
                        overall_summary['guides']['errors'].append(f"Guide missing content for product {product_name}")
                        continue

                    if mode == 'add':
                        existing_guide = SetupGuide.query.filter_by(product_id=existing_product.id).filter(
                            (SetupGuide.instructions == guide_content) | (SetupGuide.instructions == f"Title: {guide_title}\n\n{guide_content}")
                        ).first()
                        if existing_guide:
                            continue
                    try:
                        guide = SetupGuide(
                            instructions=f"Title: {guide_title}\n\n{guide_content}",
                            product_id=existing_product.id
                        )
                        db.session.add(guide)
                        overall_summary['guides']['added'].append({
                            'title': guide_title, 
                            'product': product_name, 
                            'action': 'replaced' if mode == 'replace' else 'added'
                        })
                    except Exception as e:
                        overall_summary['guides']['errors'].append(f"Guide {guide_title}: {str(e)}")

        db.session.commit()
        return jsonify(overall_summary), 200

    except Exception as e:
        db.session.rollback()
        import sys, traceback
        print("IMPORT ERROR (POST /bulk/import):", file=sys.stderr, flush=True)
        print(traceback.format_exc(), file=sys.stderr, flush=True)
        return jsonify({'error': str(e)}), 500

# Export Routes
@bp.route('/export', methods=['GET'])
@require_admin
def export_data():
    """Export all data as JSON"""
    try:
        data = {
            'vendors': [vendor.to_dict() for vendor in Vendor.query.all()],
            'products': [product.to_dict() for product in Product.query.all()],
            'methods': [method.to_dict() for method in DetectionMethod.query.all()],
            'guides': [guide.to_dict() for guide in SetupGuide.query.all()],
            'exported_at': datetime.utcnow().isoformat()
        }
        
        return jsonify(data), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/export-all', methods=['GET'])
@require_admin
def export_all():
    """Export all data in hierarchical format"""
    vendors = Vendor.query.all()
    export_data = OrderedDict([
        ('exported_at', isoformat_z(datetime.utcnow())),
        ('vendors', [clean_vendor(v) for v in vendors])
    ])
    json_str = json.dumps(export_data, ensure_ascii=False)
    return Response(json_str, mimetype='application/json')

@bp.route('/export-vendor/<int:vendor_id>', methods=['GET'])
@require_admin
def export_vendor_data(vendor_id):
    """Export specific vendor data"""
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404
    export_data = OrderedDict([
        ('exported_at', isoformat_z(datetime.utcnow())),
        ('vendor', clean_vendor(vendor))
    ])
    json_str = json.dumps(export_data, ensure_ascii=False)
    return Response(json_str, mimetype='application/json')

@bp.route('/export-product/<int:product_id>', methods=['GET'])
@require_admin
def export_product_data(product_id):
    """Export specific product data"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    vendor = Vendor.query.get(product.vendor_id)
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404
    vendor_data = OrderedDict([
        ('name', vendor.name),
        ('created_at', isoformat_z(getattr(vendor, 'created_at', None))),
        ('updated_at', isoformat_z(getattr(vendor, 'updated_at', None))),
        ('products', [clean_product(product)])
    ])
    export_data = OrderedDict([
        ('exported_at', isoformat_z(datetime.utcnow())),
        ('vendor', vendor_data)
    ])
    json_str = json.dumps(export_data, ensure_ascii=False)
    return Response(json_str, mimetype='application/json')

@bp.route('/export-all-complete', methods=['GET'])
@require_admin
def export_all_complete():
    """Export all data in a complete format with full relationships"""
    try:
        # Get all vendors with their complete data
        vendors = Vendor.query.all()
        complete_data = []
        
        for vendor in vendors:
            vendor_dict = vendor.to_dict()
            products = Product.query.filter_by(vendor_id=vendor.id).all()
            vendor_dict['products'] = []
            
            for product in products:
                product_dict = product.to_dict()
                
                # Add detection methods for this product
                methods = DetectionMethod.query.filter_by(product_id=product.id).all()
                product_dict['detection_methods'] = [m.to_dict() for m in methods]
                
                # Add setup guides for this product
                guides = SetupGuide.query.filter_by(product_id=product.id).all()
                product_dict['setup_guides'] = [g.to_dict() for g in guides]
                
                vendor_dict['products'].append(product_dict)
            
            complete_data.append(vendor_dict)
        
        export_data = {
            'vendors': complete_data,
            'exported_at': datetime.utcnow().isoformat(),
            'summary': {
                'total_vendors': len(vendors),
                'total_products': sum(len(v['products']) for v in complete_data),
                'total_methods': sum(len(p['detection_methods']) for v in complete_data for p in v['products']),
                'total_guides': sum(len(p['setup_guides']) for v in complete_data for p in v['products'])
            }
        }
        
        return jsonify(export_data), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500 