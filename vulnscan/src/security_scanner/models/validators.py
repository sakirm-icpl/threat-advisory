"""Validation utilities for data models."""

import re
from typing import Optional
from ipaddress import IPv4Address, IPv6Address, AddressValueError


def validate_ip_address(ip_str: str) -> bool:
    """Validate IP address format (IPv4 or IPv6)."""
    try:
        IPv4Address(ip_str)
        return True
    except AddressValueError:
        try:
            IPv6Address(ip_str)
            return True
        except AddressValueError:
            return False


def validate_mac_address(mac_str: str) -> bool:
    """Validate MAC address format."""
    # Remove common separators
    cleaned = mac_str.replace(":", "").replace("-", "").replace(".", "")
    
    # Check if it's 12 hex characters
    if len(cleaned) != 12:
        return False
    
    return all(c in "0123456789abcdefABCDEF" for c in cleaned)


def normalize_mac_address(mac_str: str) -> str:
    """Normalize MAC address to standard format (lowercase with colons)."""
    if not validate_mac_address(mac_str):
        raise ValueError(f"Invalid MAC address: {mac_str}")
    
    # Remove separators and convert to lowercase
    cleaned = mac_str.replace(":", "").replace("-", "").replace(".", "").lower()
    
    # Add colons every 2 characters
    return ":".join(cleaned[i:i+2] for i in range(0, 12, 2))


def validate_cve_id(cve_id: str) -> bool:
    """Validate CVE ID format."""
    pattern = r"^CVE-\d{4}-\d{4,}$"
    return bool(re.match(pattern, cve_id))


def validate_cwe_id(cwe_id: str) -> bool:
    """Validate CWE ID format."""
    pattern = r"^CWE-\d+$"
    return bool(re.match(pattern, cwe_id))


def validate_cpe(cpe_str: str) -> bool:
    """Validate CPE (Common Platform Enumeration) format."""
    if not cpe_str.startswith("cpe:"):
        return False
    
    # Basic validation - CPE should have the right structure
    parts = cpe_str.split(":")
    return len(parts) >= 4  # Minimum parts for a valid CPE


def validate_port_number(port: int) -> bool:
    """Validate port number range."""
    return 1 <= port <= 65535


def validate_cvss_score(score: float) -> bool:
    """Validate CVSS score range."""
    return 0.0 <= score <= 10.0


def validate_confidence_score(score: float) -> bool:
    """Validate confidence score range (0.0 to 1.0)."""
    return 0.0 <= score <= 1.0


def validate_nmap_confidence_score(score: float) -> bool:
    """Validate Nmap confidence score range (0.0 to 10.0)."""
    return 0.0 <= score <= 10.0


def sanitize_string(value: str, max_length: Optional[int] = None) -> str:
    """Sanitize string input by removing control characters."""
    # Remove control characters except newline and tab
    sanitized = "".join(char for char in value if ord(char) >= 32 or char in "\n\t")
    
    # Trim whitespace
    sanitized = sanitized.strip()
    
    # Truncate if max_length specified
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized


def validate_hostname(hostname: str) -> bool:
    """Validate hostname format according to RFC standards."""
    if not hostname or len(hostname) > 253:
        return False
    
    # Check each label
    labels = hostname.split(".")
    for label in labels:
        if not label or len(label) > 63:
            return False
        
        # Label must start and end with alphanumeric
        if not (label[0].isalnum() and label[-1].isalnum()):
            return False
        
        # Label can contain hyphens but not at start/end
        if not all(c.isalnum() or c == "-" for c in label):
            return False
    
    return True


def validate_version_string(version: str) -> bool:
    """Validate software version string format."""
    if not version or len(version) > 100:
        return False
    
    # Version should not contain control characters
    return all(ord(c) >= 32 for c in version)


def normalize_vendor_name(vendor: str) -> str:
    """Normalize vendor name for consistency."""
    # Common vendor name normalizations
    normalizations = {
        "microsoft corporation": "Microsoft",
        "apache software foundation": "Apache",
        "oracle corporation": "Oracle",
        "red hat inc.": "Red Hat",
        "canonical ltd.": "Canonical",
    }
    
    vendor_lower = vendor.lower().strip()
    return normalizations.get(vendor_lower, vendor.strip())


def normalize_product_name(product: str) -> str:
    """Normalize product name for consistency."""
    # Remove common suffixes/prefixes
    product = product.strip()
    
    # Remove version numbers that might be included
    product = re.sub(r'\s+v?\d+(\.\d+)*.*$', '', product)
    
    return product.strip()