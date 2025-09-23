"""SQLAlchemy database models for the security scanner platform."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, JSON,
    ForeignKey, Index, UniqueConstraint, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.ext.hybrid import hybrid_property

from ..core.database import Base
from .enums import ScanType, ScanStatus, Severity, ScanSource, Protocol, PortState, OSFamily


class ScanModel(Base):
    """Database model for scan operations."""
    
    __tablename__ = "scans"
    
    # Primary key
    id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True), 
        primary_key=True, 
        default=uuid4
    )
    
    # Basic scan information
    scan_type: Mapped[ScanType] = mapped_column(String(20), nullable=False)
    target: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[ScanStatus] = mapped_column(String(20), nullable=False, default=ScanStatus.PENDING)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Metadata and configuration
    metadata: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    # User information
    created_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Relationships
    hosts: Mapped[List["HostModel"]] = relationship(
        "HostModel", 
        back_populates="scan",
        cascade="all, delete-orphan"
    )
    errors: Mapped[List["ScanErrorModel"]] = relationship(
        "ScanErrorModel",
        back_populates="scan",
        cascade="all, delete-orphan"
    )
    
    # Indexes
    __table_args__ = (
        Index("ix_scans_status", "status"),
        Index("ix_scans_created_at", "created_at"),
        Index("ix_scans_scan_type", "scan_type"),
        Index("ix_scans_target", "target"),
    )
    
    @hybrid_property
    def duration(self) -> Optional[float]:
        """Calculate scan duration in seconds."""
        if self.completed_at and self.started_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
    
    def __repr__(self) -> str:
        return f"<ScanModel(id={self.id}, type={self.scan_type}, status={self.status})>"


class HostModel(Base):
    """Database model for discovered hosts."""
    
    __tablename__ = "hosts"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key to scan
    scan_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("scans.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Host identification
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)  # IPv6 support
    hostname: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mac_address: Mapped[Optional[str]] = mapped_column(String(17), nullable=True)
    
    # Host status and OS information
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="up")
    os_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    os_version: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    os_family: Mapped[Optional[OSFamily]] = mapped_column(String(20), nullable=True)
    os_architecture: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Timestamps
    discovered_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    last_seen: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Additional metadata
    metadata: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    # Relationships
    scan: Mapped["ScanModel"] = relationship("ScanModel", back_populates="hosts")
    ports: Mapped[List["PortModel"]] = relationship(
        "PortModel",
        back_populates="host",
        cascade="all, delete-orphan"
    )
    services: Mapped[List["ServiceModel"]] = relationship(
        "ServiceModel",
        back_populates="host",
        cascade="all, delete-orphan"
    )
    software: Mapped[List["SoftwareModel"]] = relationship(
        "SoftwareModel",
        back_populates="host",
        cascade="all, delete-orphan"
    )
    
    # Indexes and constraints
    __table_args__ = (
        Index("ix_hosts_ip_address", "ip_address"),
        Index("ix_hosts_hostname", "hostname"),
        Index("ix_hosts_scan_id", "scan_id"),
        Index("ix_hosts_discovered_at", "discovered_at"),
        UniqueConstraint("scan_id", "ip_address", name="uq_hosts_scan_ip"),
    )
    
    def __repr__(self) -> str:
        return f"<HostModel(id={self.id}, ip={self.ip_address}, hostname={self.hostname})>"


class PortModel(Base):
    """Database model for network ports."""
    
    __tablename__ = "ports"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key to host
    host_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("hosts.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Port information
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    protocol: Mapped[Protocol] = mapped_column(String(10), nullable=False)
    state: Mapped[PortState] = mapped_column(String(20), nullable=False)
    service_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Detection details
    reason: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    reason_ttl: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Timestamps
    discovered_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    host: Mapped["HostModel"] = relationship("HostModel", back_populates="ports")
    
    # Constraints
    __table_args__ = (
        Index("ix_ports_host_id", "host_id"),
        Index("ix_ports_number", "number"),
        Index("ix_ports_state", "state"),
        UniqueConstraint("host_id", "number", "protocol", name="uq_ports_host_number_protocol"),
        CheckConstraint("number >= 1 AND number <= 65535", name="ck_ports_valid_number"),
    )
    
    def __repr__(self) -> str:
        return f"<PortModel(id={self.id}, number={self.number}, protocol={self.protocol}, state={self.state})>"


class ServiceModel(Base):
    """Database model for network services."""
    
    __tablename__ = "services"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key to host
    host_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("hosts.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Service identification
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    port: Mapped[int] = mapped_column(Integer, nullable=False)
    protocol: Mapped[Protocol] = mapped_column(String(10), nullable=False)
    
    # Service details
    product: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    version: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    extra_info: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    os_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    banner: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamps
    discovered_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    host: Mapped["HostModel"] = relationship("HostModel", back_populates="services")
    
    # Constraints
    __table_args__ = (
        Index("ix_services_host_id", "host_id"),
        Index("ix_services_name", "name"),
        Index("ix_services_port", "port"),
        Index("ix_services_product_version", "product", "version"),
        UniqueConstraint("host_id", "port", "protocol", name="uq_services_host_port_protocol"),
        CheckConstraint("confidence >= 0.0 AND confidence <= 10.0", name="ck_services_valid_confidence"),
        CheckConstraint("port >= 1 AND port <= 65535", name="ck_services_valid_port"),
    )
    
    def __repr__(self) -> str:
        return f"<ServiceModel(id={self.id}, name={self.name}, port={self.port}, product={self.product})>"


class SoftwareModel(Base):
    """Database model for software packages."""
    
    __tablename__ = "software"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key to host
    host_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("hosts.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Software identification
    vendor: Mapped[str] = mapped_column(String(255), nullable=False)
    product: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(100), nullable=False)
    cpe: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Detection details
    source: Mapped[ScanSource] = mapped_column(String(20), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    install_path: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    package_manager: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Additional metadata
    metadata: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    # Timestamps
    discovered_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    host: Mapped["HostModel"] = relationship("HostModel", back_populates="software")
    vulnerabilities: Mapped[List["VulnerabilityModel"]] = relationship(
        "VulnerabilityModel",
        secondary="software_vulnerabilities",
        back_populates="software_instances"
    )
    
    # Constraints
    __table_args__ = (
        Index("ix_software_host_id", "host_id"),
        Index("ix_software_vendor_product", "vendor", "product"),
        Index("ix_software_version", "version"),
        Index("ix_software_cpe", "cpe"),
        Index("ix_software_source", "source"),
        CheckConstraint("confidence >= 0.0 AND confidence <= 1.0", name="ck_software_valid_confidence"),
    )
    
    @hybrid_property
    def full_name(self) -> str:
        """Get full software name."""
        return f"{self.vendor} {self.product} {self.version}"
    
    def __repr__(self) -> str:
        return f"<SoftwareModel(id={self.id}, vendor={self.vendor}, product={self.product}, version={self.version})>"


class VulnerabilityModel(Base):
    """Database model for vulnerabilities."""
    
    __tablename__ = "vulnerabilities"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # CVE identification
    cve_id: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    
    # Vulnerability details
    cvss_score: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[Severity] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Version and reference information
    affected_versions: Mapped[List[str]] = mapped_column(JSONB, nullable=False, default=list)
    references: Mapped[List[str]] = mapped_column(JSONB, nullable=False, default=list)
    cwe_ids: Mapped[List[str]] = mapped_column(JSONB, nullable=False, default=list)
    
    # Exploit and patch information
    exploit_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    patch_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    vector_string: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    
    # Timestamps
    published_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    modified_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    discovered_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        nullable=False, 
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    # Relationships
    software_instances: Mapped[List["SoftwareModel"]] = relationship(
        "SoftwareModel",
        secondary="software_vulnerabilities",
        back_populates="vulnerabilities"
    )
    
    # Constraints
    __table_args__ = (
        Index("ix_vulnerabilities_cve_id", "cve_id"),
        Index("ix_vulnerabilities_severity", "severity"),
        Index("ix_vulnerabilities_cvss_score", "cvss_score"),
        Index("ix_vulnerabilities_published_date", "published_date"),
        CheckConstraint("cvss_score >= 0.0 AND cvss_score <= 10.0", name="ck_vulnerabilities_valid_cvss"),
    )
    
    def __repr__(self) -> str:
        return f"<VulnerabilityModel(id={self.id}, cve_id={self.cve_id}, severity={self.severity})>"


class SoftwareVulnerabilityModel(Base):
    """Association table for software-vulnerability many-to-many relationship."""
    
    __tablename__ = "software_vulnerabilities"
    
    # Foreign keys
    software_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("software.id", ondelete="CASCADE"),
        primary_key=True
    )
    vulnerability_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("vulnerabilities.id", ondelete="CASCADE"),
        primary_key=True
    )
    
    # Additional association data
    discovered_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    
    # Constraints
    __table_args__ = (
        Index("ix_software_vulnerabilities_software_id", "software_id"),
        Index("ix_software_vulnerabilities_vulnerability_id", "vulnerability_id"),
        CheckConstraint("confidence >= 0.0 AND confidence <= 1.0", name="ck_software_vulnerabilities_valid_confidence"),
    )


class ScanErrorModel(Base):
    """Database model for scan errors."""
    
    __tablename__ = "scan_errors"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key to scan
    scan_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("scans.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Error information
    error_type: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(String(1000), nullable=False)
    target: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Additional details
    details: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    # Timestamp
    occurred_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    scan: Mapped["ScanModel"] = relationship("ScanModel", back_populates="errors")
    
    # Indexes
    __table_args__ = (
        Index("ix_scan_errors_scan_id", "scan_id"),
        Index("ix_scan_errors_error_type", "error_type"),
        Index("ix_scan_errors_occurred_at", "occurred_at"),
    )
    
    def __repr__(self) -> str:
        return f"<ScanErrorModel(id={self.id}, type={self.error_type}, message={self.message[:50]})>"


class ReportModel(Base):
    """Database model for generated reports."""
    
    __tablename__ = "reports"
    
    # Primary key
    id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )
    
    # Report information
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    format: Mapped[str] = mapped_column(String(20), nullable=False)
    template: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Generation details
    generated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    generated_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Report content and metadata
    file_path: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    filters: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    metadata: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    # Associated scan IDs
    scan_ids: Mapped[List[str]] = mapped_column(JSONB, nullable=False, default=list)
    
    # Indexes
    __table_args__ = (
        Index("ix_reports_generated_at", "generated_at"),
        Index("ix_reports_format", "format"),
        Index("ix_reports_generated_by", "generated_by"),
    )
    
    def __repr__(self) -> str:
        return f"<ReportModel(id={self.id}, name={self.name}, format={self.format})>"