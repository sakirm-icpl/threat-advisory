#!/usr/bin/env python3
"""
Example Integration Script

This script demonstrates how to integrate the CVE Search Client with an existing security tool.
It shows various use cases and integration patterns.
"""

import json
import csv
from datetime import datetime
from cve_search_client import CVESearchClient, print_results


class SecurityToolIntegration:
    """Example integration class for a security tool"""
    
    def __init__(self, cve_server_url="http://localhost:8000"):
        """
        Initialize the security tool integration
        
        Args:
            cve_server_url: URL of the cve-search server
        """
        self.cve_client = CVESearchClient(cve_server_url)
        self.scan_results = []
    
    def scan_software_inventory(self, software_list):
        """
        Scan a list of software for vulnerabilities
        
        Args:
            software_list: List of tuples (vendor, product, version)
            
        Returns:
            Dictionary with scan results
        """
        print("🔍 Starting software vulnerability scan...")
        print("=" * 60)
        
        scan_summary = {
            'total_software': len(software_list),
            'vulnerabilities_found': 0,
            'high_severity': 0,
            'medium_severity': 0,
            'low_severity': 0,
            'scan_timestamp': datetime.now().isoformat(),
            'results': []
        }
        
        for i, (vendor, product, version) in enumerate(software_list, 1):
            print(f"\n[{i}/{len(software_list)}] Scanning {vendor}/{product} (v{version})")
            
            # Search for CVEs
            cve_results = self.cve_client.search_cves_by_vendor_product(vendor, product)
            
            if 'error' in cve_results:
                print(f"❌ Error scanning {vendor}/{product}: {cve_results['error']}")
                continue
            
            # Process results
            software_result = {
                'vendor': vendor,
                'product': product,
                'version': version,
                'cve_count': cve_results.get('total_results', 0),
                'cves': cve_results.get('results', []),
                'high_severity_count': 0,
                'medium_severity_count': 0,
                'low_severity_count': 0
            }
            
            # Count vulnerabilities by severity
            for cve in cve_results.get('results', []):
                scan_summary['vulnerabilities_found'] += 1
                software_result['cve_count'] += 1
                
                severity = cve.get('severity', '').upper()
                if 'HIGH' in severity or 'CRITICAL' in severity:
                    scan_summary['high_severity'] += 1
                    software_result['high_severity_count'] += 1
                elif 'MEDIUM' in severity:
                    scan_summary['medium_severity'] += 1
                    software_result['medium_severity_count'] += 1
                else:
                    scan_summary['low_severity'] += 1
                    software_result['low_severity_count'] += 1
            
            scan_summary['results'].append(software_result)
            
            # Print summary for this software
            if software_result['cve_count'] > 0:
                print(f"   Found {software_result['cve_count']} CVEs")
                print(f"   High: {software_result['high_severity_count']}, "
                      f"Medium: {software_result['medium_severity_count']}, "
                      f"Low: {software_result['low_severity_count']}")
            else:
                print("   No CVEs found")
        
        return scan_summary
    
    def generate_report(self, scan_summary, output_format='json'):
        """
        Generate a vulnerability report
        
        Args:
            scan_summary: Results from scan_software_inventory
            output_format: 'json', 'csv', or 'text'
            
        Returns:
            Report content as string
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if output_format == 'json':
            return self._generate_json_report(scan_summary, timestamp)
        elif output_format == 'csv':
            return self._generate_csv_report(scan_summary, timestamp)
        else:
            return self._generate_text_report(scan_summary, timestamp)
    
    def _generate_json_report(self, scan_summary, timestamp):
        """Generate JSON report"""
        report = {
            'report_metadata': {
                'generated_at': scan_summary['scan_timestamp'],
                'report_id': f"vuln_scan_{timestamp}",
                'total_software_scanned': scan_summary['total_software'],
                'total_vulnerabilities': scan_summary['vulnerabilities_found']
            },
            'summary': {
                'high_severity': scan_summary['high_severity'],
                'medium_severity': scan_summary['medium_severity'],
                'low_severity': scan_summary['low_severity']
            },
            'detailed_results': scan_summary['results']
        }
        
        return json.dumps(report, indent=2)
    
    def _generate_csv_report(self, scan_summary, timestamp):
        """Generate CSV report"""
        from io import StringIO
        
        output = StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            'Vendor', 'Product', 'Version', 'CVE_Count', 
            'High_Severity', 'Medium_Severity', 'Low_Severity'
        ])
        
        # Data rows
        for result in scan_summary['results']:
            writer.writerow([
                result['vendor'],
                result['product'],
                result['version'],
                result['cve_count'],
                result['high_severity_count'],
                result['medium_severity_count'],
                result['low_severity_count']
            ])
        
        return output.getvalue()
    
    def _generate_text_report(self, scan_summary, timestamp):
        """Generate text report"""
        report = f"""
VULNERABILITY SCAN REPORT
Generated: {scan_summary['scan_timestamp']}
Report ID: vuln_scan_{timestamp}

SUMMARY
=======
Total Software Scanned: {scan_summary['total_software']}
Total Vulnerabilities Found: {scan_summary['vulnerabilities_found']}

Severity Breakdown:
- High/Critical: {scan_summary['high_severity']}
- Medium: {scan_summary['medium_severity']}
- Low: {scan_summary['low_severity']}

DETAILED RESULTS
================
"""
        
        for result in scan_summary['results']:
            report += f"""
{result['vendor']}/{result['product']} (v{result['version']})
- Total CVEs: {result['cve_count']}
- High Severity: {result['high_severity_count']}
- Medium Severity: {result['medium_severity_count']}
- Low Severity: {result['low_severity_count']}
"""
            
            # List high severity CVEs
            high_cves = [cve for cve in result['cves'] 
                        if 'HIGH' in cve.get('severity', '').upper() or 
                           'CRITICAL' in cve.get('severity', '').upper()]
            
            if high_cves:
                report += "  High Severity CVEs:\n"
                for cve in high_cves[:5]:  # Show first 5
                    report += f"    - {cve['id']}: {cve['summary'][:80]}...\n"
                if len(high_cves) > 5:
                    report += f"    ... and {len(high_cves) - 5} more\n"
        
        return report
    
    def export_to_security_tool(self, scan_summary, tool_format='nessus'):
        """
        Export results in a format compatible with security tools
        
        Args:
            scan_summary: Results from scan_software_inventory
            tool_format: Target tool format ('nessus', 'openvas', 'custom')
            
        Returns:
            Formatted data for the target tool
        """
        if tool_format == 'nessus':
            return self._format_for_nessus(scan_summary)
        elif tool_format == 'openvas':
            return self._format_for_openvas(scan_summary)
        else:
            return self._format_custom(scan_summary)
    
    def _format_for_nessus(self, scan_summary):
        """Format results for Nessus import"""
        nessus_items = []
        
        for result in scan_summary['results']:
            for cve in result['cves']:
                nessus_item = {
                    'plugin_id': f"CVE_{cve['id']}",
                    'plugin_name': f"Vulnerability: {cve['id']}",
                    'plugin_family': 'Vulnerability Assessment',
                    'severity': self._map_severity_to_nessus(cve.get('severity', '')),
                    'description': cve.get('summary', ''),
                    'solution': 'Update to the latest version',
                    'affected_host': f"{result['vendor']}/{result['product']}",
                    'cvss_score': cve.get('cvss_score', 0),
                    'published_date': cve.get('publish_date', ''),
                    'references': '\n'.join(cve.get('references', []))
                }
                nessus_items.append(nessus_item)
        
        return nessus_items
    
    def _format_for_openvas(self, scan_summary):
        """Format results for OpenVAS import"""
        # Similar to Nessus but with OpenVAS-specific fields
        return self._format_for_nessus(scan_summary)  # Simplified for example
    
    def _format_custom(self, scan_summary):
        """Format results for custom security tool"""
        return {
            'format': 'custom',
            'data': scan_summary,
            'exported_at': datetime.now().isoformat()
        }
    
    def _map_severity_to_nessus(self, severity):
        """Map CVE severity to Nessus severity levels"""
        severity_upper = severity.upper()
        if 'CRITICAL' in severity_upper or 'HIGH' in severity_upper:
            return 4  # Critical
        elif 'MEDIUM' in severity_upper:
            return 2  # Medium
        elif 'LOW' in severity_upper:
            return 1  # Low
        else:
            return 0  # Info


def main():
    """Example usage of the security tool integration"""
    
    # Example software inventory
    software_inventory = [
        ("apache", "http_server", "2.4.41"),
        ("microsoft", "windows", "10.0.19041"),
        ("openssl", "openssl", "1.1.1f"),
        ("nginx", "nginx", "1.18.0"),
        ("mozilla", "firefox", "78.0.2")
    ]
    
    print("🔧 Security Tool Integration Example")
    print("=" * 50)
    
    # Initialize the integration
    security_tool = SecurityToolIntegration("http://localhost:8000")
    
    # Check if CVE server is accessible
    if not security_tool.cve_client.check_server_status():
        print("❌ Warning: cve-search server is not accessible")
        print("   This example will show the structure but may not return real data")
        print("   Please ensure the server is running at http://localhost:8000\n")
    
    # Perform vulnerability scan
    scan_results = security_tool.scan_software_inventory(software_inventory)
    
    # Generate reports
    print("\n📊 Generating Reports...")
    print("-" * 30)
    
    # JSON report
    json_report = security_tool.generate_report(scan_results, 'json')
    print("JSON Report (first 500 chars):")
    print(json_report[:500] + "..." if len(json_report) > 500 else json_report)
    
    print("\n" + "="*50)
    
    # Text report
    text_report = security_tool.generate_report(scan_results, 'text')
    print("Text Report:")
    print(text_report)
    
    # Export to security tool
    print("\n🔌 Exporting to Security Tools...")
    print("-" * 30)
    
    nessus_data = security_tool.export_to_security_tool(scan_results, 'nessus')
    print(f"Nessus Export: {len(nessus_data)} vulnerability items")
    
    # Save reports to files
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    with open(f"vulnerability_scan_{timestamp}.json", 'w') as f:
        f.write(json_report)
    
    with open(f"vulnerability_scan_{timestamp}.txt", 'w') as f:
        f.write(text_report)
    
    print(f"\n✅ Reports saved:")
    print(f"   - vulnerability_scan_{timestamp}.json")
    print(f"   - vulnerability_scan_{timestamp}.txt")


if __name__ == "__main__":
    main() 