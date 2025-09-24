from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.contribution import Contribution, ContributionType, ContributionStatus
from app.models.product import Product
from app.models.vendor import Vendor
from app.models.detection_method import DetectionMethod
from app import db
import json
import re
from datetime import datetime

submission_bp = Blueprint('submission', __name__, url_prefix='/submit')

@submission_bp.route('/pattern', methods=['GET'])
def pattern_form():
    """Get data needed for pattern submission form"""
    try:
        vendors = Vendor.query.all()
        products = Product.query.all()
        
        return jsonify({
            'vendors': [v.to_dict() for v in vendors],
            'products': [p.to_dict() for p in products]
        })
    except Exception as e:
        current_app.logger.error(f"Error loading pattern form data: {e}")
        return jsonify({'error': 'Failed to load form data'}), 500

@submission_bp.route('/pattern', methods=['POST'])
@jwt_required()
def submit_pattern():
    """Submit a new detection pattern"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.json
        
        # Validate required fields
        required_fields = ['title', 'description', 'pattern_regex', 'sample_text', 'product_name', 'vendor_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate regex pattern
        try:
            re.compile(data['pattern_regex'])
        except re.error as e:
            return jsonify({'error': f'Invalid regex pattern: {str(e)}'}), 400
        
        # Test the pattern against sample text
        pattern_works = False
        try:
            match = re.search(data['pattern_regex'], data['sample_text'])
            pattern_works = match is not None
        except Exception as e:
            current_app.logger.warning(f"Pattern test failed: {e}")
        
        # Create contribution
        content_data = {
            'pattern_regex': data['pattern_regex'],
            'sample_text': data['sample_text'],
            'product_name': data['product_name'],
            'vendor_name': data['vendor_name'],
            'technique': data.get('technique', ''),
            'curl_command': data.get('curl_command', ''),
            'expected_response': data.get('expected_response', ''),
            'requires_auth': data.get('requires_auth', False),
            'pattern_works': pattern_works
        }
        
        contribution = Contribution(
            title=data['title'],
            description=data['description'],
            type=ContributionType.DETECTION_PATTERN,
            status=ContributionStatus.PENDING,
            github_username=user.github_username or user.username,
            github_user_id=user.github_id or 0,
            github_avatar_url=user.github_avatar_url,
            content=json.dumps(content_data),
            pattern_regex=data['pattern_regex'],
            sample_text=data['sample_text']
        )
        
        db.session.add(contribution)
        db.session.commit()
        
        return jsonify({
            'message': 'Pattern submitted successfully',
            'contribution_id': contribution.id,
            'pattern_test_result': pattern_works
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error submitting pattern: {e}")
        return jsonify({'error': 'Failed to submit pattern'}), 500

@submission_bp.route('/docs', methods=['GET'])
def docs_form():
    """Get data needed for documentation submission form"""
    return jsonify({
        'categories': [
            'Setup Guide',
            'API Documentation', 
            'Best Practices',
            'Troubleshooting',
            'Integration Guide',
            'Security Notes'
        ]
    })

@submission_bp.route('/docs', methods=['POST'])
@jwt_required()
def submit_docs():
    """Submit documentation"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.json
        
        # Validate required fields
        required_fields = ['title', 'description', 'content', 'category']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        content_data = {
            'content': data['content'],
            'category': data['category'],
            'tags': data.get('tags', []),
            'related_products': data.get('related_products', [])
        }
        
        contribution = Contribution(
            title=data['title'],
            description=data['description'],
            type=ContributionType.DOCUMENTATION,
            status=ContributionStatus.PENDING,
            github_username=user.github_username or user.username,
            github_user_id=user.github_id or 0,
            github_avatar_url=user.github_avatar_url,
            content=json.dumps(content_data)
        )
        
        db.session.add(contribution)
        db.session.commit()
        
        return jsonify({
            'message': 'Documentation submitted successfully',
            'contribution_id': contribution.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error submitting documentation: {e}")
        return jsonify({'error': 'Failed to submit documentation'}), 500

@submission_bp.route('/integration', methods=['GET'])
def integration_form():
    """Get data needed for integration submission form"""
    return jsonify({
        'integration_types': [
            'API Integration',
            'CLI Tool',
            'Browser Extension',
            'IDE Plugin',
            'CI/CD Integration',
            'Third-party Service'
        ]
    })

@submission_bp.route('/integration', methods=['POST'])
@jwt_required()
def submit_integration():
    """Submit integration"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.json
        
        # Validate required fields
        required_fields = ['title', 'description', 'integration_type', 'repository_url']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        content_data = {
            'integration_type': data['integration_type'],
            'repository_url': data['repository_url'],
            'documentation_url': data.get('documentation_url', ''),
            'demo_url': data.get('demo_url', ''),
            'installation_instructions': data.get('installation_instructions', ''),
            'supported_platforms': data.get('supported_platforms', []),
            'license': data.get('license', '')
        }
        
        contribution = Contribution(
            title=data['title'],
            description=data['description'],
            type=ContributionType.INTEGRATION,
            status=ContributionStatus.PENDING,
            github_username=user.github_username or user.username,
            github_user_id=user.github_id or 0,
            github_avatar_url=user.github_avatar_url,
            content=json.dumps(content_data)
        )
        
        db.session.add(contribution)
        db.session.commit()
        
        return jsonify({
            'message': 'Integration submitted successfully',
            'contribution_id': contribution.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error submitting integration: {e}")
        return jsonify({'error': 'Failed to submit integration'}), 500

@submission_bp.route('/bug', methods=['GET'])
def bug_form():
    """Get data needed for bug report form"""
    return jsonify({
        'categories': [
            'Pattern Not Working',
            'Website Bug',
            'Performance Issue',
            'Data Inconsistency',
            'Security Issue',
            'Other'
        ],
        'priorities': [
            'Low',
            'Medium', 
            'High',
            'Critical'
        ]
    })

@submission_bp.route('/bug', methods=['POST'])
@jwt_required()
def submit_bug():
    """Submit bug report"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.json
        
        # Validate required fields
        required_fields = ['title', 'description', 'category', 'priority']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        content_data = {
            'category': data['category'],
            'priority': data['priority'],
            'steps_to_reproduce': data.get('steps_to_reproduce', ''),
            'expected_behavior': data.get('expected_behavior', ''),
            'actual_behavior': data.get('actual_behavior', ''),
            'browser_info': data.get('browser_info', ''),
            'system_info': data.get('system_info', ''),
            'additional_context': data.get('additional_context', '')
        }
        
        contribution = Contribution(
            title=data['title'],
            description=data['description'],
            type=ContributionType.BUG_REPORT,
            status=ContributionStatus.PENDING,
            github_username=user.github_username or user.username,
            github_user_id=user.github_id or 0,
            github_avatar_url=user.github_avatar_url,
            content=json.dumps(content_data)
        )
        
        db.session.add(contribution)
        db.session.commit()
        
        return jsonify({
            'message': 'Bug report submitted successfully',
            'contribution_id': contribution.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error submitting bug report: {e}")
        return jsonify({'error': 'Failed to submit bug report'}), 500

@submission_bp.route('/test-regex', methods=['POST'])
def test_regex():
    """Test regex pattern against sample text"""
    try:
        data = request.json
        pattern = data.get('pattern')
        text = data.get('text')
        
        if not pattern or not text:
            return jsonify({'error': 'Pattern and text are required'}), 400
        
        try:
            # Compile the regex
            compiled_pattern = re.compile(pattern)
            
            # Find all matches
            matches = compiled_pattern.findall(text)
            match_objects = []
            
            for match in compiled_pattern.finditer(text):
                match_objects.append({
                    'match': match.group(),
                    'start': match.start(),
                    'end': match.end(),
                    'groups': match.groups()
                })
            
            return jsonify({
                'valid': True,
                'matches': matches,
                'match_details': match_objects,
                'match_count': len(matches)
            })
            
        except re.error as e:
            return jsonify({
                'valid': False,
                'error': str(e),
                'matches': [],
                'match_count': 0
            })
            
    except Exception as e:
        current_app.logger.error(f"Error testing regex: {e}")
        return jsonify({'error': 'Failed to test regex'}), 500