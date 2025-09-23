"""Regex pattern management system for version detection."""

import json
import re
import yaml
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field, asdict
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator

from ..core.logging import get_logger
from ..core.exceptions import ValidationError, ConfigurationError

logger = get_logger(__name__)


class PatternCategory(str, Enum):
    """Categories of regex patterns for version detection."""
    
    HTTP_HEADERS = "http_headers"
    SERVICE_BANNERS = "service_banners"
    BINARY_SIGNATURES = "binary_signatures"
    PACKAGE_METADATA = "package_metadata"
    CONFIG_FILES = "config_files"
    FILE_HEADERS = "file_headers"
    PROCESS_NAMES = "process_names"
    REGISTRY_ENTRIES = "registry_entries"


@dataclass
class PatternMetadata:
    """Metadata for regex patterns."""
    
    author: str
    created_at: datetime
    updated_at: datetime
    version: str = "1.0"
    description: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    references: List[str] = field(default_factory=list)
    test_cases: List[Dict[str, Any]] = field(default_factory=list)


class RegexPattern(BaseModel):
    """Structured regex pattern for version detection."""
    
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., min_length=1, max_length=255)
    category: PatternCategory
    pattern: str = Field(..., min_length=1)
    vendor: str = Field(..., min_length=1, max_length=255)
    product: str = Field(..., min_length=1, max_length=255)
    
    # Pattern configuration
    flags: int = Field(default=re.IGNORECASE)
    priority: int = Field(default=100, ge=1, le=1000)
    enabled: bool = Field(default=True)
    
    # Version extraction groups
    version_group: int = Field(default=1, ge=1)
    vendor_group: Optional[int] = Field(None, ge=1)
    product_group: Optional[int] = Field(None, ge=1)
    
    # Confidence and validation
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    min_match_length: int = Field(default=1, ge=1)
    max_match_length: int = Field(default=1000, ge=1)
    
    # Context and conditions
    context_patterns: List[str] = Field(default_factory=list)
    exclude_patterns: List[str] = Field(default_factory=list)
    required_context: bool = Field(default=False)
    
    # Metadata
    metadata: Optional[PatternMetadata] = None
    
    @validator("pattern")
    def validate_pattern(cls, v: str) -> str:
        """Validate regex pattern syntax."""
        try:
            re.compile(v)
            return v
        except re.error as e:
            raise ValueError(f"Invalid regex pattern: {e}")
    
    @validator("context_patterns", each_item=True)
    def validate_context_patterns(cls, v: str) -> str:
        """Validate context pattern syntax."""
        try:
            re.compile(v)
            return v
        except re.error as e:
            raise ValueError(f"Invalid context pattern: {e}")
    
    @validator("exclude_patterns", each_item=True)
    def validate_exclude_patterns(cls, v: str) -> str:
        """Validate exclude pattern syntax."""
        try:
            re.compile(v)
            return v
        except re.error as e:
            raise ValueError(f"Invalid exclude pattern: {e}")
    
    @validator("max_match_length")
    def validate_match_length_order(cls, v: int, values: Dict[str, Any]) -> int:
        """Ensure max_match_length >= min_match_length."""
        min_length = values.get("min_match_length", 1)
        if v < min_length:
            raise ValueError("max_match_length must be >= min_match_length")
        return v
    
    def compile(self) -> re.Pattern:
        """Compile the regex pattern."""
        try:
            return re.compile(self.pattern, self.flags)
        except re.error as e:
            raise ValidationError(f"Failed to compile pattern '{self.name}': {e}")
    
    def test_pattern(self, test_string: str) -> Optional[re.Match]:
        """Test the pattern against a string."""
        compiled_pattern = self.compile()
        return compiled_pattern.search(test_string)
    
    def extract_version_info(self, match: re.Match) -> Dict[str, Optional[str]]:
        """Extract version information from a regex match."""
        try:
            result = {
                "version": None,
                "vendor": self.vendor,
                "product": self.product
            }
            
            # Extract version from specified group
            if match.lastindex and match.lastindex >= self.version_group:
                result["version"] = match.group(self.version_group)
            
            # Extract vendor if group specified
            if (self.vendor_group and match.lastindex and 
                match.lastindex >= self.vendor_group):
                result["vendor"] = match.group(self.vendor_group)
            
            # Extract product if group specified
            if (self.product_group and match.lastindex and 
                match.lastindex >= self.product_group):
                result["product"] = match.group(self.product_group)
            
            return result
            
        except IndexError as e:
            logger.warning(f"Failed to extract version info from pattern '{self.name}': {e}")
            return {"version": None, "vendor": self.vendor, "product": self.product}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert pattern to dictionary."""
        data = self.dict()
        if self.metadata:
            data["metadata"] = asdict(self.metadata)
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "RegexPattern":
        """Create pattern from dictionary."""
        if "metadata" in data and data["metadata"]:
            metadata_dict = data["metadata"]
            # Convert datetime strings back to datetime objects
            if isinstance(metadata_dict.get("created_at"), str):
                metadata_dict["created_at"] = datetime.fromisoformat(metadata_dict["created_at"])
            if isinstance(metadata_dict.get("updated_at"), str):
                metadata_dict["updated_at"] = datetime.fromisoformat(metadata_dict["updated_at"])
            data["metadata"] = PatternMetadata(**metadata_dict)
        
        return cls(**data)


class PatternValidationResult(BaseModel):
    """Result of pattern validation."""
    
    is_valid: bool
    pattern_id: UUID
    pattern_name: str
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    test_results: List[Dict[str, Any]] = Field(default_factory=list)


class PatternManager:
    """Manages regex patterns for version detection."""
    
    def __init__(self, patterns_dir: Optional[Path] = None):
        self.patterns_dir = patterns_dir or Path("patterns")
        self.patterns: Dict[UUID, RegexPattern] = {}
        self.patterns_by_category: Dict[PatternCategory, List[RegexPattern]] = {}
        self.patterns_by_vendor: Dict[str, List[RegexPattern]] = {}
        self._compiled_patterns: Dict[UUID, re.Pattern] = {}
        
        # Initialize category dictionaries
        for category in PatternCategory:
            self.patterns_by_category[category] = []
        
        logger.info(f"Initialized PatternManager with patterns directory: {self.patterns_dir}")
    
    def add_pattern(self, pattern: RegexPattern) -> None:
        """Add a pattern to the manager."""
        try:
            # Validate pattern by compiling it
            compiled = pattern.compile()
            
            # Store pattern
            self.patterns[pattern.id] = pattern
            self._compiled_patterns[pattern.id] = compiled
            
            # Update category index
            if pattern not in self.patterns_by_category[pattern.category]:
                self.patterns_by_category[pattern.category].append(pattern)
            
            # Update vendor index
            vendor_key = pattern.vendor.lower()
            if vendor_key not in self.patterns_by_vendor:
                self.patterns_by_vendor[vendor_key] = []
            if pattern not in self.patterns_by_vendor[vendor_key]:
                self.patterns_by_vendor[vendor_key].append(pattern)
            
            logger.debug(f"Added pattern: {pattern.name} (ID: {pattern.id})")
            
        except Exception as e:
            logger.error(f"Failed to add pattern '{pattern.name}': {e}")
            raise ValidationError(f"Invalid pattern '{pattern.name}': {e}")
    
    def remove_pattern(self, pattern_id: UUID) -> bool:
        """Remove a pattern from the manager."""
        if pattern_id not in self.patterns:
            return False
        
        pattern = self.patterns[pattern_id]
        
        # Remove from main storage
        del self.patterns[pattern_id]
        if pattern_id in self._compiled_patterns:
            del self._compiled_patterns[pattern_id]
        
        # Remove from category index
        if pattern in self.patterns_by_category[pattern.category]:
            self.patterns_by_category[pattern.category].remove(pattern)
        
        # Remove from vendor index
        vendor_key = pattern.vendor.lower()
        if (vendor_key in self.patterns_by_vendor and 
            pattern in self.patterns_by_vendor[vendor_key]):
            self.patterns_by_vendor[vendor_key].remove(pattern)
            
            # Clean up empty vendor list
            if not self.patterns_by_vendor[vendor_key]:
                del self.patterns_by_vendor[vendor_key]
        
        logger.debug(f"Removed pattern: {pattern.name} (ID: {pattern_id})")
        return True
    
    def get_pattern(self, pattern_id: UUID) -> Optional[RegexPattern]:
        """Get a pattern by ID."""
        return self.patterns.get(pattern_id)
    
    def get_patterns_by_category(self, category: PatternCategory) -> List[RegexPattern]:
        """Get all patterns for a specific category."""
        return self.patterns_by_category.get(category, []).copy()
    
    def get_patterns_by_vendor(self, vendor: str) -> List[RegexPattern]:
        """Get all patterns for a specific vendor."""
        vendor_key = vendor.lower()
        return self.patterns_by_vendor.get(vendor_key, []).copy()
    
    def get_enabled_patterns(self, category: Optional[PatternCategory] = None) -> List[RegexPattern]:
        """Get all enabled patterns, optionally filtered by category."""
        if category:
            patterns = self.patterns_by_category.get(category, [])
        else:
            patterns = list(self.patterns.values())
        
        return [p for p in patterns if p.enabled]
    
    def get_compiled_pattern(self, pattern_id: UUID) -> Optional[re.Pattern]:
        """Get compiled regex pattern."""
        return self._compiled_patterns.get(pattern_id)
    
    def validate_pattern(self, pattern: RegexPattern) -> PatternValidationResult:
        """Validate a regex pattern."""
        result = PatternValidationResult(
            is_valid=True,
            pattern_id=pattern.id,
            pattern_name=pattern.name
        )
        
        try:
            # Test pattern compilation
            compiled = pattern.compile()
            
            # Test with metadata test cases if available
            if pattern.metadata and pattern.metadata.test_cases:
                for test_case in pattern.metadata.test_cases:
                    test_string = test_case.get("input", "")
                    expected_version = test_case.get("expected_version")
                    
                    match = compiled.search(test_string)
                    if match:
                        extracted = pattern.extract_version_info(match)
                        test_result = {
                            "input": test_string,
                            "matched": True,
                            "extracted_version": extracted.get("version"),
                            "expected_version": expected_version,
                            "passed": extracted.get("version") == expected_version
                        }
                    else:
                        test_result = {
                            "input": test_string,
                            "matched": False,
                            "extracted_version": None,
                            "expected_version": expected_version,
                            "passed": expected_version is None
                        }
                    
                    result.test_results.append(test_result)
                    
                    if not test_result["passed"]:
                        result.errors.append(
                            f"Test case failed: expected '{expected_version}', "
                            f"got '{test_result['extracted_version']}'"
                        )
            
            # Check for common issues
            if len(pattern.pattern) > 500:
                result.warnings.append("Pattern is very long, may impact performance")
            
            if pattern.priority < 50:
                result.warnings.append("Low priority pattern may not be matched first")
            
            if pattern.confidence < 0.5:
                result.warnings.append("Low confidence pattern may produce unreliable results")
            
        except Exception as e:
            result.is_valid = False
            result.errors.append(str(e))
        
        return result
    
    def load_patterns_from_file(self, file_path: Path) -> int:
        """Load patterns from a JSON or YAML file."""
        if not file_path.exists():
            print(f"[DEBUG] Pattern file not found: {file_path}")
            raise ConfigurationError(f"Pattern file not found: {file_path}")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                if file_path.suffix.lower() in ['.yml', '.yaml']:
                    data = yaml.safe_load(f)
                else:
                    data = json.load(f)
            patterns_data = data.get("patterns", [])
            loaded_count = 0
            for pattern_data in patterns_data:
                try:
                    pattern = RegexPattern.from_dict(pattern_data)
                    self.add_pattern(pattern)
                    loaded_count += 1
                    print(f"[DEBUG] Loaded pattern: {pattern.name}")
                except Exception as e:
                    print(f"[DEBUG] Failed to load pattern from {file_path}: {e}")
                    logger.error(f"Failed to load pattern from {file_path}: {e}")
            logger.info(f"Loaded {loaded_count} patterns from {file_path}")
            return loaded_count
        except Exception as e:
            print(f"[DEBUG] Exception loading patterns from {file_path}: {e}")
            raise ConfigurationError(f"Failed to load patterns from {file_path}: {e}")
    
    def save_patterns_to_file(self, file_path: Path, category: Optional[PatternCategory] = None) -> int:
        """Save patterns to a JSON or YAML file."""
        try:
            if category:
                patterns_to_save = self.get_patterns_by_category(category)
            else:
                patterns_to_save = list(self.patterns.values())
            
            # Convert patterns to dictionaries
            patterns_data = [pattern.to_dict() for pattern in patterns_to_save]
            
            data = {
                "version": "1.0",
                "generated_at": datetime.utcnow().isoformat(),
                "category": category.value if category else "all",
                "count": len(patterns_data),
                "patterns": patterns_data
            }
            
            # Ensure directory exists
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                if file_path.suffix.lower() in ['.yml', '.yaml']:
                    yaml.dump(data, f, default_flow_style=False, indent=2)
                else:
                    json.dump(data, f, indent=2, default=str)
            
            logger.info(f"Saved {len(patterns_data)} patterns to {file_path}")
            return len(patterns_data)
            
        except Exception as e:
            raise ConfigurationError(f"Failed to save patterns to {file_path}: {e}")
    
    def load_patterns_from_directory(self, directory: Optional[Path] = None) -> int:
        """Load all patterns from a directory."""
        patterns_dir = directory or self.patterns_dir
        
        if not patterns_dir.exists():
            logger.warning(f"Patterns directory does not exist: {patterns_dir}")
            return 0
        
        total_loaded = 0
        pattern_files = list(patterns_dir.glob("*.json")) + list(patterns_dir.glob("*.yml")) + list(patterns_dir.glob("*.yaml"))
        
        for file_path in pattern_files:
            try:
                loaded = self.load_patterns_from_file(file_path)
                total_loaded += loaded
            except Exception as e:
                logger.error(f"Failed to load patterns from {file_path}: {e}")
        
        logger.info(f"Loaded {total_loaded} total patterns from {patterns_dir}")
        return total_loaded
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get statistics about loaded patterns."""
        stats = {
            "total_patterns": len(self.patterns),
            "enabled_patterns": len([p for p in self.patterns.values() if p.enabled]),
            "disabled_patterns": len([p for p in self.patterns.values() if not p.enabled]),
            "by_category": {},
            "by_vendor": {},
            "average_confidence": 0.0,
            "priority_distribution": {"high": 0, "medium": 0, "low": 0}
        }
        
        # Category statistics
        for category in PatternCategory:
            category_patterns = self.patterns_by_category[category]
            stats["by_category"][category.value] = {
                "total": len(category_patterns),
                "enabled": len([p for p in category_patterns if p.enabled])
            }
        
        # Vendor statistics
        for vendor, patterns in self.patterns_by_vendor.items():
            stats["by_vendor"][vendor] = {
                "total": len(patterns),
                "enabled": len([p for p in patterns if p.enabled])
            }
        
        # Confidence and priority statistics
        if self.patterns:
            confidences = [p.confidence for p in self.patterns.values()]
            stats["average_confidence"] = sum(confidences) / len(confidences)
            
            for pattern in self.patterns.values():
                if pattern.priority >= 200:
                    stats["priority_distribution"]["high"] += 1
                elif pattern.priority >= 100:
                    stats["priority_distribution"]["medium"] += 1
                else:
                    stats["priority_distribution"]["low"] += 1
        
        return stats
    
    def clear_patterns(self) -> None:
        """Clear all patterns from the manager."""
        self.patterns.clear()
        self._compiled_patterns.clear()
        
        for category in PatternCategory:
            self.patterns_by_category[category].clear()
        
        self.patterns_by_vendor.clear()
        
        logger.info("Cleared all patterns from manager")