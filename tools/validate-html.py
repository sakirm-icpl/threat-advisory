#!/usr/bin/env python3
"""
HTML Validation Script for Version Detection Pattern Database Documentation

This script validates HTML files in the docs directory to ensure all links work
and the site structure is correct.
"""

import os
import re
from pathlib import Path
from urllib.parse import urlparse
import json

def validate_html_files():
    """Validate all HTML files in the docs directory"""
    docs_dir = Path("docs")
    html_files = list(docs_dir.rglob("*.html"))
    
    print(f"Found {len(html_files)} HTML files to validate")
    
    all_links = []
    broken_links = []
    
    # Check each HTML file
    for html_file in html_files:
        print(f"\nValidating {html_file}")
        
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for internal links
        internal_links = re.findall(r'href="([^"]+)"', content)
        
        for link in internal_links:
            # Skip external links
            if link.startswith('http'):
                continue
                
            # Skip anchor links
            if link.startswith('#'):
                continue
                
            # Resolve relative paths
            if link.startswith('../'):
                # Go up one directory from docs/community to docs
                target_path = docs_dir / link[3:]  # Remove ../ prefix
            else:
                # Relative to current file's directory
                target_path = html_file.parent / link
            
            # Check if file exists
            if not target_path.exists():
                broken_links.append({
                    'file': str(html_file),
                    'link': link,
                    'target': str(target_path)
                })
                print(f"  ❌ Broken link: {link} -> {target_path}")
            else:
                print(f"  ✅ Valid link: {link}")
    
    # Summary
    print(f"\n\nValidation Summary:")
    print(f"Total HTML files checked: {len(html_files)}")
    print(f"Broken links found: {len(broken_links)}")
    
    if broken_links:
        print("\nBroken Links:")
        for link_info in broken_links:
            print(f"  In {link_info['file']}: {link_info['link']} -> {link_info['target']}")
        return False
    else:
        print("\n✅ All links are valid!")
        return True

if __name__ == "__main__":
    success = validate_html_files()
    exit(0 if success else 1)