#!/usr/bin/env python3
"""
Pattern Validation Script

This script helps community members validate their service detection patterns
before submitting them to the VersionIntel repository.

Usage:
    python validate-pattern.py <pattern-file.json> [test-response]
    
Example:
    python validate-pattern.py my-pattern.json
    python validate-pattern.py my-pattern.json "SSH-2.0-OpenSSH_8.2p1"
"""

import json
import re
import sys
import argparse
from pathlib import Path

def load_pattern_file(file_path):
    """Load and parse the pattern JSON file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in {file_path}")
        print(f"   {str(e)}")
        return None
    except FileNotFoundError:
        print(f"❌ Error: File {file_path} not found")
        return None

def validate_pattern_structure(pattern_data):
    """Validate the structure of the pattern file."""
    if not isinstance(pattern_data, dict):
        print("❌ Error: Pattern file must be a JSON object")
        return False
    
    if 'patterns' not in pattern_data:
        print("❌ Error: Missing 'patterns' key in pattern file")
        return False
    
    if not isinstance(pattern_data['patterns'], list):
        print("❌ Error: 'patterns' must be an array")
        return False
    
    for i, pattern in enumerate(pattern_data['patterns']):
        # Check required fields
        required_fields = ['name', 'category', 'pattern', 'vendor', 'product', 
                          'version_group', 'priority', 'confidence', 'metadata']
        for field in required_fields:
            if field not in pattern:
                print(f"❌ Error: Pattern {i} missing required field '{field}'")
                return False
        
        # Check metadata required fields
        metadata = pattern['metadata']
        required_metadata = ['author', 'created_at', 'updated_at', 'description', 
                           'tags', 'test_cases']
        for field in required_metadata:
            if field not in metadata:
                print(f"❌ Error: Pattern {i} metadata missing required field '{field}'")
                return False
    
    return True

def test_pattern(pattern, test_input):
    """Test a pattern against a test input."""
    try:
        regex = re.compile(pattern['pattern'])
        match = regex.search(test_input)
        
        if match:
            try:
                version = match.group(pattern['version_group'])
                return True, version
            except IndexError:
                return False, f"Version group {pattern['version_group']} not found in match"
        else:
            return False, "No match found"
    except re.error as e:
        return False, f"Invalid regex pattern: {str(e)}"

def run_test_cases(pattern):
    """Run all test cases for a pattern."""
    print(f"\n🧪 Testing pattern: {pattern['name']}")
    print(f"   Pattern: {pattern['pattern']}")
    print(f"   Vendor: {pattern['vendor']}")
    print(f"   Product: {pattern['product']}")
    
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(pattern['metadata']['test_cases']):
        input_text = test_case['input']
        expected = test_case['expected_version']
        
        success, result = test_pattern(pattern, input_text)
        
        if success and result == expected:
            print(f"   ✅ Test {i+1}: PASS")
            passed += 1
        else:
            print(f"   ❌ Test {i+1}: FAIL")
            print(f"      Input: {input_text}")
            print(f"      Expected: {expected}")
            print(f"      Got: {result}")
            failed += 1
    
    return passed, failed

def validate_json_syntax(file_path):
    """Validate JSON syntax of the file."""
    try:
        with open(file_path, 'r') as f:
            json.load(f)
        return True
    except json.JSONDecodeError as e:
        print(f"❌ JSON Syntax Error in {file_path}:")
        print(f"   {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Validate VersionIntel service detection patterns')
    parser.add_argument('pattern_file', help='Path to the pattern JSON file')
    parser.add_argument('test_response', nargs='?', help='Optional test response string')
    
    args = parser.parse_args()
    
    print("🔍 VersionIntel Pattern Validation Tool")
    print("=" * 40)
    
    # Validate JSON syntax
    if not validate_json_syntax(args.pattern_file):
        sys.exit(1)
    
    # Load pattern file
    pattern_data = load_pattern_file(args.pattern_file)
    if pattern_data is None:
        sys.exit(1)
    
    # Validate structure
    if not validate_pattern_structure(pattern_data):
        sys.exit(1)
    
    print(f"✅ JSON syntax is valid")
    print(f"✅ Pattern structure is valid")
    
    # If a test response was provided, test it
    if args.test_response:
        print(f"\n🔍 Testing custom response: {args.test_response}")
        for pattern in pattern_data['patterns']:
            success, result = test_pattern(pattern, args.test_response)
            if success:
                print(f"   ✅ Match found: {result}")
            else:
                print(f"   ❌ {result}")
    
    # Run test cases
    total_passed = 0
    total_failed = 0
    
    for pattern in pattern_data['patterns']:
        passed, failed = run_test_cases(pattern)
        total_passed += passed
        total_failed += failed
    
    # Summary
    print("\n" + "=" * 40)
    print("📋 VALIDATION SUMMARY")
    print("=" * 40)
    print(f"✅ Passed: {total_passed}")
    print(f"❌ Failed: {total_failed}")
    print(f"📊 Total:  {total_passed + total_failed}")
    
    if total_failed == 0:
        print("\n🎉 All tests passed! Your pattern is ready for submission.")
        return 0
    else:
        print(f"\n⚠️  {total_failed} test(s) failed. Please review your pattern.")
        return 1

if __name__ == "__main__":
    sys.exit(main())