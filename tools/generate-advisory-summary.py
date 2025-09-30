#!/usr/bin/env python3
"""
Advisory Summary Generator

This script generates a summary report of all advisories in the database,
including statistics by category, severity, and other metrics.
"""

import json
import os
from pathlib import Path
from collections import defaultdict

def find_advisory_files(root_dir):
    """Find all advisory files in the repository."""
    advisory_files = []
    advisories_dir = os.path.join(root_dir, 'advisories')
    
    for root, dirs, files in os.walk(advisories_dir):
        for file in files:
            if file.endswith('.json'):
                advisory_files.append(os.path.join(root, file))
    
    return advisory_files

def analyze_advisories(advisory_files):
    """Analyze all advisories and generate statistics."""
    # Statistics counters
    total_advisories = 0
    advisories_by_category = defaultdict(int)
    advisories_by_severity = defaultdict(int)
    total_references = 0
    advisories_with_references = 0
    
    # Process each advisory file
    for advisory_file in advisory_files:
        with open(advisory_file, 'r') as f:
            try:
                advisory_data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"Error parsing {advisory_file}: {e}")
                continue
        
        # Process each advisory in the file
        for advisory in advisory_data.get('advisories', []):
            total_advisories += 1
            
            # Count by category
            category = advisory.get('category', 'unknown')
            advisories_by_category[category] += 1
            
            # Count by severity
            severity = advisory.get('severity', 'unknown')
            advisories_by_severity[severity] += 1
            
            # Count references
            references = advisory.get('references', [])
            total_references += len(references)
            if len(references) > 0:
                advisories_with_references += 1
    
    return {
        'total_advisories': total_advisories,
        'advisories_by_category': dict(advisories_by_category),
        'advisories_by_severity': dict(advisories_by_severity),
        'total_references': total_references,
        'advisories_with_references': advisories_with_references
    }

def generate_report(stats):
    """Generate a formatted report from statistics."""
    report = []
    report.append("# Advisory Database Summary")
    report.append("")
    report.append(f"Total Advisories: {stats['total_advisories']}")
    report.append(f"Advisories with References: {stats['advisories_with_references']}")
    report.append(f"Total References: {stats['total_references']}")
    report.append("")
    
    # Advisories by category
    report.append("## Advisories by Category")
    report.append("")
    for category, count in sorted(stats['advisories_by_category'].items()):
        report.append(f"- {category}: {count}")
    report.append("")
    
    # Advisories by severity
    report.append("## Advisories by Severity")
    report.append("")
    for severity, count in sorted(stats['advisories_by_severity'].items()):
        report.append(f"- {severity}: {count}")
    report.append("")
    
    return "\n".join(report)

def main():
    """Main function."""
    # Get the repository root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    
    # Find all advisory files
    advisory_files = find_advisory_files(repo_root)
    
    if not advisory_files:
        print("No advisory files found!")
        return
    
    print(f"Found {len(advisory_files)} advisory files to analyze")
    
    # Analyze advisories
    stats = analyze_advisories(advisory_files)
    
    # Generate report
    report = generate_report(stats)
    
    # Write report to file
    report_file = os.path.join(repo_root, 'ADVISORY_SUMMARY.md')
    with open(report_file, 'w') as f:
        f.write(report)
    
    print(f"Advisory summary written to {report_file}")
    print("\n" + report)

if __name__ == "__main__":
    main()