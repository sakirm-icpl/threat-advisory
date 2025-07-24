from flask import Blueprint, request, jsonify, send_file, make_response, Response
from app.models.vendor import Vendor
from app.models.product import Product
from app.models.detection_method import DetectionMethod
from app.models.setup_guide import SetupGuide
from app.services.auth import require_admin
from app import db
import json
import csv
import io
from datetime import datetime, timezone
import tempfile
import io
from docx import Document
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os
from sqlalchemy import func, and_, or_
from collections import defaultdict
from collections import OrderedDict
import sys
import traceback

bp = Blueprint('bulk', __name__, url_prefix='/bulk')





@bp.route('/cleanup', methods=['POST'])
@require_admin
def cleanup_data():
    """Clean up orphaned records and fix data integrity issues"""
    try:
        data = request.json or {}
        cleanup_types = data.get('types', ['orphaned_products', 'orphaned_methods', 'orphaned_guides', 'empty_vendors'])
        
        results = {}
        
        if 'orphaned_products' in cleanup_types:
            orphaned_count = Product.query.filter(~Product.vendor_id.in_(
                db.session.query(Vendor.id)
            )).delete()
            results['orphaned_products_removed'] = orphaned_count
        
        if 'orphaned_methods' in cleanup_types:
            orphaned_count = DetectionMethod.query.filter(~DetectionMethod.product_id.in_(
                db.session.query(Product.id)
            )).delete()
            results['orphaned_methods_removed'] = orphaned_count
        
        if 'orphaned_guides' in cleanup_types:
            orphaned_count = SetupGuide.query.filter(~SetupGuide.product_id.in_(
                db.session.query(Product.id)
            )).delete()
            results['orphaned_guides_removed'] = orphaned_count
        
        if 'empty_vendors' in cleanup_types:
            empty_count = Vendor.query.filter(~Vendor.id.in_(
                db.session.query(Product.vendor_id)
            )).delete()
            results['empty_vendors_removed'] = empty_count
        
        db.session.commit()
        
        return jsonify({
            'message': 'Cleanup completed',
            'results': results
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/export-selective', methods=['POST'])
@require_admin
def export_selective():
    """Export specific data types with filters"""
    try:
        data = request.json or {}
        export_types = data.get('types', ['vendors', 'products', 'methods', 'guides'])
        format_type = data.get('format', 'json')
        filters = data.get('filters', {})
        
        export_data = {}
        
        if 'vendors' in export_types:
            query = Vendor.query
            if 'vendor_ids' in filters:
                query = query.filter(Vendor.id.in_(filters['vendor_ids']))
            if 'vendor_names' in filters:
                query = query.filter(Vendor.name.in_(filters['vendor_names']))
            export_data['vendors'] = [vendor.to_dict() for vendor in query.all()]
        
        if 'products' in export_types:
            query = Product.query
            if 'vendor_ids' in filters:
                query = query.filter(Product.vendor_id.in_(filters['vendor_ids']))
            if 'product_ids' in filters:
                query = query.filter(Product.id.in_(filters['product_ids']))
            if 'categories' in filters:
                query = query.filter(Product.category.in_(filters['categories']))
            export_data['products'] = [product.to_dict() for product in query.all()]
        
        if 'methods' in export_types:
            query = DetectionMethod.query
            if 'product_ids' in filters:
                query = query.filter(DetectionMethod.product_id.in_(filters['product_ids']))
            if 'method_ids' in filters:
                query = query.filter(DetectionMethod.id.in_(filters['method_ids']))
            export_data['methods'] = [method.to_dict() for method in query.all()]
        
        if 'guides' in export_types:
            query = SetupGuide.query
            if 'product_ids' in filters:
                query = query.filter(SetupGuide.product_id.in_(filters['product_ids']))
            if 'guide_ids' in filters:
                query = query.filter(SetupGuide.id.in_(filters['guide_ids']))
            export_data['guides'] = [guide.to_dict() for guide in query.all()]
        
        export_data['exported_at'] = datetime.utcnow().isoformat()
        export_data['filters_applied'] = filters
        
        if format_type == 'json':
            return jsonify(export_data), 200
        elif format_type == 'csv':
            # Create CSV with selected data
            output = io.StringIO()
            writer = csv.writer(output)
            
            if 'vendors' in export_data:
                writer.writerow(['Type', 'ID', 'Name', 'Created At'])
                for vendor in export_data['vendors']:
                    writer.writerow(['Vendor', vendor['id'], vendor['name'], vendor['created_at']])
            
            if 'products' in export_data:
                for product in export_data['products']:
                    writer.writerow(['Product', product['id'], product['name'], product['category'], product['vendor_name']])
            
            output.seek(0)
            return send_file(
                io.BytesIO(output.getvalue().encode('utf-8')),
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'versionintel_selective_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            )
        else:
            return jsonify({'error': 'Unsupported format'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/import-preview', methods=['POST'])
@require_admin
def import_preview():
    """Preview what will be imported without actually importing"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        preview = {
            'vendors': {'new': 0, 'existing': 0, 'details': []},
            'products': {'new': 0, 'existing': 0, 'details': []},
            'methods': {'new': 0, 'existing': 0, 'details': []},
            'guides': {'new': 0, 'existing': 0, 'details': []},
            'warnings': []
        }
        
        # Preview vendors
        if 'vendors' in data:
            for vendor_data in data['vendors']:
                existing = Vendor.query.filter_by(name=vendor_data['name']).first()
                if existing:
                    preview['vendors']['existing'] += 1
                    preview['vendors']['details'].append({
                        'name': vendor_data['name'],
                        'status': 'existing',
                        'existing_id': existing.id
                    })
                else:
                    preview['vendors']['new'] += 1
                    preview['vendors']['details'].append({
                        'name': vendor_data['name'],
                        'status': 'new'
                    })
        
        # Preview products
        if 'products' in data:
            for product_data in data['products']:
                existing = Product.query.filter_by(name=product_data['name']).first()
                if existing:
                    preview['products']['existing'] += 1
                    preview['products']['details'].append({
                        'name': product_data['name'],
                        'status': 'existing',
                        'existing_id': existing.id
                    })
                else:
                    # Check if vendor exists
                    vendor = Vendor.query.get(product_data.get('vendor_id'))
                    if not vendor:
                        preview['warnings'].append(f"Product '{product_data['name']}' references non-existent vendor ID {product_data.get('vendor_id')}")
                    
                    preview['products']['new'] += 1
                    preview['products']['details'].append({
                        'name': product_data['name'],
                        'status': 'new',
                        'vendor_id': product_data.get('vendor_id')
                    })
        
        # Preview methods and guides similarly...
        if 'methods' in data:
            for method_data in data['methods']:
                existing = DetectionMethod.query.filter_by(
                    name=method_data['name'],
                    product_id=method_data.get('product_id')
                ).first()
                if existing:
                    preview['methods']['existing'] += 1
                else:
                    preview['methods']['new'] += 1
        
        if 'guides' in data:
            for guide_data in data['guides']:
                existing = SetupGuide.query.filter_by(
                    title=guide_data.get('title', ''),
                    product_id=guide_data.get('product_id')
                ).first()
                if existing:
                    preview['guides']['existing'] += 1
                else:
                    preview['guides']['new'] += 1
        
        return jsonify(preview), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/bulk-delete', methods=['POST'])
@require_admin
def bulk_delete():
    """Safely delete multiple records with confirmation"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        delete_types = data.get('types', {})
        results = {}
        
        if 'vendor_ids' in delete_types:
            vendor_ids = delete_types['vendor_ids']
            # Delete vendors and all related data
            vendors = Vendor.query.filter(Vendor.id.in_(vendor_ids)).all()
            deleted_count = 0
            for vendor in vendors:
                # Delete related products, methods, and guides
                products = Product.query.filter_by(vendor_id=vendor.id).all()
                for product in products:
                    DetectionMethod.query.filter_by(product_id=product.id).delete()
                    SetupGuide.query.filter_by(product_id=product.id).delete()
                Product.query.filter_by(vendor_id=vendor.id).delete()
                db.session.delete(vendor)
                deleted_count += 1
            results['vendors_deleted'] = deleted_count
        
        if 'product_ids' in delete_types:
            product_ids = delete_types['product_ids']
            # Delete products and related methods/guides
            products = Product.query.filter(Product.id.in_(product_ids)).all()
            deleted_count = 0
            for product in products:
                DetectionMethod.query.filter_by(product_id=product.id).delete()
                SetupGuide.query.filter_by(product_id=product.id).delete()
                db.session.delete(product)
                deleted_count += 1
            results['products_deleted'] = deleted_count
        
        if 'method_ids' in delete_types:
            method_ids = delete_types['method_ids']
            deleted_count = DetectionMethod.query.filter(DetectionMethod.id.in_(method_ids)).delete()
            results['methods_deleted'] = deleted_count
        
        if 'guide_ids' in delete_types:
            guide_ids = delete_types['guide_ids']
            deleted_count = SetupGuide.query.filter(SetupGuide.id.in_(guide_ids)).delete()
            results['guides_deleted'] = deleted_count
        
        db.session.commit()
        
        return jsonify({
            'message': 'Bulk delete completed',
            'results': results
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



@bp.route('/export', methods=['GET'])
@require_admin
def export_data():
    """Export all data as JSON"""
    try:
        format_type = request.args.get('format', 'json')  # json, csv
        
        if format_type == 'json':
            data = {
                'vendors': [vendor.to_dict() for vendor in Vendor.query.all()],
                'products': [product.to_dict() for product in Product.query.all()],
                'methods': [method.to_dict() for method in DetectionMethod.query.all()],
                'guides': [guide.to_dict() for guide in SetupGuide.query.all()],
                'exported_at': datetime.utcnow().isoformat()
            }
            
            return jsonify(data), 200
        
        elif format_type == 'csv':
            # Create CSV files for each entity
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Export vendors
            writer.writerow(['Vendor ID', 'Name', 'Created At', 'Updated At'])
            for vendor in Vendor.query.all():
                writer.writerow([vendor.id, vendor.name, vendor.created_at, vendor.updated_at])
            
            output.seek(0)
            return send_file(
                io.BytesIO(output.getvalue().encode('utf-8')),
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'versionintel_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            )
        
        else:
            return jsonify({'error': 'Unsupported format'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/import', methods=['POST'])
@require_admin
def import_data():
    """Import data from JSON"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        imported = {'vendors': 0, 'products': 0, 'methods': 0, 'guides': 0}
        errors = []
        
        # Import vendors
        if 'vendors' in data:
            for vendor_data in data['vendors']:
                try:
                    existing = Vendor.query.filter_by(name=vendor_data['name']).first()
                    if not existing:
                        vendor = Vendor(name=vendor_data['name'])
                        db.session.add(vendor)
                        imported['vendors'] += 1
                except Exception as e:
                    errors.append(f"Vendor {vendor_data.get('name', 'Unknown')}: {str(e)}")
        
        # Import products
        if 'products' in data:
            for product_data in data['products']:
                try:
                    existing = Product.query.filter_by(name=product_data['name']).first()
                    if not existing:
                        product = Product(
                            name=product_data['name'],
                            vendor_id=product_data['vendor_id'],
                            category=product_data.get('category'),
                            description=product_data.get('description')
                        )
                        db.session.add(product)
                        imported['products'] += 1
                except Exception as e:
                    errors.append(f"Product {product_data.get('name', 'Unknown')}: {str(e)}")
        
        # Import methods
        if 'methods' in data:
            for method_data in data['methods']:
                try:
                    method = DetectionMethod(**method_data)
                    db.session.add(method)
                    imported['methods'] += 1
                except Exception as e:
                    errors.append(f"Method {method_data.get('id', 'Unknown')}: {str(e)}")
        
        # Import guides
        if 'guides' in data:
            for guide_data in data['guides']:
                try:
                    guide = SetupGuide(**guide_data)
                    db.session.add(guide)
                    imported['guides'] += 1
                except Exception as e:
                    errors.append(f"Guide {guide_data.get('id', 'Unknown')}: {str(e)}")
        
        db.session.commit()
        
        return jsonify({
            'message': 'Import completed',
            'imported': imported,
            'errors': errors
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/backup', methods=['GET'])
@require_admin
def create_backup():
    """Create a complete backup of all data"""
    try:
        backup_data = {
            'metadata': {
                'created_at': datetime.utcnow().isoformat(),
                'version': '1.0.0',
                'description': 'VersionIntel complete backup'
            },
            'data': {
                'vendors': [vendor.to_dict() for vendor in Vendor.query.all()],
                'products': [product.to_dict() for product in Product.query.all()],
                'methods': [method.to_dict() for method in DetectionMethod.query.all()],
                'guides': [guide.to_dict() for guide in SetupGuide.query.all()]
            }
        }
        
        return jsonify(backup_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/restore', methods=['POST'])
@require_admin
def restore_backup():
    """Restore data from backup"""
    try:
        backup_data = request.json
        if not backup_data or 'data' not in backup_data:
            return jsonify({'error': 'Invalid backup data'}), 400
        
        # Clear existing data
        DetectionMethod.query.delete()
        SetupGuide.query.delete()
        Product.query.delete()
        Vendor.query.delete()
        
        data = backup_data['data']
        restored = {'vendors': 0, 'products': 0, 'methods': 0, 'guides': 0}
        
        # Restore vendors
        for vendor_data in data.get('vendors', []):
            vendor = Vendor(name=vendor_data['name'])
            db.session.add(vendor)
            restored['vendors'] += 1
        
        # Restore products
        for product_data in data.get('products', []):
            product = Product(
                name=product_data['name'],
                vendor_id=product_data['vendor_id'],
                category=product_data.get('category'),
                description=product_data.get('description')
            )
            db.session.add(product)
            restored['products'] += 1
        
        # Restore methods
        for method_data in data.get('methods', []):
            method = DetectionMethod(**method_data)
            db.session.add(method)
            restored['methods'] += 1
        
        # Restore guides
        for guide_data in data.get('guides', []):
            guide = SetupGuide(**guide_data)
            db.session.add(guide)
            restored['guides'] += 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Restore completed',
            'restored': restored
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 

def isoformat_z(dt):
    if not dt:
        return ""
    if isinstance(dt, str):
        return dt
    try:
        return dt.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
    except Exception:
        return str(dt)

def clean_method(method):
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
    products = Product.query.filter_by(vendor_id=vendor.id).all()
    return OrderedDict([
        ('name', str(vendor.name) if vendor.name else ""),
        ('created_at', isoformat_z(getattr(vendor, 'created_at', None))),
        ('updated_at', isoformat_z(getattr(vendor, 'updated_at', None))),
        ('products', [clean_product(p) for p in products])
    ])

def safe_json_dumps(obj):
    def fallback(o):
        return str(o)
    return json.dumps(obj, ensure_ascii=False, default=fallback)

@bp.route('/export-all', methods=['GET'])
@require_admin
def export_all():
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
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404
    export_data = OrderedDict([
        ('exported_at', isoformat_z(datetime.utcnow())),
        ('vendor', clean_vendor(vendor))
    ])
    json_str = json.dumps(export_data, ensure_ascii=False)
    return Response(json_str, mimetype='application/json')

@bp.route('/export-all-complete', methods=['GET'])
@require_admin
def export_all_complete():
    """Export all data in a complete format with full relationships"""
    try:
        format_type = request.args.get('format', 'json')
        
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
        
        if format_type == 'json':
            return jsonify(export_data), 200
        elif format_type == 'csv':
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write summary
            writer.writerow(['Export Summary'])
            writer.writerow(['Total Vendors', export_data['summary']['total_vendors']])
            writer.writerow(['Total Products', export_data['summary']['total_products']])
            writer.writerow(['Total Methods', export_data['summary']['total_methods']])
            writer.writerow(['Total Guides', export_data['summary']['total_guides']])
            writer.writerow([])
            
            # Write detailed data
            writer.writerow(['Vendor', 'Product', 'Category', 'Description', 'Detection Methods', 'Setup Guides'])
            
            for vendor in complete_data:
                for product in vendor['products']:
                    method_names = ', '.join([m.get('name', '') for m in product['detection_methods']])
                    guide_titles = ', '.join([g.get('title', '') for g in product['setup_guides']])
                    
                    writer.writerow([
                        vendor['name'],
                        product['name'],
                        product.get('category', ''),
                        product.get('description', ''),
                        method_names,
                        guide_titles
                    ])
            
            output.seek(0)
            return send_file(
                io.BytesIO(output.getvalue().encode('utf-8')),
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'versionintel_complete_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            )
        elif format_type == 'docx':
            try:
                # Create DOCX with complete data
                doc = Document()
                
                # Add title
                title = doc.add_heading('VersionIntel Complete Export', 0)
                title.alignment = 1  # Center alignment
                
                # Add export timestamp
                timestamp_para = doc.add_paragraph(f'Exported on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
                timestamp_para.alignment = 1  # Center alignment
                doc.add_paragraph()
                
                # Add summary section
                doc.add_heading('Export Summary', level=1)
                summary_table = doc.add_table(rows=1, cols=2)
                summary_table.style = 'Table Grid'
                hdr_cells = summary_table.rows[0].cells
                hdr_cells[0].text = 'Metric'
                hdr_cells[1].text = 'Count'
                
                # Style the header row
                for cell in hdr_cells:
                    cell.paragraphs[0].runs[0].bold = True
                
                for key, value in export_data['summary'].items():
                    row_cells = summary_table.add_row().cells
                    row_cells[0].text = key.replace('_', ' ').title()
                    row_cells[1].text = str(value)
                
                doc.add_paragraph()
                
                # Add vendor data
                for vendor in complete_data:
                    vendor_heading = doc.add_heading(f'Vendor: {vendor["name"]}', level=1)
                    
                    if vendor['products']:
                        for product in vendor['products']:
                            product_heading = doc.add_heading(f'Product: {product["name"]}', level=2)
                            
                            # Product details in a table
                            product_table = doc.add_table(rows=0, cols=2)
                            product_table.style = 'Table Grid'
                            
                            # Add category
                            if product.get('category'):
                                row = product_table.add_row().cells
                                row[0].text = 'Category'
                                row[1].text = product['category']
                            
                            # Add description
                            if product.get('description'):
                                row = product_table.add_row().cells
                                row[0].text = 'Description'
                                row[1].text = product['description']
                            
                            doc.add_paragraph()
                            
                            # Detection methods
                            if product['detection_methods']:
                                doc.add_heading('Detection Methods', level=3)
                                method_table = doc.add_table(rows=1, cols=2)
                                method_table.style = 'Table Grid'
                                method_hdr = method_table.rows[0].cells
                                method_hdr[0].text = 'Method Name'
                                method_hdr[1].text = 'Technique'
                                
                                for method in product['detection_methods']:
                                    method_row = method_table.add_row().cells
                                    method_row[0].text = method.get('name', 'N/A')
                                    method_row[1].text = method.get('technique', 'N/A')
                                
                                doc.add_paragraph()
                            
                            # Setup guides
                            if product['setup_guides']:
                                doc.add_heading('Setup Guides', level=3)
                                guide_table = doc.add_table(rows=1, cols=2)
                                guide_table.style = 'Table Grid'
                                guide_hdr = guide_table.rows[0].cells
                                guide_hdr[0].text = 'Title'
                                guide_hdr[1].text = 'Content'
                                
                                for guide in product['setup_guides']:
                                    guide_row = guide_table.add_row().cells
                                    guide_row[0].text = guide.get('title', 'Untitled')
                                    guide_row[1].text = guide.get('content', 'No content available')
                                
                                doc.add_paragraph()
                            
                            doc.add_paragraph()
                    else:
                        doc.add_paragraph('No products found for this vendor.')
                        doc.add_paragraph()
                
                # Save to BytesIO instead of temporary file
                docx_buffer = io.BytesIO()
                doc.save(docx_buffer)
                docx_buffer.seek(0)
                
                return send_file(
                    docx_buffer,
                    mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    as_attachment=True,
                    download_name=f'versionintel_complete_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.docx'
                )
                
            except Exception as docx_error:
                return jsonify({'error': f'DOCX generation failed: {str(docx_error)}'}), 500
            
        else:
            return jsonify({'error': 'Unsupported format'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500 

@bp.route('/export-product/<int:product_id>', methods=['GET'])
@require_admin
def export_product_data(product_id):
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