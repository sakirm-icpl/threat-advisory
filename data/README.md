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
│   ├── sample-vendors.json  # Sample vendor data
│   ├── sample-products.json # Sample product data
│   └── TEMPLATE.md       # Template for adding new vendors/products
├── vulnerabilities/      # CVE and vulnerability mappings
│   ├── sample-cve-mappings.json # Sample CVE mappings
│   └── TEMPLATE.md       # Template for adding new CVE mappings
├── ai-research/          # AI training data and research findings
│   ├── sample-research-data.json # Sample research data
│   └── TEMPLATE.md       # Template for adding new research data
└── README.md             # This file
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

## Product and Vendor Information

Product and vendor information helps link detected services to known software and their vendors. This data includes:

- **Vendor details** - Company information, websites, and descriptions
- **Product details** - Software information, categories, and CPE identifiers
- **Relationships** - Links between products and vendors

### Vendor File Format

```json
{
  "vendors": [
    {
      "id": "unique-vendor-id",
      "name": "Vendor Name",
      "website": "https://vendor-website.com",
      "description": "Brief description of the vendor/company",
      "founded": "YYYY-MM-DD",
      "country": "Country Code (ISO 3166-1 alpha-2)",
      "metadata": {
        "created_at": "YYYY-MM-DDTHH:MM:SSZ",
        "updated_at": "YYYY-MM-DDTHH:MM:SSZ",
        "source": "official|community|research"
      }
    }
  ]
}
```

### Product File Format

```json
{
  "products": [
    {
      "id": "unique-product-id",
      "name": "Product Name",
      "vendor_id": "vendor-id-from-vendors-file",
      "description": "Brief description of the product",
      "categories": ["category1", "category2"],
      "website": "https://product-website.com",
      "first_release": "YYYY-MM-DD",
      "cpe": "cpe:/a:vendor:product",
      "metadata": {
        "created_at": "YYYY-MM-DDTHH:MM:SSZ",
        "updated_at": "YYYY-MM-DDTHH:MM:SSZ",
        "source": "official|community|research"
      }
    }
  ]
}
```

## Vulnerability Mappings

Vulnerability mappings connect products to known CVEs and their severity information:

- **CVE details** - CVE identifiers, descriptions, and references
- **Affected versions** - Version ranges affected by the vulnerability
- **Severity information** - CVSS scores and vectors

### CVE Mapping Format

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

## AI Research Data

AI research data helps improve machine learning models for version detection:

- **Research datasets** - Collections of input/output pairs for training
- **Methodology descriptions** - Research approaches and findings
- **Sample data** - Representative examples for model training

### Research Data Format

```json
{
  "research_datasets": [
    {
      "id": "unique-dataset-id",
      "title": "Research Dataset Title",
      "authors": ["Author 1", "Author 2"],
      "description": "Brief description of the research dataset",
      "methodology": "Description of the research methodology used",
      "findings": "Key findings from the research",
      "data_samples": [
        {
          "input": "Sample input data",
          "expected_output": "Expected result",
          "notes": "Additional notes about this sample"
        }
      ],
      "references": [
        "https://research-paper-link.com",
        "https://dataset-source.com"
      ],
      "metadata": {
        "created_at": "YYYY-MM-DDTHH:MM:SSZ",
        "updated_at": "YYYY-MM-DDTHH:MM:SSZ",
        "license": "MIT|Apache-2.0|CC-BY-4.0"
      }
    }
  ]
}
```

## Contributing Data

We welcome contributions to our data repository! 

### Getting Started

1. Review the templates in each directory:
   - [Service Patterns Template](service-patterns/TEMPLATE.md)
   - [Products Template](products/TEMPLATE.md)
   - [Vulnerabilities Template](vulnerabilities/TEMPLATE.md)
   - [AI Research Template](ai-research/TEMPLATE.md)

2. Fork the repository and create a new branch for your contribution

3. Add your data following the appropriate template

4. Validate your JSON files:
   ```bash
   python -m json.tool your-file.json
   ```

5. Commit your changes with a descriptive message

6. Create a pull request with details about your contribution

### Best Practices

1. **Accuracy**: Ensure all data is accurate and up-to-date
2. **Validation**: Validate JSON syntax before submitting
3. **Documentation**: Provide clear descriptions and metadata
4. **Uniqueness**: Ensure IDs are unique across the repository
5. **References**: Include valid references to official sources
6. **Licensing**: Specify appropriate licenses for contributed data

## Data Licensing

All data in this repository is provided under the MIT License, the same license as the main VersionIntel project. See [LICENSE](../LICENSE) for details.