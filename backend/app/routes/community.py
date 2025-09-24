from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.contribution import Contribution, ContributionVote, ContributorProfile, ContributionType, ContributionStatus
from app import db
from datetime import datetime
import json

community_bp = Blueprint('community', __name__, url_prefix='/community')

@community_bp.route('/stats', methods=['GET'])
def get_community_stats():
    """Get live community statistics"""
    try:
        total_contributors = ContributorProfile.query.count()
        total_contributions = Contribution.query.count()
        approved_contributions = Contribution.query.filter_by(status=ContributionStatus.APPROVED).count()
        pending_contributions = Contribution.query.filter_by(status=ContributionStatus.PENDING).count()
        
        # Top contributors
        top_contributors = ContributorProfile.query.order_by(ContributorProfile.reputation_score.desc()).limit(10).all()
        
        # Recent contributions
        recent_contributions = Contribution.query.order_by(Contribution.created_at.desc()).limit(10).all()
        
        # Contribution types breakdown
        contribution_types = {}
        for contrib_type in ContributionType:
            count = Contribution.query.filter_by(type=contrib_type).count()
            contribution_types[contrib_type.value] = count
        
        return jsonify({
            'total_contributors': total_contributors,
            'total_contributions': total_contributions,
            'approved_contributions': approved_contributions,
            'pending_contributions': pending_contributions,
            'top_contributors': [c.to_dict() for c in top_contributors],
            'recent_contributions': [c.to_dict() for c in recent_contributions],
            'contribution_types': contribution_types
        })
    
    except Exception as e:
        current_app.logger.error(f"Error getting community stats: {e}")
        return jsonify({'error': 'Failed to get community statistics'}), 500

@community_bp.route('/contributors', methods=['GET'])
def get_contributors():
    """Get list of contributors with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        contributors = ContributorProfile.query.filter_by(is_public=True).order_by(
            ContributorProfile.reputation_score.desc()
        ).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'contributors': [c.to_dict() for c in contributors.items],
            'total': contributors.total,
            'pages': contributors.pages,
            'current_page': page
        })
    
    except Exception as e:
        current_app.logger.error(f"Error getting contributors: {e}")
        return jsonify({'error': 'Failed to get contributors'}), 500

@community_bp.route('/contributions', methods=['GET'])
def get_contributions():
    """Get list of contributions with filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        contrib_type = request.args.get('type')
        
        query = Contribution.query
        
        if status:
            try:
                status_enum = ContributionStatus(status)
                query = query.filter_by(status=status_enum)
            except ValueError:
                pass
        
        if contrib_type:
            try:
                type_enum = ContributionType(contrib_type)
                query = query.filter_by(type=type_enum)
            except ValueError:
                pass
        
        contributions = query.order_by(Contribution.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'contributions': [c.to_dict() for c in contributions.items],
            'total': contributions.total,
            'pages': contributions.pages,
            'current_page': page
        })
    
    except Exception as e:
        current_app.logger.error(f"Error getting contributions: {e}")
        return jsonify({'error': 'Failed to get contributions'}), 500

@community_bp.route('/contributions', methods=['POST'])
@jwt_required()
def submit_contribution():
    """Submit a new contribution"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.github_username:
            return jsonify({'error': 'GitHub authentication required'}), 401
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['title', 'description', 'type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        try:
            contrib_type = ContributionType(data['type'])
        except ValueError:
            return jsonify({'error': 'Invalid contribution type'}), 400
        
        # Create contribution
        contribution = Contribution(
            title=data['title'],
            description=data['description'],
            type=contrib_type,
            github_username=user.github_username,
            github_user_id=user.github_id,
            github_avatar_url=user.github_avatar_url,
            content=json.dumps(data.get('content', {})),
            pattern_regex=data.get('pattern_regex'),
            sample_text=data.get('sample_text')
        )
        
        db.session.add(contribution)
        
        # Update contributor profile
        contributor = ContributorProfile.query.filter_by(github_user_id=user.github_id).first()
        if contributor:
            contributor.total_contributions += 1
        
        db.session.commit()
        
        return jsonify(contribution.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error submitting contribution: {e}")
        return jsonify({'error': 'Failed to submit contribution'}), 500

@community_bp.route('/contributions/<int:contribution_id>/vote', methods=['POST'])
@jwt_required()
def vote_contribution(contribution_id):
    """Vote on a contribution"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.github_username:
            return jsonify({'error': 'GitHub authentication required'}), 401
        
        data = request.json
        vote_type = data.get('vote_type')
        
        if vote_type not in ['upvote', 'downvote']:
            return jsonify({'error': 'Invalid vote type'}), 400
        
        contribution = Contribution.query.get(contribution_id)
        if not contribution:
            return jsonify({'error': 'Contribution not found'}), 404
        
        # Check if user already voted
        existing_vote = ContributionVote.query.filter_by(
            contribution_id=contribution_id,
            github_username=user.github_username
        ).first()
        
        if existing_vote:
            # Update existing vote
            if existing_vote.vote_type != vote_type:
                # Change vote type, update counts
                if existing_vote.vote_type == 'upvote':
                    contribution.upvotes -= 1
                    contribution.downvotes += 1
                else:
                    contribution.downvotes -= 1
                    contribution.upvotes += 1
                
                existing_vote.vote_type = vote_type
        else:
            # New vote
            vote = ContributionVote(
                contribution_id=contribution_id,
                github_username=user.github_username,
                vote_type=vote_type
            )
            db.session.add(vote)
            
            if vote_type == 'upvote':
                contribution.upvotes += 1
            else:
                contribution.downvotes += 1
        
        # Update contributor reputation
        contributor = ContributorProfile.query.filter_by(
            github_username=contribution.github_username
        ).first()
        
        if contributor:
            if vote_type == 'upvote':
                contributor.total_upvotes += 1
            contributor.update_reputation()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'upvotes': contribution.upvotes,
            'downvotes': contribution.downvotes,
            'score': contribution.upvotes - contribution.downvotes
        })
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error voting on contribution: {e}")
        return jsonify({'error': 'Failed to vote on contribution'}), 500

@community_bp.route('/profile/<github_username>', methods=['GET'])
def get_contributor_profile(github_username):
    """Get contributor profile"""
    try:
        contributor = ContributorProfile.query.filter_by(
            github_username=github_username,
            is_public=True
        ).first()
        
        if not contributor:
            return jsonify({'error': 'Contributor not found'}), 404
        
        # Get contributor's contributions
        contributions = Contribution.query.filter_by(
            github_username=github_username
        ).order_by(Contribution.created_at.desc()).limit(10).all()
        
        profile_data = contributor.to_dict()
        profile_data['recent_contributions'] = [c.to_dict() for c in contributions]
        
        return jsonify(profile_data)
    
    except Exception as e:
        current_app.logger.error(f"Error getting contributor profile: {e}")
        return jsonify({'error': 'Failed to get contributor profile'}), 500

@community_bp.route('/guidelines', methods=['GET'])
def get_guidelines():
    """Get community guidelines"""
    guidelines = {
        'title': 'Community Guidelines',
        'sections': [
            {
                'title': 'Respectful Collaboration',
                'content': 'Maintain a professional and inclusive environment for all contributors.'
            },
            {
                'title': 'Quality Contributions',
                'content': 'Submit accurate and well-tested detection patterns and improvements.'
            },
            {
                'title': 'Clear Documentation',
                'content': 'Provide helpful descriptions and examples with your contributions.'
            },
            {
                'title': 'Peer Review',
                'content': 'Engage in constructive feedback and validation of community submissions.'
            },
            {
                'title': 'Responsible Disclosure',
                'content': 'Follow ethical vulnerability reporting practices.'
            }
        ]
    }
    
    return jsonify(guidelines)