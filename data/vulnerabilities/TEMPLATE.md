# CVE Vulnerability Mapping Template

This template shows how to structure CVE vulnerability mappings for contribution to the VersionIntel data repository.

## CVE Mapping Template

```json
{
  "cve_mappings": [
    {
      "cve_id": "CVE-YYYY-NNNNN",
      "product_id": "product-id-from-products-file",
      "vendor_id": "vendor-id-from-vendors-file",
      "affected_versions": [
        {
          "version": "1.0.0",
          "operator": "="
        }
      ],
      "cvss_score": 0.0,
      "cvss_vector": "CVSS:3.1/...",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "description": "Brief description of the vulnerability",
      "references": [
        "https://reference-url-1.com",
        "https://reference-url-2.com"
      ],
      "published_date": "YYYY-MM-DDTHH:MM:SSZ",
      "last_modified": "YYYY-MM-DDTHH:MM:SSZ",
      "metadata": {
        "created_at": "YYYY-MM-DDTHH:MM:SSZ",
        "updated_at": "YYYY-MM-DDTHH:MM:SSZ",
        "source": "nvd|vendor|research"
      }
    }
  ]
}
```

### CVE Mapping Fields

| Field | Description | Required |
|-------|-------------|----------|
| `cve_id` | CVE identifier (CVE-YYYY-NNNNN format) | Yes |
| `product_id` | Reference to product ID | Yes |
| `vendor_id` | Reference to vendor ID | Yes |
| `affected_versions` | Array of affected version objects | Yes |
| `cvss_score` | CVSS score (0.0-10.0) | Yes |
| `cvss_vector` | Full CVSS vector string | Yes |
| `severity` | Severity level (LOW, MEDIUM, HIGH, CRITICAL) | Yes |
| `description` | Brief vulnerability description | Yes |
| `references` | Array of reference URLs | Yes |
| `published_date` | CVE publication date | Yes |
| `last_modified` | CVE last modified date | Yes |
| `metadata` | Additional information | Yes |

### Affected Versions Object

```json
{
  "version": "1.0.0",
  "operator": "="
}
```

#### Version Operators

| Operator | Description |
|----------|-------------|
| `=` | Exactly this version |
| `!=` | Not this version |
| `<` | Less than this version |
| `<=` | Less than or equal to this version |
| `>` | Greater than this version |
| `>=` | Greater than or equal to this version |
| `~` | Compatible with (semantic versioning) |

## Examples

### Simple CVE Mapping

File: `data/vulnerabilities/apache-cve-2023.json`

```json
{
  "cve_mappings": [
    {
      "cve_id": "CVE-2023-12345",
      "product_id": "apache-httpd",
      "vendor_id": "apache",
      "affected_versions": [
        {
          "version": "2.4.50",
          "operator": "="
        },
        {
          "version": "2.4.51",
          "operator": "="
        }
      ],
      "cvss_score": 9.8,
      "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      "severity": "CRITICAL",
      "description": "Remote code execution vulnerability in Apache HTTP Server",
      "references": [
        "https://httpd.apache.org/security/vulnerabilities_24.html",
        "https://nvd.nist.gov/vuln/detail/CVE-2023-12345"
      ],
      "published_date": "2023-06-15T00:00:00Z",
      "last_modified": "2023-06-20T00:00:00Z",
      "metadata": {
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "source": "nvd"
      }
    }
  ]
}
```

### Complex Version Range Mapping

File: `data/vulnerabilities/nginx-cve-2023.json`

```json
{
  "cve_mappings": [
    {
      "cve_id": "CVE-2023-67890",
      "product_id": "nginx",
      "vendor_id": "nginx",
      "affected_versions": [
        {
          "version": "1.20.0",
          "operator": ">="
        },
        {
          "version": "1.22.1",
          "operator": "<"
        }
      ],
      "cvss_score": 7.5,
      "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
      "severity": "HIGH",
      "description": "Denial of service vulnerability in nginx",
      "references": [
        "https://nginx.org/en/security_advisories.html",
        "https://nvd.nist.gov/vuln/detail/CVE-2023-67890"
      ],
      "published_date": "2023-11-10T00:00:00Z",
      "last_modified": "2023-11-15T00:00:00Z",
      "metadata": {
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "source": "nvd"
      }
    }
  ]
}
```

## Contribution Guidelines

1. **File Naming**: Use descriptive names like `vendor-cve-YYYY.json` or group by year like `cve-2023/apache.json`
2. **Valid References**: Ensure all reference URLs are valid and accessible
3. **Accurate CVSS**: Use official CVSS scores and vectors
4. **Version Matching**: Ensure version operators and values are correct
5. **Timestamps**: Use ISO 8601 format for all dates (YYYY-MM-DDTHH:MM:SSZ)
6. **Sources**: Indicate the source of the vulnerability information
7. **Product/Vendor References**: Link to existing product and vendor IDs

## Validation

Before submitting your contribution, validate your JSON:

```bash
# Using Python
python -m json.tool your-file.json

# Using Node.js
node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('your-file.json')), null, 2))"
```