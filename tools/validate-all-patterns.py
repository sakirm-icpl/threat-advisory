#!/usr/bin/env python3
"""
Validate All Patterns Tool

This script validates all pattern files in the repository against our schema 
and tests the regex patterns against provided test cases.
"""

import json
import re
import os
import sys
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

def run_test_cases(pattern_data, file_path):
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
                    raise ValueError(f"File {file_path}, Pattern {i}, Test Case {j}: Expected match but got none")
                
                if version_group > len(match.groups()):
                    raise ValueError(f"File {file_path}, Pattern {i}, Test Case {j}: Version group {version_group} out of range")
                
                actual_version = match.group(version_group)
                if actual_version != expected_version:
                    raise ValueError(f"File {file_path}, Pattern {i}, Test Case {j}: Expected version '{expected_version}' but got '{actual_version}'")
            else:
                # This is a negative test case (no match expected)
                if match:
                    raise ValueError(f"File {file_path}, Pattern {i}, Test Case {j}: Expected no match but got one")

def validate_pattern_file(file_path):
    """Validate a pattern file."""
    print(f"Validating {file_path}...")
    
    # Load the pattern file
    with open(file_path, 'r') as f:
        try:
            pattern_data = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in {file_path}: {e}")
    
    # Validate JSON structure
    validate_json_structure(pattern_data)
    
    # Validate each pattern
    for i, pattern in enumerate(pattern_data['patterns']):
        # Validate regex pattern
        validate_regex_pattern(pattern['pattern'])
    
    # Run test cases
    run_test_cases(pattern_data, file_path)
    
    print(f"✓ {file_path} passed all validation checks")
    return True

def find_pattern_files(root_dir):
    """Find all pattern files in the repository."""
    pattern_files = []
    patterns_dir = os.path.join(root_dir, 'patterns')
    
    for root, dirs, files in os.walk(patterns_dir):
        for file in files:
            if file.endswith('.json'):
                pattern_files.append(os.path.join(root, file))
    
    return pattern_files

def main():
    """Main function."""
    # Get the repository root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    
    # Find all pattern files
    pattern_files = find_pattern_files(repo_root)
    
    if not pattern_files:
        print("No pattern files found!")
        sys.exit(1)
    
    print(f"Found {len(pattern_files)} pattern files to validate")
    
    # Validate each pattern file
    failed_files = []
    for pattern_file in pattern_files:
        try:
            validate_pattern_file(pattern_file)
        except ValueError as e:
            print(f"✗ Validation failed for {pattern_file}: {e}")
            failed_files.append(pattern_file)
    
    # Summary
    if failed_files:
        print(f"\nValidation failed for {len(failed_files)} files:")
        for file in failed_files:
            print(f"  - {file}")
        sys.exit(1)
    else:
        print(f"\nAll {len(pattern_files)} pattern files passed validation!")
        sys.exit(0)

if __name__ == "__main__":
    main()