"""Core data models for the security scanner platform."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any
from ipaddress import IPv4Address, IPv6Address
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator, root_validator

from .enums import (
    ScanType, ScanStatus, Severity, ScanSource, 
    Protocol, PortState, OSFamily, ReportFormat
)
from .validators import (
    validate_ip_address, validate_mac_address, normalize_mac_address,
    validate_cve_id, validate_cwe_id, validate_cpe
)


@dataclass
class OSInfo:
    """Operating system information."""
    
    name: str
    version: Optional[str] = None
    family: OSFamily = OSFamily.UNKNOWN
    architecture: Optional[str] = None
    kernel_version: Optional[str] = None
    build_number: Optional[str] = None


@dataclass
class Port:
    """Network port information."""
    
    number: int
    protocol: Protocol
    state: PortState
    service: Optional[str] = None
    reason: Optional[str] = None
    reason_ttl: Optional[int] = None
    
    def __post_init__(self):
        """Validate port number."""
        if not 1 <= self.number <= 65535:
            raise ValueError(f"Invalid port number: {self.number}")


@dataclass
class Service:
    """Network service information."""
    
    name: str
    port: int
    protocol: Protocol
    product: Optional[str] = None
    version: Optional[str] = None
    extra_info: Optional[str] = None
    os_type: Optional[str] = None
    method: Optional[str] = None
    confidence: float = 0.0
    banner: Optional[str] = None
    
    def __post_init__(self):
        """Validate confidence score."""
        if not 0.0 <= self.confidence <= 10.0:
            raise ValueError(f"Invalid confidence score: {self.confidence}")


class Software(BaseModel):
    """Software package information with validation."""
    
    vendor: str = Field(..., min_length=1, max_length=255)
    product: str = Field(..., min_length=1, max_length=255)
    version: str = Field(..., min_length=1, max_length=100)
    cpe: Optional[str] = Field(None, max_length=500)
    source: ScanSource
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    install_path: Optional[str] = Field(None, max_length=1000)
    package_manager: Optional[str] = Field(None, max_length=100)
    vulnerabilities: List["Vulnerability"] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator("cpe")
    def validate_cpe(cls, v: Optional[str]) -> Optional[str]:
        """Validate CPE format."""
        if v and not v.startswith("cpe:"):
            raise ValueError("CPE must start with 'cpe:'")
        return v
    
    @property
    def full_name(self) -> str:
        """Get full software name."""
        return f"{self.vendor} {self.product} {self.version}"


class Vulnerability(BaseModel):
    """Vulnerability information with validation."""
    
    cve_id: str = Field(..., regex=r"^CVE-\d{4}-\d{4,}$")
    cvss_score: float = Field(..., ge=0.0, le=10.0)
    severity: Severity
    description: str = Field(..., min_length=1, max_length=5000)
    affected_versions: List[str] = Field(default_factory=list)
    references: List[str] = Field(default_factory=list)
    exploit_available: bool = False
    patch_available: bool = False
    published_date: Optional[datetime] = None
    modified_date: Optional[datetime] = None
    vector_string: Optional[str] = Field(None, max_length=200)
    cwe_ids: List[str] = Field(default_factory=list)
    
    @root_validator
    def validate_severity_score(cls, values):
        """Ensure severity matches CVSS score."""
        cvss_score = values.get("cvss_score")
        severity = values.get("severity")
        
        if cvss_score is not None and severity is not None:
            expected_severity = Severity.from_cvss_score(cvss_score)
            if severity != expected_severity:
                values["severity"] = expected_severity
        
        return values
    
    @validator("cwe_ids", each_item=True)
    def validate_cwe_id(cls, v: str) -> str:
        """Validate CWE ID format."""
        if not v.startswith("CWE-"):
            raise ValueError("CWE ID must start with 'CWE-'")
        return v


class Host(BaseModel):
    """Host information with validation."""
    
    ip_address: str = Field(..., min_length=7, max_length=45)
    hostname: Optional[str] = Field(None, max_length=255)
    os_info: Optional[OSInfo] = None
    open_ports: List[Port] = Field(default_factory=list)
    services: List[Service] = Field(default_factory=list)
    software: List[Software] = Field(default_factory=list)
    scan_timestamp: datetime = Field(default_factory=datetime.utcnow)
    mac_address: Optional[str] = Field(None, max_length=17)
    status: str = Field(default="up")
    
    @validator("ip_address")
    def validate_ip_address_field(cls, v: str) -> str:
        """Validate IP address format."""
        if not validate_ip_address(v):
            raise ValueError(f"Invalid IP address: {v}")
        return v
    
    @validator("mac_address")
    def validate_mac_address_field(cls, v: Optional[str]) -> Optional[str]:
        """Validate and normalize MAC address format."""
        if v is None:
            return v
        
        if not validate_mac_address(v):
            raise ValueError(f"Invalid MAC address: {v}")
        
        return normalize_mac_address(v)
    
    @property
    def vulnerability_count(self) -> int:
        """Get total number of vulnerabilities."""
        return sum(len(software.vulnerabilities) for software in self.software)
    
    @property
    def critical_vulnerabilities(self) -> List[Vulnerability]:
        """Get all critical vulnerabilities."""
        critical_vulns = []
        for software in self.software:
            critical_vulns.extend([
                vuln for vuln in software.vulnerabilities 
                if vuln.severity == Severity.CRITICAL
            ])
        return critical_vulns


class ScanError(BaseModel):
    """Scan error information."""
    
    error_type: str = Field(..., min_length=1, max_length=100)
    message: str = Field(..., min_length=1, max_length=1000)
    target: Optional[str] = Field(None, max_length=255)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Dict[str, Any] = Field(default_factory=dict)


class ScanResult(BaseModel):
    """Complete scan result with validation."""
    
    scan_id: UUID = Field(default_factory=uuid4)
    scan_type: ScanType
    target: str = Field(..., min_length=1, max_length=500)
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    status: ScanStatus = ScanStatus.PENDING
    hosts: List[Host] = Field(default_factory=list)
    errors: List[ScanError] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @property
    def duration(self) -> Optional[float]:
        """Get scan duration in seconds."""
        if self.end_time and self.start_time:
            return (self.end_time - self.start_time).total_seconds()
        return None
    
    @property
    def total_hosts(self) -> int:
        """Get total number of hosts discovered."""
        return len(self.hosts)
    
    @property
    def total_vulnerabilities(self) -> int:
        """Get total number of vulnerabilities found."""
        return sum(host.vulnerability_count for host in self.hosts)
    
    @property
    def success_rate(self) -> float:
        """Calculate scan success rate."""
        if not self.hosts and not self.errors:
            return 0.0
        
        total_attempts = len(self.hosts) + len(self.errors)
        successful = len(self.hosts)
        return successful / total_attempts if total_attempts > 0 else 0.0


class ReportData(BaseModel):
    """Report generation data."""
    
    report_id: UUID = Field(default_factory=uuid4)
    scan_results: List[ScanResult]
    format: ReportFormat
    template: Optional[str] = None
    filters: Dict[str, Any] = Field(default_factory=dict)
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    generated_by: Optional[str] = None
    
    @property
    def total_hosts(self) -> int:
        """Get total hosts across all scan results."""
        return sum(result.total_hosts for result in self.scan_results)
    
    @property
    def total_vulnerabilities(self) -> int:
        """Get total vulnerabilities across all scan results."""
        return sum(result.total_vulnerabilities for result in self.scan_results)


# Update forward references
Software.model_rebuild()
Vulnerability.model_rebuild()