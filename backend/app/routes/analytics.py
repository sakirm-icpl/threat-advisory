from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.notification import Notification
from app.models.contribution import Contribution, ContributorProfile
from app.models.product import Product
from app.models.vendor import Vendor
from app.models.detection_method import DetectionMethod
from app import db
from sqlalchemy import func, desc
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get user notifications"""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        unread_only = request.args.get('unread_only', False, type=bool)
        
        query = Notification.query.filter_by(user_id=user_id)
        
        if unread_only:
            query = query.filter_by(is_read=False)
        
        notifications = query.order_by(desc(Notification.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        unread_count = Notification.query.filter_by(
            user_id=user_id, is_read=False
        ).count()
        
        return jsonify({
            'notifications': [n.to_dict() for n in notifications.items],
            'total': notifications.total,
            'pages': notifications.pages,
            'current_page': page,
            'per_page': per_page,
            'unread_count': unread_count
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting notifications: {e}")
        return jsonify({'error': 'Failed to get notifications'}), 500

@analytics_bp.route('/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark notification as read"""
    try:
        user_id = get_jwt_identity()
        notification = Notification.query.filter_by(
            id=notification_id, user_id=user_id
        ).first()
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Notification marked as read'})
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error marking notification as read: {e}")
        return jsonify({'error': 'Failed to mark notification as read'}), 500

@analytics_bp.route('/notifications/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    """Mark all notifications as read"""
    try:
        user_id = get_jwt_identity()
        Notification.query.filter_by(user_id=user_id, is_read=False).update({
            'is_read': True,
            'read_at': datetime.utcnow()
        })
        db.session.commit()
        
        return jsonify({'message': 'All notifications marked as read'})
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error marking all notifications as read: {e}")
        return jsonify({'error': 'Failed to mark notifications as read'}), 500

@analytics_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Get platform analytics"""
    try:
        # Get date range
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Basic statistics
        total_users = User.query.count()
        total_contributions = Contribution.query.count()
        total_products = Product.query.count()
        total_vendors = Vendor.query.count()
        total_detection_methods = DetectionMethod.query.count()
        
        # Recent activity
        recent_contributions = Contribution.query.filter(
            Contribution.created_at >= start_date
        ).count()
        
        recent_users = User.query.filter(
            User.created_at >= start_date
        ).count()
        
        # Top contributors
        top_contributors = db.session.query(
            ContributorProfile.github_username,
            ContributorProfile.github_avatar_url,
            ContributorProfile.reputation_score,
            ContributorProfile.total_contributions
        ).order_by(desc(ContributorProfile.reputation_score)).limit(10).all()
        
        # Contribution types breakdown
        contribution_types = db.session.query(
            Contribution.type,
            func.count(Contribution.id).label('count')
        ).group_by(Contribution.type).all()
        
        # Daily activity for the chart
        daily_activity = []
        for i in range(days):
            date = datetime.utcnow() - timedelta(days=i)
            day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            contributions = Contribution.query.filter(
                Contribution.created_at >= day_start,
                Contribution.created_at < day_end
            ).count()
            
            users = User.query.filter(
                User.created_at >= day_start,
                User.created_at < day_end
            ).count()
            
            daily_activity.append({
                'date': day_start.strftime('%Y-%m-%d'),
                'contributions': contributions,
                'new_users': users
            })
        
        daily_activity.reverse()  # Oldest first
        
        return jsonify({
            'overview': {
                'total_users': total_users,
                'total_contributions': total_contributions,
                'total_products': total_products,
                'total_vendors': total_vendors,
                'total_detection_methods': total_detection_methods,
                'recent_contributions': recent_contributions,
                'recent_users': recent_users
            },
            'top_contributors': [
                {
                    'username': contrib[0],
                    'avatar_url': contrib[1],
                    'reputation_score': contrib[2],
                    'total_contributions': contrib[3]
                }
                for contrib in top_contributors
            ],
            'contribution_types': [
                {
                    'type': contrib_type[0].value if contrib_type[0] else 'unknown',
                    'count': contrib_type[1]
                }
                for contrib_type in contribution_types
            ],
            'daily_activity': daily_activity,
            'date_range': {
                'start': start_date.strftime('%Y-%m-%d'),
                'end': datetime.utcnow().strftime('%Y-%m-%d'),
                'days': days
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting analytics: {e}")
        return jsonify({'error': 'Failed to get analytics'}), 500

@analytics_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get live community statistics"""
    try:
        # Get real-time statistics
        stats = {
            'totals': {
                'users': User.query.count(),
                'contributors': ContributorProfile.query.count(),
                'contributions': Contribution.query.count(),
                'approved_contributions': Contribution.query.filter_by(status='approved').count(),
                'pending_contributions': Contribution.query.filter_by(status='pending').count(),
                'products': Product.query.count(),
                'vendors': Vendor.query.count(),
                'detection_methods': DetectionMethod.query.count()
            },
            'recent_activity': {
                'last_24h': {
                    'contributions': Contribution.query.filter(
                        Contribution.created_at >= datetime.utcnow() - timedelta(hours=24)
                    ).count(),
                    'new_users': User.query.filter(
                        User.created_at >= datetime.utcnow() - timedelta(hours=24)
                    ).count()
                },
                'last_7d': {
                    'contributions': Contribution.query.filter(
                        Contribution.created_at >= datetime.utcnow() - timedelta(days=7)
                    ).count(),
                    'new_users': User.query.filter(
                        User.created_at >= datetime.utcnow() - timedelta(days=7)
                    ).count()
                }
            },
            'contribution_stats': {
                'patterns': Contribution.query.filter_by(type='detection_pattern').count(),
                'documentation': Contribution.query.filter_by(type='documentation').count(),
                'bug_reports': Contribution.query.filter_by(type='bug_report').count(),
                'integrations': Contribution.query.filter_by(type='integration').count()
            }
        }
        
        # Get top product categories
        product_categories = db.session.query(
            Product.category,
            func.count(Product.id).label('count')
        ).filter(Product.category.isnot(None)).group_by(Product.category).order_by(desc('count')).limit(10).all()
        
        stats['top_categories'] = [
            {'category': cat[0], 'count': cat[1]}
            for cat in product_categories
        ]
        
        return jsonify(stats)
        
    except Exception as e:
        current_app.logger.error(f"Error getting stats: {e}")
        return jsonify({'error': 'Failed to get stats'}), 500

@analytics_bp.route('/api', methods=['GET'])
def api_documentation():
    """API documentation endpoint"""
    try:
        api_docs = {
            'title': 'VersionIntel API Documentation',
            'version': '1.0.0',
            'base_url': request.host_url.rstrip('/'),
            'authentication': {
                'type': 'JWT Bearer Token',
                'description': 'Include Authorization header: Bearer <token>',
                'login_endpoint': '/auth/login'
            },
            'endpoints': [
                {
                    'category': 'Authentication',
                    'endpoints': [
                        {
                            'method': 'POST',
                            'path': '/auth/login',
                            'description': 'Login with username/password',
                            'auth_required': False
                        },
                        {
                            'method': 'GET',
                            'path': '/auth/github/login',
                            'description': 'Initiate GitHub OAuth login',
                            'auth_required': False
                        }
                    ]
                },
                {
                    'category': 'Search',
                    'endpoints': [
                        {
                            'method': 'GET',
                            'path': '/search',
                            'description': 'Search detection patterns and products',
                            'auth_required': False,
                            'parameters': [
                                {'name': 'q', 'type': 'string', 'description': 'Search query'},
                                {'name': 'category', 'type': 'string', 'description': 'Filter by category'},
                                {'name': 'page', 'type': 'integer', 'description': 'Page number'}
                            ]
                        },
                        {
                            'method': 'GET',
                            'path': '/cve-search',
                            'description': 'Search CVE information',
                            'auth_required': False
                        }
                    ]
                },
                {
                    'category': 'Patterns',
                    'endpoints': [
                        {
                            'method': 'GET',
                            'path': '/methods',
                            'description': 'Get detection methods',
                            'auth_required': False
                        },
                        {
                            'method': 'POST',
                            'path': '/submit/pattern',
                            'description': 'Submit new detection pattern',
                            'auth_required': True
                        }
                    ]
                },
                {
                    'category': 'Community',
                    'endpoints': [
                        {
                            'method': 'GET',
                            'path': '/community/contributions',
                            'description': 'Get community contributions',
                            'auth_required': False
                        },
                        {
                            'method': 'GET',
                            'path': '/community/contributors',
                            'description': 'Get contributor list',
                            'auth_required': False
                        }
                    ]
                }
            ]
        }
        
        return jsonify(api_docs)
        
    except Exception as e:
        current_app.logger.error(f"Error getting API docs: {e}")
        return jsonify({'error': 'Failed to get API documentation'}), 500