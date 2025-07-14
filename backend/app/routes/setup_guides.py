from flask import Blueprint, request, jsonify
from app.models.setup_guide import SetupGuide
from app.models.product import Product
from app import db

bp = Blueprint('setup_guides', __name__, url_prefix='/setup-guides')

@bp.route('', methods=['POST'])
def add_setup_guide():
    try:
        data = request.json
        if not data or 'product_id' not in data or 'instructions' not in data:
            return jsonify({'error': 'product_id and instructions are required'}), 400
        
        # Check if product exists
        product = Product.query.get(data['product_id'])
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        setup_guide = SetupGuide(
            product_id=data['product_id'],
            instructions=data['instructions']
        )
        db.session.add(setup_guide)
        db.session.commit()
        return jsonify(setup_guide.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding setup guide: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['GET'])
def list_setup_guides():
    try:
        product_id = request.args.get('product_id')
        
        query = SetupGuide.query
        
        if product_id:
            query = query.filter_by(product_id=product_id)
        
        setup_guides = query.all()
        guide_list = []
        for guide in setup_guides:
            try:
                guide_list.append(guide.to_dict())
            except Exception as e:
                print(f"Error serializing setup guide {guide.id}: {str(e)}")
                # Skip problematic guides instead of failing completely
                continue
        return jsonify(guide_list)
    except Exception as e:
        print(f"Error listing setup guides: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<guide_id>', methods=['GET'])
def get_setup_guide(guide_id):
    try:
        setup_guide = SetupGuide.query.get(guide_id)
        if not setup_guide:
            return jsonify({'error': 'Setup guide not found'}), 404
        return jsonify(setup_guide.to_dict())
    except Exception as e:
        print(f"Error getting setup guide {guide_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<guide_id>', methods=['PUT'])
def update_setup_guide(guide_id):
    try:
        setup_guide = SetupGuide.query.get(guide_id)
        if not setup_guide:
            return jsonify({'error': 'Setup guide not found'}), 404
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update fields
        if 'instructions' in data:
            setup_guide.instructions = data['instructions']
        
        db.session.commit()
        return jsonify(setup_guide.to_dict())
    except Exception as e:
        db.session.rollback()
        print(f"Error updating setup guide {guide_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<guide_id>', methods=['DELETE'])
def delete_setup_guide(guide_id):
    try:
        setup_guide = SetupGuide.query.get(guide_id)
        if not setup_guide:
            return jsonify({'error': 'Setup guide not found'}), 404
        
        db.session.delete(setup_guide)
        db.session.commit()
        return jsonify({'message': 'Setup guide deleted successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting setup guide {guide_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500 