from flask import Blueprint, request, jsonify
from flask import Blueprint, request, jsonify
from app.models.vendor import Vendor
from app.services.auth import require_permission, require_admin
from app import db

bp = Blueprint('vendors', __name__, url_prefix='/vendors')

@bp.route('', methods=['POST'])
@require_permission('write')
def add_vendor():
    try:
        data = request.json
        if not data or 'name' not in data:
            return jsonify({'error': 'Name is required'}), 400
        
        # Check if vendor already exists
        existing_vendor = Vendor.query.filter_by(name=data['name']).first()
        if existing_vendor:
            return jsonify({'error': 'Vendor with this name already exists'}), 409
        
        vendor = Vendor(name=data['name'])
        db.session.add(vendor)
        db.session.commit()
        return jsonify(vendor.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding vendor: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['GET'])
@require_permission('read')
def list_vendors():
    try:
        vendors = Vendor.query.all()
        vendor_list = []
        for vendor in vendors:
            try:
                vendor_list.append(vendor.to_dict())
            except Exception as e:
                print(f"Error serializing vendor {vendor.id}: {str(e)}")
                # Skip problematic vendors instead of failing completely
                continue
        return jsonify(vendor_list)
    except Exception as e:
        print(f"Error listing vendors: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<vendor_id>', methods=['GET'])
def get_vendor(vendor_id):
    try:
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            return jsonify({'error': 'Vendor not found'}), 404
        return jsonify(vendor.to_dict())
    except Exception as e:
        print(f"Error getting vendor {vendor_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<vendor_id>', methods=['PUT'])
@require_permission('write')
def update_vendor(vendor_id):
    try:
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            return jsonify({'error': 'Vendor not found'}), 404
        
        data = request.json
        if not data or 'name' not in data:
            return jsonify({'error': 'Name is required'}), 400
        
        # Check if name is already taken by another vendor
        existing_vendor = Vendor.query.filter_by(name=data['name']).first()
        if existing_vendor and existing_vendor.id != vendor_id:
            return jsonify({'error': 'Vendor with this name already exists'}), 409
        
        vendor.name = data['name']
        db.session.commit()
        return jsonify(vendor.to_dict())
    except Exception as e:
        db.session.rollback()
        print(f"Error updating vendor {vendor_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<vendor_id>', methods=['DELETE'])
def delete_vendor(vendor_id):
    try:
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            return jsonify({'error': 'Vendor not found'}), 404
        # Cascade delete: all related products, detection methods, and setup guides will be deleted
        db.session.delete(vendor)
        db.session.commit()
        return jsonify({'message': 'Vendor deleted successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting vendor {vendor_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500
