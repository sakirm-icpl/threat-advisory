"""Regex pattern matching engine for version detection."""

from .patterns import RegexPattern, PatternCategory, PatternManager, PatternMetadata
from .validation import PatternValidator, ValidationTestCase, ValidationSuite

__all__ = [
    "RegexPattern",
    "PatternCategory", 
    "PatternManager",
    "PatternMetadata",
    "PatternValidator",
    "ValidationTestCase",
    "ValidationSuite",
]