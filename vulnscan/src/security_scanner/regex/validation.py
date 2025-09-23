"""Pattern validation framework with comprehensive test cases."""

import re
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from pathlib import Path

from .patterns import RegexPattern, PatternManager, PatternValidationResult
from ..core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class ValidationTestCase:
    """Test case for pattern validation."""
    
    input_text: str
    expected_version: Optional[str]
    expected_vendor: Optional[str] = None
    expected_product: Optional[str] = None
    should_match: bool = True
    description: Optional[str] = None


@dataclass
class ValidationSuite:
    """Collection of validation test cases for a pattern category."""
    
    category: str
    description: str
    test_cases: List[ValidationTestCase]


class PatternValidator:
    """Validates regex patterns against test cases and common issues."""
    
    def __init__(self):
        self.common_issues = [
            self._check_catastrophic_backtracking,
            self._check_overly_broad_patterns,
            self._check_missing_anchors,
            self._check_inefficient_quantifiers,
            self._check_unicode_issues,
        ]
    
    def validate_pattern(self, pattern: RegexPattern, 
                        additional_tests: Optional[List[ValidationTestCase]] = None) -> PatternValidationResult:
        """Comprehensive pattern validation."""
        result = PatternValidationResult(
            is_valid=True,
            pattern_id=pattern.id,
            pattern_name=pattern.name
        )
        
        try:
            # Compile pattern
            compiled_pattern = pattern.compile()
            
            # Run built-in test cases
            if pattern.metadata and pattern.metadata.test_cases:
                self._run_metadata_tests(pattern, compiled_pattern, result)
            
            # Run additional test cases
            if additional_tests:
                self._run_additional_tests(pattern, compiled_pattern, additional_tests, result)
            
            # Check for common issues
            self._check_common_issues(pattern, compiled_pattern, result)
            
            # Performance checks
            self._check_performance_issues(pattern, result)
            
        except Exception as e:
            result.is_valid = False
            result.errors.append(f"Pattern compilation failed: {e}")
        
        return result
    
    def _run_metadata_tests(self, pattern: RegexPattern, compiled_pattern: re.Pattern, 
                           result: PatternValidationResult) -> None:
        """Run test cases from pattern metadata."""
        for test_case in pattern.metadata.test_cases:
            test_input = test_case.get("input", "")
            expected_version = test_case.get("expected_version")
            
            match = compiled_pattern.search(test_input)
            
            if match:
                extracted = pattern.extract_version_info(match)
                test_result = {
                    "input": test_input,
                    "matched": True,
                    "extracted_version": extracted.get("version"),
                    "extracted_vendor": extracted.get("vendor"),
                    "extracted_product": extracted.get("product"),
                    "expected_version": expected_version,
                    "passed": extracted.get("version") == expected_version,
                    "match_start": match.start(),
                    "match_end": match.end(),
                    "matched_text": match.group(0)
                }
            else:
                test_result = {
                    "input": test_input,
                    "matched": False,
                    "extracted_version": None,
                    "extracted_vendor": None,
                    "extracted_product": None,
                    "expected_version": expected_version,
                    "passed": expected_version is None,
                    "match_start": None,
                    "match_end": None,
                    "matched_text": None
                }
            
            result.test_results.append(test_result)
            
            if not test_result["passed"]:
                result.errors.append(
                    f"Test case failed for input '{test_input}': "
                    f"expected '{expected_version}', got '{test_result['extracted_version']}'"
                )
    
    def _run_additional_tests(self, pattern: RegexPattern, compiled_pattern: re.Pattern,
                             test_cases: List[ValidationTestCase], 
                             result: PatternValidationResult) -> None:
        """Run additional validation test cases."""
        for test_case in test_cases:
            match = compiled_pattern.search(test_case.input_text)
            
            if match:
                extracted = pattern.extract_version_info(match)
                passed = (
                    extracted.get("version") == test_case.expected_version and
                    (test_case.expected_vendor is None or 
                     extracted.get("vendor") == test_case.expected_vendor) and
                    (test_case.expected_product is None or 
                     extracted.get("product") == test_case.expected_product)
                )
            else:
                passed = not test_case.should_match
            
            test_result = {
                "input": test_case.input_text,
                "matched": match is not None,
                "expected_match": test_case.should_match,
                "passed": passed,
                "description": test_case.description
            }
            
            if match:
                extracted = pattern.extract_version_info(match)
                test_result.update({
                    "extracted_version": extracted.get("version"),
                    "extracted_vendor": extracted.get("vendor"),
                    "extracted_product": extracted.get("product"),
                    "expected_version": test_case.expected_version,
                    "expected_vendor": test_case.expected_vendor,
                    "expected_product": test_case.expected_product
                })
            
            result.test_results.append(test_result)
            
            if not passed:
                result.errors.append(
                    f"Additional test failed: {test_case.description or test_case.input_text}"
                )
    
    def _check_common_issues(self, pattern: RegexPattern, compiled_pattern: re.Pattern,
                           result: PatternValidationResult) -> None:
        """Check for common regex issues."""
        for check_func in self.common_issues:
            try:
                check_func(pattern, compiled_pattern, result)
            except Exception as e:
                result.warnings.append(f"Issue check failed: {e}")
    
    def _check_catastrophic_backtracking(self, pattern: RegexPattern, compiled_pattern: re.Pattern,
                                       result: PatternValidationResult) -> None:
        """Check for potential catastrophic backtracking."""
        pattern_str = pattern.pattern
        
        # Look for nested quantifiers
        nested_quantifiers = re.findall(r'\([^)]*[*+?][^)]*\)[*+?]', pattern_str)
        if nested_quantifiers:
            result.warnings.append(
                f"Potential catastrophic backtracking: nested quantifiers found: {nested_quantifiers}"
            )
        
        # Look for alternation with overlapping patterns
        if '|' in pattern_str and ('.*' in pattern_str or '.+' in pattern_str):
            result.warnings.append(
                "Potential performance issue: alternation with greedy quantifiers"
            )
    
    def _check_overly_broad_patterns(self, pattern: RegexPattern, compiled_pattern: re.Pattern,
                                   result: PatternValidationResult) -> None:
        """Check for overly broad patterns that might cause false positives."""
        pattern_str = pattern.pattern
        
        # Check for patterns that are too generic
        if pattern_str.count('.') > 5 and ('*' in pattern_str or '+' in pattern_str):
            result.warnings.append(
                "Pattern may be too broad and could cause false positives"
            )
        
        # Check for missing word boundaries
        if not any(anchor in pattern_str for anchor in [r'\b', '^', '$', r'\A', r'\Z']):
            if len(pattern_str) < 20:  # Only warn for short patterns
                result.warnings.append(
                    "Consider adding word boundaries or anchors to prevent partial matches"
                )
    
    def _check_missing_anchors(self, pattern: RegexPattern, compiled_pattern: re.Pattern,
                             result: PatternValidationResult) -> None:
        """Check if patterns should have anchors."""
        pattern_str = pattern.pattern
        
        # For version patterns, suggest anchoring if not present
        if ('version' in pattern.name.lower() or 'v' in pattern_str.lower()):
            if not any(anchor in pattern_str for anchor in [r'\b', '^', '$']):
                result.warnings.append(
                    "Version patterns often benefit from word boundaries or anchors"
                )
    
    def _check_inefficient_quantifiers(self, pattern: RegexPattern, compiled_pattern: re.Pattern,
                                     result: PatternValidationResult) -> None:
        """Check for inefficient quantifier usage."""
        pattern_str = pattern.pattern
        
        # Look for .* followed by specific characters (should use non-greedy)
        if re.search(r'\.\*[^?][a-zA-Z0-9]', pattern_str):
            result.warnings.append(
                "Consider using non-greedy quantifiers (.*?) for better performance"
            )
        
        # Look for repeated character classes that could be simplified
        repeated_classes = re.findall(r'(\[[^\]]+\])\+?\1', pattern_str)
        if repeated_classes:
            result.warnings.append(
                f"Repeated character classes could be simplified: {repeated_classes}"
            )
    
    def _check_unicode_issues(self, pattern: RegexPattern, compiled_pattern: re.Pattern,
                            result: PatternValidationResult) -> None:
        """Check for potential Unicode handling issues."""
        pattern_str = pattern.pattern
        
        # Check if pattern handles Unicode properly
        if any(ord(c) > 127 for c in pattern_str):
            if not (pattern.flags & re.UNICODE):
                result.warnings.append(
                    "Pattern contains non-ASCII characters but doesn't use UNICODE flag"
                )
        
        # Check for \w usage which might not match Unicode word characters
        if r'\w' in pattern_str and not (pattern.flags & re.UNICODE):
            result.warnings.append(
                r"Using \w without UNICODE flag may not match international characters"
            )
    
    def _check_performance_issues(self, pattern: RegexPattern, result: PatternValidationResult) -> None:
        """Check for potential performance issues."""
        pattern_str = pattern.pattern
        
        # Very long patterns
        if len(pattern_str) > 200:
            result.warnings.append(
                f"Very long pattern ({len(pattern_str)} chars) may impact performance"
            )
        
        # High complexity patterns
        complexity_indicators = [
            ('(?:', pattern_str.count('(?:')),
            ('|', pattern_str.count('|')),
            ('[', pattern_str.count('[')),
            ('*', pattern_str.count('*')),
            ('+', pattern_str.count('+')),
        ]
        
        total_complexity = sum(count for _, count in complexity_indicators)
        if total_complexity > 20:
            result.warnings.append(
                f"High pattern complexity ({total_complexity}) may impact performance"
            )
        
        # Low confidence patterns
        if pattern.confidence < 0.5:
            result.warnings.append(
                f"Low confidence ({pattern.confidence}) may produce unreliable results"
            )


def create_http_header_test_suite() -> ValidationSuite:
    """Create test suite for HTTP header patterns."""
    return ValidationSuite(
        category="http_headers",
        description="Test cases for HTTP header version detection",
        test_cases=[
            # Apache HTTP Server
            ValidationTestCase(
                input_text="Server: Apache/2.4.41 (Ubuntu)",
                expected_version="2.4.41",
                expected_vendor="Apache",
                expected_product="HTTP Server",
                description="Standard Apache server header"
            ),
            ValidationTestCase(
                input_text="Server: Apache/2.2.22 (Debian)",
                expected_version="2.2.22",
                description="Older Apache version"
            ),
            ValidationTestCase(
                input_text="Server: Apache",
                expected_version=None,
                should_match=False,
                description="Apache without version should not match version patterns"
            ),
            
            # Nginx
            ValidationTestCase(
                input_text="Server: nginx/1.18.0",
                expected_version="1.18.0",
                expected_vendor="Nginx",
                expected_product="Web Server",
                description="Standard Nginx server header"
            ),
            ValidationTestCase(
                input_text="Server: nginx/1.14.2 (Ubuntu)",
                expected_version="1.14.2",
                description="Nginx with OS info"
            ),
            
            # Microsoft IIS
            ValidationTestCase(
                input_text="Server: Microsoft-IIS/10.0",
                expected_version="10.0",
                expected_vendor="Microsoft",
                expected_product="IIS",
                description="IIS server header"
            ),
            
            # PHP
            ValidationTestCase(
                input_text="X-Powered-By: PHP/7.4.3",
                expected_version="7.4.3",
                expected_vendor="PHP",
                expected_product="PHP",
                description="PHP version in X-Powered-By header"
            ),
            ValidationTestCase(
                input_text="X-Powered-By: PHP/8.1.2-1ubuntu2.14",
                expected_version="8.1.2",
                description="PHP with package version info"
            ),
            
            # Edge cases
            ValidationTestCase(
                input_text="Server: CustomServer/1.0",
                expected_version=None,
                should_match=False,
                description="Unknown server should not match known patterns"
            ),
            ValidationTestCase(
                input_text="",
                expected_version=None,
                should_match=False,
                description="Empty string should not match"
            ),
        ]
    )


def create_service_banner_test_suite() -> ValidationSuite:
    """Create test suite for service banner patterns."""
    return ValidationSuite(
        category="service_banners",
        description="Test cases for service banner version detection",
        test_cases=[
            # SSH
            ValidationTestCase(
                input_text="SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5",
                expected_version="8.2p1",
                expected_vendor="OpenBSD",
                expected_product="OpenSSH",
                description="OpenSSH banner with Ubuntu info"
            ),
            ValidationTestCase(
                input_text="SSH-2.0-OpenSSH_7.4",
                expected_version="7.4",
                description="Simple OpenSSH banner"
            ),
            
            # MySQL
            ValidationTestCase(
                input_text="5.7.37-0ubuntu0.18.04.1-MySQL",
                expected_version="5.7.37",
                expected_vendor="Oracle",
                expected_product="MySQL",
                description="MySQL version string"
            ),
            ValidationTestCase(
                input_text="8.0.32-MySQL",
                expected_version="8.0.32",
                description="MySQL 8.x version"
            ),
            
            # PostgreSQL
            ValidationTestCase(
                input_text="PostgreSQL 13.7 on x86_64-pc-linux-gnu",
                expected_version="13.7",
                expected_vendor="PostgreSQL",
                expected_product="PostgreSQL",
                description="PostgreSQL with platform info"
            ),
            ValidationTestCase(
                input_text="PostgreSQL 14.5",
                expected_version="14.5",
                description="Simple PostgreSQL version"
            ),
            
            # FTP
            ValidationTestCase(
                input_text="220 (vsFTPd 3.0.3)",
                expected_version="3.0.3",
                expected_vendor="vsftpd",
                expected_product="vsftpd",
                description="vsftpd banner"
            ),
            ValidationTestCase(
                input_text="220 Welcome to vsftpd 2.3.5",
                expected_version="2.3.5",
                description="vsftpd welcome message"
            ),
            
            # SMTP
            ValidationTestCase(
                input_text="220 mail.example.com ESMTP Postfix (3.4.13)",
                expected_version="3.4.13",
                expected_vendor="Postfix",
                expected_product="Postfix",
                description="Postfix SMTP banner with version"
            ),
            ValidationTestCase(
                input_text="220 server ESMTP Postfix",
                expected_version=None,
                description="Postfix without version"
            ),
        ]
    )


def run_comprehensive_validation(manager: PatternManager) -> Dict[str, Any]:
    """Run comprehensive validation on all patterns in manager."""
    validator = PatternValidator()
    results = {
        "total_patterns": len(manager.patterns),
        "valid_patterns": 0,
        "invalid_patterns": 0,
        "patterns_with_warnings": 0,
        "total_errors": 0,
        "total_warnings": 0,
        "pattern_results": [],
        "summary": {}
    }
    
    # Create test suites
    test_suites = {
        "http_headers": create_http_header_test_suite(),
        "service_banners": create_service_banner_test_suite(),
    }
    
    for pattern in manager.patterns.values():
        # Get appropriate test suite
        additional_tests = None
        if pattern.category.value in test_suites:
            additional_tests = test_suites[pattern.category.value].test_cases
        
        # Validate pattern
        validation_result = validator.validate_pattern(pattern, additional_tests)
        
        # Update counters
        if validation_result.is_valid:
            results["valid_patterns"] += 1
        else:
            results["invalid_patterns"] += 1
        
        if validation_result.warnings:
            results["patterns_with_warnings"] += 1
        
        results["total_errors"] += len(validation_result.errors)
        results["total_warnings"] += len(validation_result.warnings)
        
        # Store result
        results["pattern_results"].append({
            "pattern_id": str(validation_result.pattern_id),
            "pattern_name": validation_result.pattern_name,
            "is_valid": validation_result.is_valid,
            "error_count": len(validation_result.errors),
            "warning_count": len(validation_result.warnings),
            "test_count": len(validation_result.test_results),
            "passed_tests": len([t for t in validation_result.test_results if t.get("passed", False)]),
            "errors": validation_result.errors,
            "warnings": validation_result.warnings
        })
    
    # Generate summary
    results["summary"] = {
        "validation_success_rate": results["valid_patterns"] / results["total_patterns"] if results["total_patterns"] > 0 else 0,
        "average_errors_per_pattern": results["total_errors"] / results["total_patterns"] if results["total_patterns"] > 0 else 0,
        "average_warnings_per_pattern": results["total_warnings"] / results["total_patterns"] if results["total_patterns"] > 0 else 0,
    }
    
    return results