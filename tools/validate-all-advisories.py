#!/usr/bin/env python3
"""
Validate All Advisories Tool

This script validates all advisory files in the repository against our schema 
and checks the completeness of the advisory data.
"""

import json
import re
import os
import sys
from pathlib import Path
from urllib.parse import urlparse

def validate_json_structure(advisory_data):
    """Validate the JSON structure of an advisory file."""
    required_top_level = ['advisories']
    
    for field in required_top_level:
        if field not in advisory_data:
            raise ValueError(f"Missing required field: {field}")
    
    if not isinstance(advisory_data['advisories'], list):
        raise ValueError("'advisories' must be an array")
    
    for i, advisory in enumerate(advisory_data['advisories']):
        required_fields = [
            'id', 'title', 'severity', 'category', 'affected_products', 
            'description', 'impact', 'recommendations', 'references',
            'published_date', 'last_updated', 'metadata'
        ]
        
        for field in required_fields:
            if field not in advisory:
                raise ValueError(f"Advisory {i}: Missing required field: {field}")
        
        # Validate metadata
        metadata = advisory['metadata']
        required_metadata = ['author', 'tags']
        
        for field in required_metadata:
            if field not in metadata:
                raise ValueError(f"Advisory {i}: Missing required metadata field: {field}")
        
        # Validate severity
        valid_severities = ['low', 'medium', 'high', 'critical']
        if advisory['severity'] not in valid_severities:
            raise ValueError(f"Advisory {i}: Severity must be one of {valid_severities}")
        
        # Validate category
        valid_categories = ['cve', 'malware', 'apt', 'vulnerability', 'threat']
        if advisory['category'] not in valid_categories:
            raise ValueError(f"Advisory {i}: Category must be one of {valid_categories}")
        
        # Validate affected_products
        if not isinstance(advisory['affected_products'], list):
            raise ValueError(f"Advisory {i}: affected_products must be an array")
        
        # Validate recommendations
        if not isinstance(advisory['recommendations'], list):
            raise ValueError(f"Advisory {i}: recommendations must be an array")
        
        # Validate references
        if not isinstance(advisory['references'], list):
            raise ValueError(f"Advisory {i}: references must be an array")
        
        # Validate dates
        date_pattern = r'^\d{4}-\d{2}-\d{2}$'
        if not re.match(date_pattern, advisory['published_date']):
            raise ValueError(f"Advisory {i}: published_date must be in YYYY-MM-DD format")
        
        if not re.match(date_pattern, advisory['last_updated']):
            raise ValueError(f"Advisory {i}: last_updated must be in YYYY-MM-DD format")

def validate_references(references):
    """Validate that reference URLs are properly formatted."""
    for i, reference in enumerate(references):
        try:
            result = urlparse(reference)
            if not all([result.scheme, result.netloc]):
                raise ValueError(f"Reference {i}: Invalid URL format")
        except Exception as e:
            raise ValueError(f"Reference {i}: Invalid URL format - {e}")

def validate_advisory_file(file_path):
    """Validate an advisory file."""
    print(f"Validating {file_path}...")
    
    # Load the advisory file
    with open(file_path, 'r') as f:
        try:
            advisory_data = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in {file_path}: {e}")
    
    # Validate JSON structure
    validate_json_structure(advisory_data)
    
    # Validate each advisory
    for i, advisory in enumerate(advisory_data['advisories']):
        # Validate references
        validate_references(advisory['references'])
    
    print(f"✓ {file_path} passed all validation checks")
    return True

def find_advisory_files(root_dir):
    """Find all advisory files in the repository."""
    advisory_files = []
    advisories_dir = os.path.join(root_dir, 'advisories')
    
    for root, dirs, files in os.walk(advisories_dir):
        for file in files:
            if file.endswith('.json'):
                advisory_files.append(os.path.join(root, file))
    
    return advisory_files

def main():
    """Main function."""
    # Get the repository root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    
    # Find all advisory files
    advisory_files = find_advisory_files(repo_root)
    
    if not advisory_files:
        print("No advisory files found!")
        sys.exit(1)
    
    print(f"Found {len(advisory_files)} advisory files to validate")
    
    # Validate each advisory file
    failed_files = []
    for advisory_file in advisory_files:
        try:
            validate_advisory_file(advisory_file)
        except ValueError as e:
            print(f"✗ Validation failed for {advisory_file}: {e}")
            failed_files.append(advisory_file)
    
    # Summary
    if failed_files:
        print(f"\nValidation failed for {len(failed_files)} files:")
        for file in failed_files:
            print(f"  - {file}")
        sys.exit(1)
    else:
        print(f"\nAll {len(advisory_files)} advisory files passed validation!")
        sys.exit(0)

if __name__ == "__main__":
    main()