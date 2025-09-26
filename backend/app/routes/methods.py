from flask import Blueprint, request, jsonify
from app.models.detection_method import DetectionMethod
from app.models.product import Product
from app.services.rbac import get_current_user
from app import db
from flask_jwt_extended import jwt_required

bp = Blueprint('methods', __name__, url_prefix='/methods')

@bp.route('', methods=['POST'])
@jwt_required()
def add_method():
    try:
        # Get current user
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.json
        if not data or 'product_id' not in data or 'name' not in data or 'technique' not in data:
            return jsonify({'error': 'product_id, name, and technique are required'}), 400
        
        # Check if product exists
        product = Product.query.get(data['product_id'])
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        method = DetectionMethod(
            product_id=data['product_id'],
            name=data['name'],
            technique=data['technique'],
            regex_python=data.get('regex_python'),
            regex_ruby=data.get('regex_ruby'),
            curl_command=data.get('curl_command'),
            expected_response=data.get('expected_response'),
            requires_auth=data.get('requires_auth', False),
            created_by=current_user.id  # Set the creator
        )
        db.session.add(method)
        db.session.commit()
        return jsonify(method.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding method: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['GET'])
def list_methods():
    try:
        product_id = request.args.get('product_id')
        requires_auth = request.args.get('requires_auth')
        
        query = DetectionMethod.query
        
        if product_id:
            query = query.filter_by(product_id=product_id)
        if requires_auth is not None:
            requires_auth_bool = requires_auth.lower() == 'true'
            query = query.filter_by(requires_auth=requires_auth_bool)
        
        methods = query.all()
        method_list = []
        for method in methods:
            try:
                method_list.append(method.to_dict())
            except Exception as e:
                print(f"Error serializing method {method.id}: {str(e)}")
                # Skip problematic methods instead of failing completely
                continue
        return jsonify(method_list)
    except Exception as e:
        print(f"Error listing methods: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<method_id>', methods=['GET'])
def get_method(method_id):
    try:
        method = DetectionMethod.query.get(method_id)
        if not method:
            return jsonify({'error': 'Detection method not found'}), 404
        return jsonify(method.to_dict())
    except Exception as e:
        print(f"Error getting method {method_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<method_id>', methods=['PUT'])
def update_method(method_id):
    try:
        method = DetectionMethod.query.get(method_id)
        if not method:
            return jsonify({'error': 'Detection method not found'}), 404
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update fields
        if 'name' in data:
            method.name = data['name']
        if 'technique' in data:
            method.technique = data['technique']
        if 'regex_python' in data:
            method.regex_python = data['regex_python']
        if 'regex_ruby' in data:
            method.regex_ruby = data['regex_ruby']
        if 'curl_command' in data:
            method.curl_command = data['curl_command']
        if 'expected_response' in data:
            method.expected_response = data['expected_response']
        if 'requires_auth' in data:
            method.requires_auth = data['requires_auth']
        
        db.session.commit()
        return jsonify(method.to_dict())
    except Exception as e:
        db.session.rollback()
        print(f"Error updating method {method_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<method_id>', methods=['DELETE'])
def delete_method(method_id):
    try:
        method = DetectionMethod.query.get(method_id)
        if not method:
            return jsonify({'error': 'Detection method not found'}), 404
        
        db.session.delete(method)
        db.session.commit()
        return jsonify({'message': 'Detection method deleted successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting method {method_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500
