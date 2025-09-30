#!/usr/bin/env python3
"""
Pattern Validation Tool

This script validates pattern files against our schema and tests the regex patterns
against provided test cases.
"""

import json
import re
import sys
import os
from pathlib import Path

def validate_json_structure(pattern_data):
    """Validate the JSON structure of a pattern file."""
    required_top_level = ['patterns']
    
    for field in required_top_level:
        if field not in pattern_data:
            raise ValueError(f"Missing required field: {field}")
    
    if not isinstance(pattern_data['patterns'], list):
        raise ValueError("'patterns' must be an array")
    
    for i, pattern in enumerate(pattern_data['patterns']):
        required_fields = [
            'name', 'category', 'pattern', 'vendor', 'product', 
            'version_group', 'priority', 'confidence', 'metadata'
        ]
        
        for field in required_fields:
            if field not in pattern:
                raise ValueError(f"Pattern {i}: Missing required field: {field}")
        
        # Validate metadata
        metadata = pattern['metadata']
        required_metadata = ['author', 'created_at', 'updated_at', 'description', 'tags', 'test_cases']
        
        for field in required_metadata:
            if field not in metadata:
                raise ValueError(f"Pattern {i}: Missing required metadata field: {field}")
        
        # Validate priority (0-200)
        if not (0 <= pattern['priority'] <= 200):
            raise ValueError(f"Pattern {i}: Priority must be between 0 and 200")
        
        # Validate confidence (0.0-1.0)
        if not (0.0 <= pattern['confidence'] <= 1.0):
            raise ValueError(f"Pattern {i}: Confidence must be between 0.0 and 1.0")
        
        # Validate test cases
        if not isinstance(metadata['test_cases'], list):
            raise ValueError(f"Pattern {i}: test_cases must be an array")

def validate_regex_pattern(pattern_str):
    """Validate that a regex pattern compiles correctly."""
    try:
        re.compile(pattern_str)
        return True
    except re.error as e:
        raise ValueError(f"Invalid regex pattern: {e}")

def run_test_cases(pattern_data):
    """Run test cases for all patterns in the file."""
    for i, pattern in enumerate(pattern_data['patterns']):
        pattern_regex = pattern['pattern']
        version_group = pattern['version_group']
        
        # Compile the regex
        try:
            regex = re.compile(pattern_regex)
        except re.error as e:
            raise ValueError(f"Pattern {i}: Failed to compile regex: {e}")
        
        # Run test cases
        for j, test_case in enumerate(pattern['metadata']['test_cases']):
            input_text = test_case['input']
            expected_version = test_case.get('expected_version')
            
            match = regex.search(input_text)
            
            if expected_version is not None:
                # This is a positive test case
                if not match:
                    raise ValueError(f"Pattern {i}, Test Case {j}: Expected match but got none")
                
                if version_group > len(match.groups()):
                    raise ValueError(f"Pattern {i}, Test Case {j}: Version group {version_group} out of range")
                
                actual_version = match.group(version_group)
                if actual_version != expected_version:
                    raise ValueError(f"Pattern {i}, Test Case {j}: Expected version '{expected_version}' but got '{actual_version}'")
            else:
                # This is a negative test case (no match expected)
                if match:
                    raise ValueError(f"Pattern {i}, Test Case {j}: Expected no match but got one")

def validate_pattern_file(file_path):
    """Validate a pattern file."""
    print(f"Validating {file_path}...")
    
    # Load the pattern file
    with open(file_path, 'r') as f:
        try:
            pattern_data = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {e}")
    
    # Validate JSON structure
    validate_json_structure(pattern_data)
    
    # Validate each pattern
    for i, pattern in enumerate(pattern_data['patterns']):
        # Validate regex pattern
        validate_regex_pattern(pattern['pattern'])
    
    # Run test cases
    run_test_cases(pattern_data)
    
    print(f"✓ {file_path} passed all validation checks")
    return True

def main():
    """Main function."""
    if len(sys.argv) < 2:
        print("Usage: python validate-pattern.py <pattern_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found")
        sys.exit(1)
    
    try:
        validate_pattern_file(file_path)
        print("All validations passed!")
    except ValueError as e:
        print(f"Validation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()