# Advisory Template

Use this template when creating new advisory files for the database.

```json
{
  "advisories": [
    {
      "id": "THREAT-YYYY-XXXX",
      "title": "Advisory Title",
      "severity": "medium",
      "category": "vulnerability",
      "affected_products": ["Product A", "Product B"],
      "description": "Detailed description of the threat or vulnerability",
      "impact": "Potential impact of the threat",
      "recommendations": ["Recommendation 1", "Recommendation 2"],
      "references": ["https://example.com/reference1", "https://example.com/reference2"],
      "published_date": "YYYY-MM-DD",
      "last_updated": "YYYY-MM-DD",
      "metadata": {
        "author": "Your Name",
        "tags": ["tag1", "tag2", "tag3"],
        "cvss_score": 5.0
      }
    }
  ]
}
```

## Field Descriptions

| Field | Description | Required |
|-------|-------------|----------|
| `id` | Unique identifier for the advisory (THREAT-YYYY-XXXX format) | Yes |
| `title` | Descriptive title for the advisory | Yes |
| `severity` | Severity level (low, medium, high, critical) | Yes |
| `category` | Category of the advisory (cve, malware, apt, vulnerability, threat) | Yes |
| `affected_products` | Array of affected products or systems | Yes |
| `description` | Detailed description of the threat or vulnerability | Yes |
| `impact` | Potential impact of the threat | Yes |
| `recommendations` | Array of recommended actions | Yes |
| `references` | Array of reference URLs | Yes |
| `published_date` | Publication date in ISO 8601 format (YYYY-MM-DD) | Yes |
| `last_updated` | Last update date in ISO 8601 format (YYYY-MM-DD) | Yes |
| `metadata.author` | The advisory creator's name or handle | Yes |
| `metadata.tags` | Relevant tags to help with searching and categorization | Yes |
| `metadata.cvss_score` | CVSS score (0.0-10.0) for vulnerability advisories | No |

## Example Advisory

```json
{
  "advisories": [
    {
      "id": "THREAT-2024-001",
      "title": "Critical Remote Code Execution Vulnerability in WebServer Pro",
      "severity": "critical",
      "category": "vulnerability",
      "affected_products": ["WebServer Pro 2.1", "WebServer Pro 2.2"],
      "description": "A critical remote code execution vulnerability has been discovered in WebServer Pro versions 2.1 and 2.2. The vulnerability allows unauthenticated attackers to execute arbitrary code on affected systems.",
      "impact": "Successful exploitation could result in complete system compromise, data theft, and further network infiltration.",
      "recommendations": [
        "Immediately update to WebServer Pro version 2.3 or later",
        "Block external access to WebServer Pro instances until patched",
        "Monitor logs for suspicious activity indicative of exploitation attempts"
      ],
      "references": [
        "https://www.vendor.com/security/advisories/webserver-pro-rce-2024",
        "https://nvd.nist.gov/vuln/detail/CVE-2024-12345"
      ],
      "published_date": "2024-01-15",
      "last_updated": "2024-01-15",
      "metadata": {
        "author": "Security Research Team",
        "tags": ["rce", "webserver", "critical", "unauthenticated"],
        "cvss_score": 9.8
      }
    }
  ]
}
```