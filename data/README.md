# VersionIntel Data Repository

This directory contains the data files used by VersionIntel for software version detection and vulnerability analysis.

## Structure

```
data/
├── service-patterns/     # Service detection patterns
│   ├── networking/       # Network service patterns (SSH, FTP, SMTP, etc.)
│   ├── web/              # Web server patterns (Apache, Nginx, IIS, etc.)
│   ├── database/         # Database patterns (MySQL, PostgreSQL, etc.)
│   └── application/      # Application-specific patterns
├── products/             # Product and vendor information
├── vulnerabilities/      # CVE and vulnerability mappings
└── ai-research/          # AI training data and research findings
```

## Service Detection Patterns

Service detection patterns are used to identify software versions by analyzing service responses. Each pattern file contains:

- **Pattern definitions** - Regular expressions for matching service responses
- **Metadata** - Information about the pattern including author, creation date, and test cases
- **Version extraction** - Rules for extracting version information from matches

### Pattern File Format

```json
{
  "patterns": [
    {
      "name": "Service Name",
      "category": "service_category",
      "pattern": "regex_pattern",
      "vendor": "Software Vendor",
      "product": "Product Name",
      "version_group": 1,
      "priority": 100,
      "confidence": 0.95,
      "metadata": {
        "author": "Contributor Name",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "description": "Description of what this pattern detects",
        "tags": ["tag1", "tag2"],
        "test_cases": [
          {
            "input": "Sample service response",
            "expected_version": "1.2.3"
          }
        ]
      }
    }
  ]
}
```

## Contributing Data

We welcome contributions to our data repository! See our [Data Contribution Guide](../docs/community/data-contribution.md) for detailed instructions on how to contribute.

### Best Practices

1. **Accuracy**: Ensure patterns correctly identify services without false positives
2. **Testing**: Include test cases that verify pattern accuracy
3. **Documentation**: Provide clear descriptions and metadata
4. **Specificity**: Make patterns specific enough to avoid matching unrelated services
5. **Versioning**: Follow semantic versioning for pattern files

## Data Licensing

All data in this repository is provided under the MIT License, the same license as the main VersionIntel project. See [LICENSE](../LICENSE) for details.