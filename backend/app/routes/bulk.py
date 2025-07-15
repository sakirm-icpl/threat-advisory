from flask import Blueprint, request, jsonify, send_file, make_response
from app.models.vendor import Vendor
from app.models.product import Product
from app.models.detection_method import DetectionMethod
from app.models.setup_guide import SetupGuide
from app.services.auth import require_admin
from app import db
import json
import csv
import io
from datetime import datetime
import tempfile
import io
from docx import Document
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os
from sqlalchemy import func, and_, or_
from collections import defaultdict

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

@bp.route('/export-all', methods=['GET'])
@require_admin
def export_all():
    """Export all data with vendors, their products, and related info in various formats"""
    try:
        format_type = request.args.get('format', 'json')  # json, csv, docx, pdf
        vendors = Vendor.query.all()
        data = []
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
            data.append(vendor_dict)

        if format_type == 'json':
            return jsonify({'vendors': data, 'exported_at': datetime.utcnow().isoformat()}), 200
        elif format_type == 'csv':
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(['Vendor', 'Product', 'Product Category', 'Product Description', 'Detection Method', 'Setup Guide'])
            for vendor in data:
                for product in vendor['products']:
                    method_names = ', '.join([m.get('method_type', '') for m in product['detection_methods']])
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
                download_name=f'versionintel_export_all_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            )
        elif format_type == 'docx':
            # DOCX export with structured format
            doc = Document()
            doc.add_heading('VersionIntel Export', 0)
            
            vendor_count = 0
            for vendor in data:
                vendor_count += 1
                doc.add_heading(f'{vendor_count}: {vendor["name"]}', level=1)
                
                if vendor['products']:
                    product_count = 0
                    for product in vendor['products']:
                        product_count += 1
                        doc.add_heading(f'{vendor_count}.{product_count} {product["name"]}', level=2)
                        
                        # Create table for product details
                        table = doc.add_table(rows=1, cols=7)
                        table.style = 'Table Grid'
                        hdr_cells = table.rows[0].cells
                        hdr_cells[0].text = 'Product Name'
                        hdr_cells[1].text = 'Technique'
                        hdr_cells[2].text = 'Python Regex'
                        hdr_cells[3].text = 'Ruby Regex'
                        hdr_cells[4].text = 'Curl Command'
                        hdr_cells[5].text = 'Expected Response'
                        hdr_cells[6].text = 'Auth Setup Guide'
                        
                        # Add product data row
                        row_cells = table.add_row().cells
                        row_cells[0].text = product.get('name', '')
                        row_cells[1].text = product.get('technique', '')
                        
                        # Get detection methods for this product
                        if product['detection_methods']:
                            python_regex = []
                            ruby_regex = []
                            curl_commands = []
                            expected_responses = []
                            
                            for method in product['detection_methods']:
                                if method.get('regex_python'):
                                    python_regex.append(method['regex_python'])
                                if method.get('regex_ruby'):
                                    ruby_regex.append(method['regex_ruby'])
                                if method.get('curl_command'):
                                    curl_commands.append(method['curl_command'])
                                if method.get('expected_response'):
                                    expected_responses.append(method['expected_response'])
                            
                            row_cells[2].text = '\n'.join(python_regex) if python_regex else ''
                            row_cells[3].text = '\n'.join(ruby_regex) if ruby_regex else ''
                            row_cells[4].text = '\n'.join(curl_commands) if curl_commands else ''
                            row_cells[5].text = '\n'.join(expected_responses) if expected_responses else ''
                        else:
                            row_cells[2].text = ''
                            row_cells[3].text = ''
                            row_cells[4].text = ''
                            row_cells[5].text = ''
                        
                        # Get setup guides for this product
                        if product['setup_guides']:
                            setup_guides = []
                            for guide in product['setup_guides']:
                                if guide.get('content'):
                                    setup_guides.append(guide['content'])
                            row_cells[6].text = '\n'.join(setup_guides) if setup_guides else ''
                        else:
                            row_cells[6].text = ''
                        
                        doc.add_paragraph()  # Add spacing
                else:
                    doc.add_paragraph('No products found for this vendor.')
                    doc.add_paragraph()
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as tmp_file:
                doc.save(tmp_file.name)
                with open(tmp_file.name, 'rb') as f:
                    content = f.read()
                os.unlink(tmp_file.name)
            
            response = make_response(content)
            response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            response.headers['Content-Disposition'] = 'attachment; filename=versionintel_export.docx'
            return response
            
        elif format_type == 'pdf':
            # PDF export with structured format
            buffer = io.BytesIO()
            c = canvas.Canvas(buffer, pagesize=letter)
            width, height = letter
            
            # Title
            c.setFont("Helvetica-Bold", 16)
            c.drawString(50, height - 50, "VersionIntel Export")
            
            y_position = height - 80
            vendor_count = 0
            
            for vendor in data:
                vendor_count += 1
                
                # Vendor heading
                c.setFont("Helvetica-Bold", 14)
                vendor_text = f"{vendor_count}: {vendor['name']}"
                c.drawString(50, y_position, vendor_text)
                y_position -= 25
                
                if vendor['products']:
                    product_count = 0
                    for product in vendor['products']:
                        product_count += 1
                        
                        # Product subheading
                        c.setFont("Helvetica-Bold", 12)
                        product_text = f"{vendor_count}.{product_count} {product['name']}"
                        c.drawString(70, y_position, product_text)
                        y_position -= 20
                        
                        # Table headers
                        c.setFont("Helvetica-Bold", 8)
                        headers = ['Product Name', 'Technique', 'Python Regex', 'Ruby Regex', 'Curl Command', 'Expected Response', 'Auth Setup Guide']
                        col_width = (width - 100) / 7
                        
                        for i, header in enumerate(headers):
                            x = 50 + (i * col_width)
                            c.drawString(x, y_position, header)
                        y_position -= 15
                        
                        # Product data row
                        c.setFont("Helvetica", 7)
                        row_data = [
                            product.get('name', ''),
                            product.get('technique', ''),
                            '', '', '', '', ''  # Placeholders for detection methods and setup guides
                        ]
                        
                        # Get detection methods data
                        if product['detection_methods']:
                            python_regex = []
                            ruby_regex = []
                            curl_commands = []
                            expected_responses = []
                            
                            for method in product['detection_methods']:
                                if method.get('regex_python'):
                                    python_regex.append(method['regex_python'])
                                if method.get('regex_ruby'):
                                    ruby_regex.append(method['regex_ruby'])
                                if method.get('curl_command'):
                                    curl_commands.append(method['curl_command'])
                                if method.get('expected_response'):
                                    expected_responses.append(method['expected_response'])
                            
                            row_data[2] = '\n'.join(python_regex) if python_regex else ''
                            row_data[3] = '\n'.join(ruby_regex) if ruby_regex else ''
                            row_data[4] = '\n'.join(curl_commands) if curl_commands else ''
                            row_data[5] = '\n'.join(expected_responses) if expected_responses else ''
                        
                        # Get setup guides data
                        if product['setup_guides']:
                            setup_guides = []
                            for guide in product['setup_guides']:
                                if guide.get('content'):
                                    setup_guides.append(guide['content'])
                            row_data[6] = '\n'.join(setup_guides) if setup_guides else ''
                        
                        # Draw table data
                        for i, cell_data in enumerate(row_data):
                            x = 50 + (i * col_width)
                            # Wrap text if too long
                            lines = [cell_data[j:j+30] for j in range(0, len(cell_data), 30)]
                            for line in lines[:3]:  # Limit to 3 lines per cell
                                if y_position < 50:  # New page if needed
                                    c.showPage()
                                    y_position = height - 50
                                c.drawString(x, y_position, line)
                                y_position -= 10
                            y_position += 10 * len(lines[:3])
                        
                        y_position -= 20
                        
                        # Check if we need a new page
                        if y_position < 100:
                            c.showPage()
                            y_position = height - 50
                else:
                    c.setFont("Helvetica", 10)
                    c.drawString(70, y_position, "No products found for this vendor.")
                    y_position -= 20
                
                y_position -= 20  # Extra spacing between vendors
                
                # Check if we need a new page
                if y_position < 100:
                    c.showPage()
                    y_position = height - 50
            
            c.save()
            buffer.seek(0)
            content = buffer.getvalue()
            buffer.close()
            
            response = make_response(content)
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'attachment; filename=versionintel_export.pdf'
            return response
        else:
            return jsonify({'error': 'Unsupported format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500 

@bp.route('/export-vendor/<int:vendor_id>', methods=['GET'])
@require_admin
def export_vendor_data(vendor_id):
    """Export specific vendor with all their products, methods, and guides"""
    try:
        format_type = request.args.get('format', 'json')
        vendor = Vendor.query.get(vendor_id)
        
        if not vendor:
            return jsonify({'error': 'Vendor not found'}), 404
        
        # Get all products for this vendor
        products = Product.query.filter_by(vendor_id=vendor_id).all()
        
        # Build the export data
        vendor_data = vendor.to_dict()
        vendor_data['products'] = []
        
        for product in products:
            product_dict = product.to_dict()
            
            # Add detection methods for this product
            methods = DetectionMethod.query.filter_by(product_id=product.id).all()
            product_dict['detection_methods'] = [m.to_dict() for m in methods]
            
            # Add setup guides for this product
            guides = SetupGuide.query.filter_by(product_id=product.id).all()
            product_dict['setup_guides'] = [g.to_dict() for g in guides]
            
            vendor_data['products'].append(product_dict)
        
        export_data = {
            'vendor': vendor_data,
            'exported_at': datetime.utcnow().isoformat(),
            'total_products': len(products),
            'total_methods': sum(len(p['detection_methods']) for p in vendor_data['products']),
            'total_guides': sum(len(p['setup_guides']) for p in vendor_data['products'])
        }
        
        if format_type == 'json':
            return jsonify(export_data), 200
        elif format_type == 'csv':
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write vendor info
            writer.writerow(['Vendor Information'])
            writer.writerow(['Name', vendor.name])
            writer.writerow(['ID', vendor.id])
            writer.writerow(['Created At', vendor.created_at])
            writer.writerow([])
            
            # Write products and their details
            writer.writerow(['Product Information'])
            writer.writerow(['Product Name', 'Category', 'Description', 'Detection Methods', 'Setup Guides'])
            
            for product in vendor_data['products']:
                method_names = ', '.join([m.get('name', '') for m in product['detection_methods']])
                guide_titles = ', '.join([g.get('title', '') for g in product['setup_guides']])
                
                writer.writerow([
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
                download_name=f'versionintel_vendor_{vendor.name}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            )
        elif format_type == 'docx':
            try:
                # Create DOCX with vendor data
                doc = Document()
                
                # Add title
                title = doc.add_heading(f'VersionIntel Export - {vendor.name}', 0)
                title.alignment = 1  # Center alignment
                
                # Add export timestamp
                timestamp_para = doc.add_paragraph(f'Exported on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
                timestamp_para.alignment = 1  # Center alignment
                doc.add_paragraph()
                
                # Add vendor information
                doc.add_heading('Vendor Information', level=1)
                vendor_table = doc.add_table(rows=0, cols=2)
                vendor_table.style = 'Table Grid'
                
                row = vendor_table.add_row().cells
                row[0].text = 'Name'
                row[1].text = vendor.name
                
                row = vendor_table.add_row().cells
                row[0].text = 'ID'
                row[1].text = str(vendor.id)
                
                row = vendor_table.add_row().cells
                row[0].text = 'Created At'
                row[1].text = str(vendor.created_at)
                
                doc.add_paragraph()
                
                # Add summary
                doc.add_heading('Export Summary', level=1)
                summary_table = doc.add_table(rows=1, cols=2)
                summary_table.style = 'Table Grid'
                hdr_cells = summary_table.rows[0].cells
                hdr_cells[0].text = 'Metric'
                hdr_cells[1].text = 'Count'
                
                # Style the header row
                for cell in hdr_cells:
                    cell.paragraphs[0].runs[0].bold = True
                
                summary_data = [
                    ('Total Products', export_data['total_products']),
                    ('Total Methods', export_data['total_methods']),
                    ('Total Guides', export_data['total_guides'])
                ]
                
                for key, value in summary_data:
                    row_cells = summary_table.add_row().cells
                    row_cells[0].text = key
                    row_cells[1].text = str(value)
                
                doc.add_paragraph()
                
                # Add products data
                if vendor_data['products']:
                    doc.add_heading('Products', level=1)
                    
                    for product in vendor_data['products']:
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
                
                # Save to BytesIO instead of temporary file
                docx_buffer = io.BytesIO()
                doc.save(docx_buffer)
                docx_buffer.seek(0)
                
                return send_file(
                    docx_buffer,
                    mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    as_attachment=True,
                    download_name=f'versionintel_vendor_{vendor.name}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.docx'
                )
                
            except Exception as docx_error:
                return jsonify({'error': f'DOCX generation failed: {str(docx_error)}'}), 500
        else:
            return jsonify({'error': 'Unsupported format'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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