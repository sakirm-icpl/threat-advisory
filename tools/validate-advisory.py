#!/usr/bin/env python3
"""
Advisory Validation Tool

This script validates advisory files against our schema and checks the completeness
of the advisory data.
"""

import json
import re
import sys
import os
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
            raise ValueError(f"Invalid JSON: {e}")
    
    # Validate JSON structure
    validate_json_structure(advisory_data)
    
    # Validate each advisory
    for i, advisory in enumerate(advisory_data['advisories']):
        # Validate references
        validate_references(advisory['references'])
    
    print(f"✓ {file_path} passed all validation checks")
    return True

def main():
    """Main function."""
    if len(sys.argv) < 2:
        print("Usage: python validate-advisory.py <advisory_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found")
        sys.exit(1)
    
    try:
        validate_advisory_file(file_path)
        print("All validations passed!")
    except ValueError as e:
        print(f"Validation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()