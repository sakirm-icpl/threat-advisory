#!/usr/bin/env python3
"""
Validation script for Version Detection Pattern Database.
This script validates JSON files against the expected schema for version detection patterns.
"""

import sys
import json
import re
import os
from jsonschema import validate, ValidationError

# Schema for pattern files
PATTERN_SCHEMA = {
    "type": "object",
    "properties": {
        "patterns": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "category": {"type": "string", "enum": ["web", "networking", "database", "messaging", "other"]},
                    "pattern": {"type": "string"},
                    "vendor": {"type": "string"},
                    "product": {"type": "string"},
                    "version_group": {"type": "integer", "minimum": 1},
                    "priority": {"type": "integer", "minimum": 1, "maximum": 999},
                    "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                    "metadata": {
                        "type": "object",
                        "properties": {
                            "author": {"type": "string"},
                            "created_at": {"type": "string", "format": "date-time"},
                            "updated_at": {"type": "string", "format": "date-time"},
                            "description": {"type": "string"},
                            "tags": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "test_cases": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "input": {"type": "string"},
                                        "expected_version": {"type": "string"}
                                    },
                                    "required": ["input", "expected_version"]
                                }
                            }
                        },
                        "required": ["author", "created_at", "updated_at", "description", "tags", "test_cases"]
                    }
                },
                "required": ["name", "category", "pattern", "vendor", "product", "version_group", "priority", "confidence", "metadata"]
            }
        }
    },
    "required": ["patterns"]
}

def validate_pattern_file(file_path):
    """Validate a pattern JSON file against the schema."""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in {file_path}: {e}")
        return False
    except Exception as e:
        print(f"❌ Error reading {file_path}: {e}")
        return False

    try:
        validate(instance=data, schema=PATTERN_SCHEMA)
        print(f"✅ Schema validation passed for {file_path}")
    except ValidationError as e:
        print(f"❌ Schema validation failed for {file_path}: {e.message}")
        return False
    except Exception as e:
        print(f"❌ Error during schema validation of {file_path}: {e}")
        return False

    # Additional validation: Test regex compilation
    patterns = data.get('patterns', [])
    all_valid = True
    
    for i, pattern in enumerate(patterns):
        try:
            # Try to compile the regex pattern
            re.compile(pattern['pattern'])
            print(f"✅ Regex compilation successful for pattern {i+1}: {pattern['name']}")
        except re.error as e:
            print(f"❌ Invalid regex in pattern {i+1} ({pattern['name']}) in {file_path}: {e}")
            all_valid = False
        
        # Test version group exists in pattern
        try:
            regex = re.compile(pattern['pattern'])
            test_cases = pattern['metadata'].get('test_cases', [])
            
            for j, test_case in enumerate(test_cases):
                try:
                    match = regex.search(test_case['input'])
                    if match:
                        if pattern['version_group'] <= len(match.groups()):
                            extracted_version = match.group(pattern['version_group'])
                            if extracted_version == test_case['expected_version']:
                                print(f"✅ Test case {j+1} passed for pattern {i+1}: {pattern['name']}")
                            else:
                                print(f"❌ Test case {j+1} failed for pattern {i+1}: {pattern['name']}. Expected '{test_case['expected_version']}', got '{extracted_version}'")
                                all_valid = False
                        else:
                            print(f"❌ Test case {j+1} failed for pattern {i+1}: {pattern['name']}. Version group {pattern['version_group']} does not exist in pattern")
                            all_valid = False
                    else:
                        print(f"❌ Test case {j+1} failed for pattern {i+1}: {pattern['name']}. Pattern did not match input")
                        all_valid = False
                except Exception as e:
                    print(f"❌ Error testing test case {j+1} for pattern {i+1}: {pattern['name']}: {e}")
                    all_valid = False
        except Exception as e:
            print(f"❌ Error validating test cases for pattern {i+1}: {pattern['name']}: {e}")
            all_valid = False

    return all_valid

def main():
    """Main function to validate files provided as command line arguments."""
    if len(sys.argv) < 2:
        print("Usage: python validate-pattern.py <file1.json> [file2.json] ...")
        sys.exit(1)

    all_valid = True
    for file_path in sys.argv[1:]:
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            all_valid = False
            continue

        if not validate_pattern_file(file_path):
            all_valid = False

    if all_valid:
        print("\n✅ All files validated successfully!")
        sys.exit(0)
    else:
        print("\n❌ Some files failed validation!")
        sys.exit(1)

if __name__ == "__main__":
    main()