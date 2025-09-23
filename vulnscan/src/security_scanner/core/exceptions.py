"""Custom exceptions for the security scanner platform."""

from typing import Any, Dict, Optional


class SecurityScannerError(Exception):
    """Base exception for all security scanner errors."""
    
    def __init__(
        self, 
        message: str, 
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.details = details or {}


class ConfigurationError(SecurityScannerError):
    """Raised when there's a configuration error."""
    pass


class NetworkScanError(SecurityScannerError):
    """Raised when network scanning fails."""
    pass


class HostScanError(SecurityScannerError):
    """Raised when host scanning fails."""
    pass


class VulnerabilityMappingError(SecurityScannerError):
    """Raised when vulnerability mapping fails."""
    pass


class DataProcessingError(SecurityScannerError):
    """Raised when data processing fails."""
    pass


class DatabaseError(SecurityScannerError):
    """Raised when database operations fail."""
    pass


class AuthenticationError(SecurityScannerError):
    """Raised when authentication fails."""
    pass


class AuthorizationError(SecurityScannerError):
    """Raised when authorization fails."""
    pass


class ValidationError(SecurityScannerError):
    """Raised when data validation fails."""
    pass


class ExternalServiceError(SecurityScannerError):
    """Raised when external service calls fail."""
    
    def __init__(
        self,
        message: str,
        service_name: str,
        status_code: Optional[int] = None,
        **kwargs: Any
    ) -> None:
        super().__init__(message, **kwargs)
        self.service_name = service_name
        self.status_code = status_code


class RateLimitError(ExternalServiceError):
    """Raised when rate limits are exceeded."""
    pass


class TimeoutError(SecurityScannerError):
    """Raised when operations timeout."""
    pass


class ResourceNotFoundError(SecurityScannerError):
    """Raised when a requested resource is not found."""
    pass


class DuplicateResourceError(SecurityScannerError):
    """Raised when attempting to create a duplicate resource."""
    pass