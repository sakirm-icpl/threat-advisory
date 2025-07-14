from flask import Blueprint, jsonify
from app.models.vendor import Vendor
from app.models.product import Product
from app.models.detection_method import DetectionMethod
from app.models.setup_guide import SetupGuide
from app.models.user import User
from app import db
from sqlalchemy import desc

bp = Blueprint('dashboard', __name__)

@bp.route('/dashboard/summary', methods=['GET'])
def dashboard_summary():
    try:
        return jsonify({
            'data': {
                'vendors': db.session.query(Vendor).count() or 0,
                'products': db.session.query(Product).count() or 0,
                'detection_methods': db.session.query(DetectionMethod).count() or 0,
                'setup_guides': db.session.query(SetupGuide).count() or 0,
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/dashboard/recent-activity', methods=['GET'])
def dashboard_recent_activity():
    try:
        # Gather recent activity from all models
        activities = []
        # Get recent users
        for user in User.query.order_by(desc(User.created_at)).limit(10):
            if user.created_at:  # Only include if created_at exists
                activities.append({
                    'type': 'User',
                    'name': user.username,
                    'created_at': user.created_at.isoformat()
                })
        # Get recent vendors
        for vendor in Vendor.query.order_by(desc(Vendor.created_at)).limit(10):
            if vendor.created_at:  # Only include if created_at exists
                activities.append({
                    'type': 'Vendor',
                    'name': vendor.name,
                    'created_at': vendor.created_at.isoformat()
                })
        # Get recent products
        for product in Product.query.order_by(desc(Product.created_at)).limit(10):
            if product.created_at:  # Only include if created_at exists
                activities.append({
                    'type': 'Product',
                    'name': product.name,
                    'created_at': product.created_at.isoformat()
                })
        # Get recent detection methods
        for method in DetectionMethod.query.order_by(desc(DetectionMethod.created_at)).limit(10):
            if method.created_at:  # Only include if created_at exists
                activities.append({
                    'type': 'Detection Method',
                    'name': method.name,
                    'created_at': method.created_at.isoformat()
                })
        # Get recent setup guides
        for guide in SetupGuide.query.order_by(desc(SetupGuide.created_at)).limit(10):
            if guide.created_at:  # Only include if created_at exists
                # Get product name for the guide
                product = Product.query.get(guide.product_id)
                product_name = product.name if product else f"Product {guide.product_id}"
                activities.append({
                    'type': 'Setup Guide',
                    'name': product_name,
                    'created_at': guide.created_at.isoformat()
                })
        # Sort all activities by created_at descending and return the top 10
        activities = sorted(activities, key=lambda x: x['created_at'], reverse=True)[:10]
        return jsonify({'activities': activities})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
