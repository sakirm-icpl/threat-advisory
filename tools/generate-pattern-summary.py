#!/usr/bin/env python3
"""
Pattern Summary Generator

This script generates a summary report of all patterns in the database,
including statistics by category, vendor, and other metrics.
"""

import json
import os
from pathlib import Path
from collections import defaultdict

def find_pattern_files(root_dir):
    """Find all pattern files in the repository."""
    pattern_files = []
    patterns_dir = os.path.join(root_dir, 'patterns')
    
    for root, dirs, files in os.walk(patterns_dir):
        for file in files:
            if file.endswith('.json'):
                pattern_files.append(os.path.join(root, file))
    
    return pattern_files

def analyze_patterns(pattern_files):
    """Analyze all patterns and generate statistics."""
    # Statistics counters
    total_patterns = 0
    patterns_by_category = defaultdict(int)
    patterns_by_vendor = defaultdict(int)
    patterns_by_product = defaultdict(int)
    total_test_cases = 0
    patterns_with_test_cases = 0
    
    # Process each pattern file
    for pattern_file in pattern_files:
        with open(pattern_file, 'r') as f:
            try:
                pattern_data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"Error parsing {pattern_file}: {e}")
                continue
        
        # Process each pattern in the file
        for pattern in pattern_data.get('patterns', []):
            total_patterns += 1
            
            # Count by category
            category = pattern.get('category', 'unknown')
            patterns_by_category[category] += 1
            
            # Count by vendor
            vendor = pattern.get('vendor', 'unknown')
            patterns_by_vendor[vendor] += 1
            
            # Count by product
            product = pattern.get('product', 'unknown')
            patterns_by_product[product] += 1
            
            # Count test cases
            test_cases = pattern.get('metadata', {}).get('test_cases', [])
            total_test_cases += len(test_cases)
            if len(test_cases) > 0:
                patterns_with_test_cases += 1
    
    return {
        'total_patterns': total_patterns,
        'patterns_by_category': dict(patterns_by_category),
        'patterns_by_vendor': dict(patterns_by_vendor),
        'patterns_by_product': dict(patterns_by_product),
        'total_test_cases': total_test_cases,
        'patterns_with_test_cases': patterns_with_test_cases
    }

def generate_report(stats):
    """Generate a formatted report from statistics."""
    report = []
    report.append("# Pattern Database Summary")
    report.append("")
    report.append(f"Total Patterns: {stats['total_patterns']}")
    report.append(f"Patterns with Test Cases: {stats['patterns_with_test_cases']}")
    report.append(f"Total Test Cases: {stats['total_test_cases']}")
    report.append("")
    
    # Patterns by category
    report.append("## Patterns by Category")
    report.append("")
    for category, count in sorted(stats['patterns_by_category'].items()):
        report.append(f"- {category}: {count}")
    report.append("")
    
    # Patterns by vendor
    report.append("## Patterns by Vendor")
    report.append("")
    for vendor, count in sorted(stats['patterns_by_vendor'].items()):
        report.append(f"- {vendor}: {count}")
    report.append("")
    
    # Patterns by product
    report.append("## Patterns by Product")
    report.append("")
    for product, count in sorted(stats['patterns_by_product'].items()):
        report.append(f"- {product}: {count}")
    report.append("")
    
    return "\n".join(report)

def main():
    """Main function."""
    # Get the repository root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    
    # Find all pattern files
    pattern_files = find_pattern_files(repo_root)
    
    if not pattern_files:
        print("No pattern files found!")
        return
    
    print(f"Found {len(pattern_files)} pattern files to analyze")
    
    # Analyze patterns
    stats = analyze_patterns(pattern_files)
    
    # Generate report
    report = generate_report(stats)
    
    # Write report to file
    report_file = os.path.join(repo_root, 'PATTERNS_SUMMARY.md')
    with open(report_file, 'w') as f:
        f.write(report)
    
    print(f"Pattern summary written to {report_file}")
    print("\n" + report)

if __name__ == "__main__":
    main()