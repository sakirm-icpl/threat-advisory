\"\"\"GitHub OAuth RBAC Migration

Revision ID: 0002_github_oauth_rbac
Revises: 0001_initial_schema
Create Date: 2024-01-01 00:00:00.000000

\"\"\"
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '0002_github_oauth_rbac'
down_revision = '0001_initial_schema'
branch_labels = None
depends_on = None

def upgrade():
    \"\"\"Apply GitHub OAuth and RBAC changes\"\"\"
    
    # 1. Create enum for user roles
    op.execute(\"CREATE TYPE userrole AS ENUM ('admin', 'contributor')\")
    
    # 2. Update users table for GitHub OAuth and RBAC
    # Add new columns
    op.add_column('users', sa.Column('github_id', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('github_username', sa.String(80), nullable=True))
    op.add_column('users', sa.Column('name', sa.String(200), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(500), nullable=True))
    
    # Make username nullable (GitHub users don't need legacy username)
    op.alter_column('users', 'username', nullable=True)
    
    # Update role column to use enum
    op.execute(\"ALTER TABLE users ALTER COLUMN role TYPE userrole USING role::userrole\")
    
    # Set default role for existing users (they become contributors)
    op.execute(\"UPDATE users SET role = 'contributor' WHERE role IS NULL\")
    
    # Add unique constraints and indexes
    op.create_index('idx_users_github_id', 'users', ['github_id'])
    op.create_index('idx_users_github_username', 'users', ['github_username'])
    op.create_index('idx_users_email', 'users', ['email'])
    
    # 3. Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('action', sa.Enum(
            'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 
            'ROLE_CHANGE', 'PASSWORD_RESET', 'PROMOTE_USER', 'DEMOTE_USER', 
            name='auditaction'
        ), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=False),
        sa.Column('resource_id', sa.String(50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('old_values', sa.Text(), nullable=True),
        sa.Column('new_values', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('endpoint', sa.String(200), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow, nullable=False)
    )
    
    # Add indexes for audit_logs
    op.create_index('idx_audit_logs_user_id', 'audit_logs', ['user_id'])
    op.create_index('idx_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('idx_audit_logs_resource_type', 'audit_logs', ['resource_type'])
    op.create_index('idx_audit_logs_resource_id', 'audit_logs', ['resource_id'])
    op.create_index('idx_audit_logs_created_at', 'audit_logs', ['created_at'])
    
    # 4. Add created_by fields to all entities
    # Vendors
    op.add_column('vendor', sa.Column('created_by', sa.String(), nullable=True))
    op.create_foreign_key('fk_vendor_created_by', 'vendor', 'users', ['created_by'], ['id'])
    op.create_index('idx_vendor_created_by', 'vendor', ['created_by'])
    
    # Products
    op.add_column('product', sa.Column('created_by', sa.String(), nullable=True))
    op.create_foreign_key('fk_product_created_by', 'product', 'users', ['created_by'], ['id'])
    op.create_index('idx_product_created_by', 'product', ['created_by'])
    
    # Detection Methods
    op.add_column('detection_method', sa.Column('created_by', sa.String(), nullable=True))
    op.create_foreign_key('fk_detection_method_created_by', 'detection_method', 'users', ['created_by'], ['id'])
    op.create_index('idx_detection_method_created_by', 'detection_method', ['created_by'])
    
    # Setup Guides
    op.add_column('setup_guide', sa.Column('created_by', sa.String(), nullable=True))
    op.create_foreign_key('fk_setup_guide_created_by', 'setup_guide', 'users', ['created_by'], ['id'])
    op.create_index('idx_setup_guide_created_by', 'setup_guide', ['created_by'])
    
    # 5. Ensure at least one admin exists
    # Check if admin user exists, if not, create one
    connection = op.get_bind()
    result = connection.execute(text(\"SELECT COUNT(*) FROM users WHERE role = 'admin'\")).scalar()
    
    if result == 0:
        # Create default admin user
        connection.execute(text(
            \"INSERT INTO users (id, username, email, role, is_active, created_at, updated_at) \"
            \"VALUES (gen_random_uuid()::text, 'admin', 'admin@example.com', 'admin', true, now(), now())\"
        ))
        
        print(\"Created default admin user: admin@example.com\")
        print(\"Please set up GitHub OAuth for this user or change the credentials\")

def downgrade():
    \"\"\"Revert GitHub OAuth and RBAC changes\"\"\"
    
    # Remove created_by fields
    op.drop_constraint('fk_setup_guide_created_by', 'setup_guide')
    op.drop_index('idx_setup_guide_created_by')
    op.drop_column('setup_guide', 'created_by')
    
    op.drop_constraint('fk_detection_method_created_by', 'detection_method')
    op.drop_index('idx_detection_method_created_by')
    op.drop_column('detection_method', 'created_by')
    
    op.drop_constraint('fk_product_created_by', 'product')
    op.drop_index('idx_product_created_by')
    op.drop_column('product', 'created_by')
    
    op.drop_constraint('fk_vendor_created_by', 'vendor')
    op.drop_index('idx_vendor_created_by')
    op.drop_column('vendor', 'created_by')
    
    # Drop audit_logs table
    op.drop_table('audit_logs')
    op.execute(\"DROP TYPE auditaction\")
    
    # Remove GitHub OAuth fields from users
    op.drop_index('idx_users_email')
    op.drop_index('idx_users_github_username')
    op.drop_index('idx_users_github_id')
    
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'name')
    op.drop_column('users', 'github_username')
    op.drop_column('users', 'github_id')
    
    # Revert role column to string
    op.execute(\"ALTER TABLE users ALTER COLUMN role TYPE varchar(20)\")
    op.execute(\"DROP TYPE userrole\")
    
    # Make username non-nullable again
    op.alter_column('users', 'username', nullable=False)