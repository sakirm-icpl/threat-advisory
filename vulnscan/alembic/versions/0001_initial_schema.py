"""Initial schema

Revision ID: 0001
Revises: 
Create Date: 2024-01-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial database schema."""
    
    # Create scans table
    op.create_table(
        'scans',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('scan_type', sa.String(length=20), nullable=False),
        sa.Column('target', sa.String(length=500), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('config', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_scans'))
    )
    op.create_index(op.f('ix_scans_created_at'), 'scans', ['created_at'], unique=False)
    op.create_index(op.f('ix_scans_scan_type'), 'scans', ['scan_type'], unique=False)
    op.create_index(op.f('ix_scans_status'), 'scans', ['status'], unique=False)
    op.create_index(op.f('ix_scans_target'), 'scans', ['target'], unique=False)

    # Create hosts table
    op.create_table(
        'hosts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('scan_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=False),
        sa.Column('hostname', sa.String(length=255), nullable=True),
        sa.Column('mac_address', sa.String(length=17), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('os_name', sa.String(length=255), nullable=True),
        sa.Column('os_version', sa.String(length=255), nullable=True),
        sa.Column('os_family', sa.String(length=20), nullable=True),
        sa.Column('os_architecture', sa.String(length=50), nullable=True),
        sa.Column('discovered_at', sa.DateTime(), nullable=False),
        sa.Column('last_seen', sa.DateTime(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.ForeignKeyConstraint(['scan_id'], ['scans.id'], name=op.f('fk_hosts_scan_id_scans'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_hosts')),
        sa.UniqueConstraint('scan_id', 'ip_address', name=op.f('uq_hosts_scan_ip'))
    )
    op.create_index(op.f('ix_hosts_discovered_at'), 'hosts', ['discovered_at'], unique=False)
    op.create_index(op.f('ix_hosts_hostname'), 'hosts', ['hostname'], unique=False)
    op.create_index(op.f('ix_hosts_ip_address'), 'hosts', ['ip_address'], unique=False)
    op.create_index(op.f('ix_hosts_scan_id'), 'hosts', ['scan_id'], unique=False)

    # Create ports table
    op.create_table(
        'ports',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('host_id', sa.Integer(), nullable=False),
        sa.Column('number', sa.Integer(), nullable=False),
        sa.Column('protocol', sa.String(length=10), nullable=False),
        sa.Column('state', sa.String(length=20), nullable=False),
        sa.Column('service_name', sa.String(length=100), nullable=True),
        sa.Column('reason', sa.String(length=100), nullable=True),
        sa.Column('reason_ttl', sa.Integer(), nullable=True),
        sa.Column('discovered_at', sa.DateTime(), nullable=False),
        sa.CheckConstraint('number >= 1 AND number <= 65535', name=op.f('ck_ports_valid_number')),
        sa.ForeignKeyConstraint(['host_id'], ['hosts.id'], name=op.f('fk_ports_host_id_hosts'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_ports')),
        sa.UniqueConstraint('host_id', 'number', 'protocol', name=op.f('uq_ports_host_number_protocol'))
    )
    op.create_index(op.f('ix_ports_host_id'), 'ports', ['host_id'], unique=False)
    op.create_index(op.f('ix_ports_number'), 'ports', ['number'], unique=False)
    op.create_index(op.f('ix_ports_state'), 'ports', ['state'], unique=False)

    # Create services table
    op.create_table(
        'services',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('host_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('port', sa.Integer(), nullable=False),
        sa.Column('protocol', sa.String(length=10), nullable=False),
        sa.Column('product', sa.String(length=255), nullable=True),
        sa.Column('version', sa.String(length=100), nullable=True),
        sa.Column('extra_info', sa.String(length=500), nullable=True),
        sa.Column('os_type', sa.String(length=100), nullable=True),
        sa.Column('method', sa.String(length=50), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('banner', sa.Text(), nullable=True),
        sa.Column('discovered_at', sa.DateTime(), nullable=False),
        sa.CheckConstraint('confidence >= 0.0 AND confidence <= 10.0', name=op.f('ck_services_valid_confidence')),
        sa.CheckConstraint('port >= 1 AND port <= 65535', name=op.f('ck_services_valid_port')),
        sa.ForeignKeyConstraint(['host_id'], ['hosts.id'], name=op.f('fk_services_host_id_hosts'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_services')),
        sa.UniqueConstraint('host_id', 'port', 'protocol', name=op.f('uq_services_host_port_protocol'))
    )
    op.create_index(op.f('ix_services_host_id'), 'services', ['host_id'], unique=False)
    op.create_index(op.f('ix_services_name'), 'services', ['name'], unique=False)
    op.create_index(op.f('ix_services_port'), 'services', ['port'], unique=False)
    op.create_index(op.f('ix_services_product_version'), 'services', ['product', 'version'], unique=False)

    # Create software table
    op.create_table(
        'software',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('host_id', sa.Integer(), nullable=False),
        sa.Column('vendor', sa.String(length=255), nullable=False),
        sa.Column('product', sa.String(length=255), nullable=False),
        sa.Column('version', sa.String(length=100), nullable=False),
        sa.Column('cpe', sa.String(length=500), nullable=True),
        sa.Column('source', sa.String(length=20), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('install_path', sa.String(length=1000), nullable=True),
        sa.Column('package_manager', sa.String(length=100), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('discovered_at', sa.DateTime(), nullable=False),
        sa.CheckConstraint('confidence >= 0.0 AND confidence <= 1.0', name=op.f('ck_software_valid_confidence')),
        sa.ForeignKeyConstraint(['host_id'], ['hosts.id'], name=op.f('fk_software_host_id_hosts'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_software'))
    )
    op.create_index(op.f('ix_software_cpe'), 'software', ['cpe'], unique=False)
    op.create_index(op.f('ix_software_host_id'), 'software', ['host_id'], unique=False)
    op.create_index(op.f('ix_software_source'), 'software', ['source'], unique=False)
    op.create_index(op.f('ix_software_vendor_product'), 'software', ['vendor', 'product'], unique=False)
    op.create_index(op.f('ix_software_version'), 'software', ['version'], unique=False)

    # Create vulnerabilities table
    op.create_table(
        'vulnerabilities',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('cve_id', sa.String(length=20), nullable=False),
        sa.Column('cvss_score', sa.Float(), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('affected_versions', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('references', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('cwe_ids', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('exploit_available', sa.Boolean(), nullable=False),
        sa.Column('patch_available', sa.Boolean(), nullable=False),
        sa.Column('vector_string', sa.String(length=200), nullable=True),
        sa.Column('published_date', sa.DateTime(), nullable=True),
        sa.Column('modified_date', sa.DateTime(), nullable=True),
        sa.Column('discovered_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.CheckConstraint('cvss_score >= 0.0 AND cvss_score <= 10.0', name=op.f('ck_vulnerabilities_valid_cvss')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_vulnerabilities')),
        sa.UniqueConstraint('cve_id', name=op.f('uq_vulnerabilities_cve_id'))
    )
    op.create_index(op.f('ix_vulnerabilities_cve_id'), 'vulnerabilities', ['cve_id'], unique=False)
    op.create_index(op.f('ix_vulnerabilities_cvss_score'), 'vulnerabilities', ['cvss_score'], unique=False)
    op.create_index(op.f('ix_vulnerabilities_published_date'), 'vulnerabilities', ['published_date'], unique=False)
    op.create_index(op.f('ix_vulnerabilities_severity'), 'vulnerabilities', ['severity'], unique=False)

    # Create software_vulnerabilities association table
    op.create_table(
        'software_vulnerabilities',
        sa.Column('software_id', sa.Integer(), nullable=False),
        sa.Column('vulnerability_id', sa.Integer(), nullable=False),
        sa.Column('discovered_at', sa.DateTime(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.CheckConstraint('confidence >= 0.0 AND confidence <= 1.0', name=op.f('ck_software_vulnerabilities_valid_confidence')),
        sa.ForeignKeyConstraint(['software_id'], ['software.id'], name=op.f('fk_software_vulnerabilities_software_id_software'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['vulnerability_id'], ['vulnerabilities.id'], name=op.f('fk_software_vulnerabilities_vulnerability_id_vulnerabilities'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('software_id', 'vulnerability_id', name=op.f('pk_software_vulnerabilities'))
    )
    op.create_index(op.f('ix_software_vulnerabilities_software_id'), 'software_vulnerabilities', ['software_id'], unique=False)
    op.create_index(op.f('ix_software_vulnerabilities_vulnerability_id'), 'software_vulnerabilities', ['vulnerability_id'], unique=False)

    # Create scan_errors table
    op.create_table(
        'scan_errors',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('scan_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('error_type', sa.String(length=100), nullable=False),
        sa.Column('message', sa.String(length=1000), nullable=False),
        sa.Column('target', sa.String(length=255), nullable=True),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('occurred_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['scan_id'], ['scans.id'], name=op.f('fk_scan_errors_scan_id_scans'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_scan_errors'))
    )
    op.create_index(op.f('ix_scan_errors_error_type'), 'scan_errors', ['error_type'], unique=False)
    op.create_index(op.f('ix_scan_errors_occurred_at'), 'scan_errors', ['occurred_at'], unique=False)
    op.create_index(op.f('ix_scan_errors_scan_id'), 'scan_errors', ['scan_id'], unique=False)

    # Create reports table
    op.create_table(
        'reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('format', sa.String(length=20), nullable=False),
        sa.Column('template', sa.String(length=255), nullable=True),
        sa.Column('generated_at', sa.DateTime(), nullable=False),
        sa.Column('generated_by', sa.String(length=255), nullable=True),
        sa.Column('file_path', sa.String(length=1000), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('filters', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('scan_ids', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_reports'))
    )
    op.create_index(op.f('ix_reports_format'), 'reports', ['format'], unique=False)
    op.create_index(op.f('ix_reports_generated_at'), 'reports', ['generated_at'], unique=False)
    op.create_index(op.f('ix_reports_generated_by'), 'reports', ['generated_by'], unique=False)


def downgrade() -> None:
    """Drop all tables."""
    op.drop_table('reports')
    op.drop_table('scan_errors')
    op.drop_table('software_vulnerabilities')
    op.drop_table('vulnerabilities')
    op.drop_table('software')
    op.drop_table('services')
    op.drop_table('ports')
    op.drop_table('hosts')
    op.drop_table('scans')