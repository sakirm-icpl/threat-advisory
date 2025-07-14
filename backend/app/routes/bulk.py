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

bp = Blueprint('bulk', __name__, url_prefix='/bulk')

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