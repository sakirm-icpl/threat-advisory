"""Data models for the security scanner platform."""

from .enums import (
    ScanType, ScanStatus, Severity, ScanSource, Protocol, 
    PortState, OSFamily, ReportFormat, AlertChannel
)
from .core import (
    Host, Software, Vulnerability, ScanResult, OSInfo, 
    Port, Service, ScanError, ReportData
)
from .database import (
    ScanModel, HostModel, PortModel, ServiceModel,
    SoftwareModel, VulnerabilityModel, ScanErrorModel, ReportModel
)
from .repositories import (
    ScanRepository, HostRepository, SoftwareRepository,
    VulnerabilityRepository, ReportRepository, RepositoryManager
)
from . import validators

__all__ = [
    # Enums
    "ScanType",
    "ScanStatus", 
    "Severity",
    "ScanSource",
    "Protocol",
    "PortState",
    "OSFamily",
    "ReportFormat",
    "AlertChannel",
    # Core models (Pydantic)
    "Host",
    "Software",
    "Vulnerability", 
    "ScanResult",
    "OSInfo",
    "Port",
    "Service",
    "ScanError",
    "ReportData",
    # Database models (SQLAlchemy)
    "ScanModel",
    "HostModel",
    "PortModel",
    "ServiceModel",
    "SoftwareModel",
    "VulnerabilityModel",
    "ScanErrorModel",
    "ReportModel",
    # Repositories
    "ScanRepository",
    "HostRepository",
    "SoftwareRepository",
    "VulnerabilityRepository",
    "ReportRepository",
    "RepositoryManager",
    # Validators module
    "validators",
]