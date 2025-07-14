from flask import Blueprint, request, jsonify
from app.models.product import Product
from app.models.vendor import Vendor
from app import db

bp = Blueprint('products', __name__, url_prefix='/products')

@bp.route('', methods=['POST'])
def add_product():
    try:
        data = request.json
        if not data or 'name' not in data or 'vendor_id' not in data:
            return jsonify({'error': 'Name and vendor_id are required'}), 400
        
        # Check if vendor exists
        vendor = Vendor.query.get(data['vendor_id'])
        if not vendor:
            return jsonify({'error': 'Vendor not found'}), 404
        
        product = Product(
            name=data['name'],
            category=data.get('category'),
            description=data.get('description'),
            vendor_id=data['vendor_id']
        )
        db.session.add(product)
        db.session.commit()
        return jsonify(product.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding product: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['GET'])
def list_products():
    try:
        vendor_id = request.args.get('vendor_id')
        
        query = Product.query
        
        if vendor_id:
            query = query.filter_by(vendor_id=vendor_id)
        
        products = query.all()
        product_list = []
        for product in products:
            try:
                product_list.append(product.to_dict())
            except Exception as e:
                print(f"Error serializing product {product.id}: {str(e)}")
                # Skip problematic products instead of failing completely
                continue
        return jsonify(product_list)
    except Exception as e:
        print(f"Error listing products: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify(product.to_dict())
    except Exception as e:
        print(f"Error getting product {product_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'name' in data:
            product.name = data['name']
        if 'category' in data:
            product.category = data['category']
        if 'description' in data:
            product.description = data['description']
        if 'vendor_id' in data:
            # Check if vendor exists
            vendor = Vendor.query.get(data['vendor_id'])
            if not vendor:
                return jsonify({'error': 'Vendor not found'}), 404
            product.vendor_id = data['vendor_id']
        
        db.session.commit()
        return jsonify(product.to_dict())
    except Exception as e:
        db.session.rollback()
        print(f"Error updating product {product_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting product {product_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500
