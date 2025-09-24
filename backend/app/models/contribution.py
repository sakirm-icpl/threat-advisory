from app import db
from datetime import datetime
from sqlalchemy import Enum as SQLEnum
from enum import Enum

class ContributionType(Enum):
    DETECTION_PATTERN = "detection_pattern"
    DOCUMENTATION = "documentation"
    BUG_REPORT = "bug_report"
    FEATURE_REQUEST = "feature_request"
    INTEGRATION = "integration"
    SECURITY_FIX = "security_fix"

class ContributionStatus(Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    MERGED = "merged"

class Contribution(db.Model):
    __tablename__ = 'contributions'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    type = db.Column(SQLEnum(ContributionType), nullable=False)
    status = db.Column(SQLEnum(ContributionStatus), default=ContributionStatus.PENDING)
    
    # GitHub user info
    github_username = db.Column(db.String(100), nullable=False)
    github_user_id = db.Column(db.Integer, nullable=False)
    github_avatar_url = db.Column(db.String(500))
    
    # Contribution content
    content = db.Column(db.Text)  # JSON content of the contribution
    pattern_regex = db.Column(db.Text)  # For detection patterns
    sample_text = db.Column(db.Text)  # Sample text for testing patterns
    
    # Review information
    review_notes = db.Column(db.Text)
    reviewed_by = db.Column(db.String(100))  # GitHub username of reviewer
    reviewed_at = db.Column(db.DateTime)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Voting/Rating
    upvotes = db.Column(db.Integer, default=0)
    downvotes = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'type': self.type.value if self.type else None,
            'status': self.status.value if self.status else None,
            'github_username': self.github_username,
            'github_user_id': self.github_user_id,
            'github_avatar_url': self.github_avatar_url,
            'content': self.content,
            'pattern_regex': self.pattern_regex,
            'sample_text': self.sample_text,
            'review_notes': self.review_notes,
            'reviewed_by': self.reviewed_by,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'upvotes': self.upvotes,
            'downvotes': self.downvotes,
            'score': self.upvotes - self.downvotes
        }

class ContributionVote(db.Model):
    __tablename__ = 'contribution_votes'
    
    id = db.Column(db.Integer, primary_key=True)
    contribution_id = db.Column(db.Integer, db.ForeignKey('contributions.id'), nullable=False)
    github_username = db.Column(db.String(100), nullable=False)
    vote_type = db.Column(db.String(20), nullable=False)  # 'upvote' or 'downvote'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Ensure one vote per user per contribution
    __table_args__ = (db.UniqueConstraint('contribution_id', 'github_username'),)

class ContributorProfile(db.Model):
    __tablename__ = 'contributor_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    github_username = db.Column(db.String(100), unique=True, nullable=False)
    github_user_id = db.Column(db.Integer, unique=True, nullable=False)
    github_avatar_url = db.Column(db.String(500))
    display_name = db.Column(db.String(200))
    bio = db.Column(db.Text)
    location = db.Column(db.String(100))
    company = db.Column(db.String(100))
    website = db.Column(db.String(200))
    
    # Reputation system
    reputation_score = db.Column(db.Integer, default=0)
    contributor_level = db.Column(db.String(50), default='Community Member')  # Community Member, Trusted Contributor, Maintainer
    
    # Statistics
    total_contributions = db.Column(db.Integer, default=0)
    approved_contributions = db.Column(db.Integer, default=0)
    total_upvotes = db.Column(db.Integer, default=0)
    
    # Badges (JSON field to store list of earned badges)
    badges = db.Column(db.JSON, default=list)
    
    # Profile settings
    is_public = db.Column(db.Boolean, default=True)
    show_email = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'github_username': self.github_username,
            'github_user_id': self.github_user_id,
            'github_avatar_url': self.github_avatar_url,
            'display_name': self.display_name,
            'bio': self.bio,
            'location': self.location,
            'company': self.company,
            'website': self.website,
            'reputation_score': self.reputation_score,
            'contributor_level': self.contributor_level,
            'total_contributions': self.total_contributions,
            'approved_contributions': self.approved_contributions,
            'total_upvotes': self.total_upvotes,
            'badges': self.badges or [],
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_active': self.last_active.isoformat() if self.last_active else None
        }
    
    def calculate_contributor_level(self):
        """Calculate contributor level based on reputation and contributions"""
        if self.approved_contributions >= 100 or self.reputation_score >= 1000:
            return 'Maintainer'
        elif self.approved_contributions >= 20 or self.reputation_score >= 200:
            return 'Trusted Contributor'
        else:
            return 'Community Member'
    
    def update_reputation(self):
        """Update reputation score based on contributions and votes"""
        base_score = self.approved_contributions * 10
        vote_score = self.total_upvotes * 2
        self.reputation_score = base_score + vote_score
        self.contributor_level = self.calculate_contributor_level()