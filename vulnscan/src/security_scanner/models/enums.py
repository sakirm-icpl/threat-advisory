"""Enumerations for the security scanner platform."""

from enum import Enum


class ScanType(str, Enum):
    """Types of scans that can be performed."""
    
    NETWORK = "network"
    HOST = "host"
    VULNERABILITY = "vulnerability"
    COMBINED = "combined"


class ScanStatus(str, Enum):
    """Status of scan operations."""
    
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"


class Severity(str, Enum):
    """Vulnerability severity levels based on CVSS."""
    
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    
    @classmethod
    def from_cvss_score(cls, score: float) -> "Severity":
        """Convert CVSS score to severity level."""
        if score == 0.0:
            return cls.NONE
        elif 0.1 <= score <= 3.9:
            return cls.LOW
        elif 4.0 <= score <= 6.9:
            return cls.MEDIUM
        elif 7.0 <= score <= 8.9:
            return cls.HIGH
        elif 9.0 <= score <= 10.0:
            return cls.CRITICAL
        else:
            raise ValueError(f"Invalid CVSS score: {score}")


class ScanSource(str, Enum):
    """Source of scan data."""
    
    NETWORK = "network"
    HOST = "host"
    REGISTRY = "registry"
    PACKAGE_MANAGER = "package_manager"
    BINARY = "binary"
    CONFIG_FILE = "config_file"
    MANUAL = "manual"


class Protocol(str, Enum):
    """Network protocols."""
    
    TCP = "tcp"
    UDP = "udp"
    ICMP = "icmp"
    SCTP = "sctp"


class PortState(str, Enum):
    """Port states from network scanning."""
    
    OPEN = "open"
    CLOSED = "closed"
    FILTERED = "filtered"
    UNFILTERED = "unfiltered"
    OPEN_FILTERED = "open|filtered"
    CLOSED_FILTERED = "closed|filtered"


class OSFamily(str, Enum):
    """Operating system families."""
    
    LINUX = "linux"
    WINDOWS = "windows"
    MACOS = "macos"
    BSD = "bsd"
    UNIX = "unix"
    UNKNOWN = "unknown"


class ReportFormat(str, Enum):
    """Report output formats."""
    
    JSON = "json"
    HTML = "html"
    PDF = "pdf"
    CSV = "csv"
    XML = "xml"


class AlertChannel(str, Enum):
    """Alert notification channels."""
    
    EMAIL = "email"
    SLACK = "slack"
    WEBHOOK = "webhook"
    SMS = "sms"
    TEAMS = "teams"