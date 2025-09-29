# Adding New Data to VersionIntel

This guide explains how to contribute new data to VersionIntel, including service detection patterns, product information, and vulnerability mappings.

## Table of Contents

- [Overview](#overview)
- [Service Detection Patterns](#service-detection-patterns)
- [Product/Vendor Information](#productvendor-information)
- [Vulnerability Mappings](#vulnerability-mappings)
- [AI Research Data](#ai-research-data)
- [Contribution Process](#contribution-process)
- [Quality Standards](#quality-standards)

## Overview

VersionIntel uses several types of data to identify software versions and detect vulnerabilities:

1. **Service Detection Patterns** - Regex patterns used to identify services from their responses
2. **Product/Vendor Information** - Database of software products and their vendors
3. **Vulnerability Mappings** - Links between products/versions and known vulnerabilities
4. **AI Research Data** - Training data and research findings for AI analysis

## Service Detection Patterns

### Directory Structure

Service detection patterns are organized in the [data/service-patterns/](../../data/service-patterns/) directory:

```
data/service-patterns/
├── networking/     # Network services (SSH, FTP, SMTP, etc.)
├── web/            # Web servers (Apache, Nginx, IIS, etc.)
├── database/       # Database servers (MySQL, PostgreSQL, etc.)
└── application/    # Application-specific patterns
```

### Pattern File Format

Each pattern file is a JSON document with the following structure:

```json
{
  "patterns": [
    {
      "name": "Service Name",
      "category": "service_category",
      "pattern": "regex_pattern_with_capture_group",
      "vendor": "Software Vendor",
      "product": "Product Name",
      "version_group": 1,
      "priority": 100,
      "confidence": 0.95,
      "metadata": {
        "author": "Your Name",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "description": "Brief description of what this pattern detects",
        "tags": ["tag1", "tag2", "tag3"],
        "test_cases": [
          {
            "input": "Sample service response that should match",
            "expected_version": "1.2.3"
          }
        ]
      }
    }
  ]
}
```

### Pattern Fields

| Field | Description | Required |
|-------|-------------|----------|
| `name` | Human-readable name of the service | Yes |
| `category` | Category of the service (e.g., networking, web, database) | Yes |
| `pattern` | Regular expression with capture group for version | Yes |
| `vendor` | Software vendor/organization | Yes |
| `product` | Product name | Yes |
| `version_group` | Capture group number containing the version | Yes |
| `priority` | Priority level (higher = processed first) | Yes |
| `confidence` | Confidence level (0.0-1.0) | Yes |
| `metadata` | Additional information about the pattern | Yes |

### Metadata Fields

| Field | Description | Required |
|-------|-------------|----------|
| `author` | Contributor's name | Yes |
| `created_at` | ISO 8601 timestamp | Yes |
| `updated_at` | ISO 8601 timestamp | Yes |
| `description` | Brief description of the pattern | Yes |
| `tags` | Array of tags for categorization | Yes |
| `test_cases` | Array of test cases | Yes |

### Best Practices

1. **Specificity**: Patterns should be specific enough to avoid false positives
2. **Capture Groups**: Use parentheses to capture the version information
3. **Priority**: Set appropriate priority levels (100-200)
4. **Confidence**: Set confidence levels based on pattern reliability (0.8-1.0)
5. **Documentation**: Provide clear descriptions and test cases
6. **Tags**: Use relevant tags for categorization

### Example Pattern

```json
{
  "patterns": [
    {
      "name": "OpenSSH Server",
      "category": "networking",
      "pattern": "OpenSSH_([\\d\\.]+)",
      "vendor": "OpenBSD",
      "product": "OpenSSH",
      "version_group": 1,
      "priority": 200,
      "confidence": 0.95,
      "metadata": {
        "author": "Security Researcher",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "description": "Detects OpenSSH version from SSH banner",
        "tags": ["ssh", "openssh", "remote-access"],
        "test_cases": [
          {
            "input": "SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5",
            "expected_version": "8.2p1"
          },
          {
            "input": "SSH-2.0-OpenSSH_7.9 FreeBSD-20190110",
            "expected_version": "7.9"
          }
        ]
      }
    }
  ]
}
```

## Product/Vendor Information

### Directory Structure

Product information is stored in JSON files organized by vendor in the data/ directory:

### Product File Format

```json
{
  "vendor": "Vendor Name",
  "website": "https://vendor-website.com",
  "products": [
    {
      "name": "Product Name",
      "description": "Brief description of the product",
      "categories": ["web-server", "open-source"],
      "cpe": "cpe:/a:vendor:product"
    }
  ]
}
```

### Product Fields

| Field | Description | Required |
|-------|-------------|----------|
| `vendor` | Vendor/organization name | Yes |
| `website` | Official website URL | Yes |
| `products` | Array of product objects | Yes |
| `name` | Product name | Yes |
| `description` | Brief product description | Yes |
| `categories` | Array of category tags | Yes |
| `cpe` | Common Platform Enumeration identifier | No |

## Vulnerability Mappings

### Vulnerability File Format

```json
{
  "cve_id": "CVE-2024-1234",
  "product": "Product Name",
  "vendor": "Vendor Name",
  "affected_versions": [
    "1.0.0",
    "1.0.1",
    "1.1.0"
  ],
  "cvss_score": 7.5,
  "severity": "HIGH",
  "description": "Brief description of the vulnerability",
  "references": [
    "https://vendor-website.com/security/advisory",
    "https://nvd.nist.gov/vuln/detail/CVE-2024-1234"
  ],
  "published_date": "2024-01-01T00:00:00Z",
  "last_modified": "2024-01-01T00:00:00Z"
}
```

## AI Research Data

### Research Data Format

```json
{
  "research_topic": "Research Topic Name",
  "authors": ["Author 1", "Author 2"],
  "description": "Brief description of the research",
  "methodology": "Description of the research methodology",
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
    "https://dataset-link.com"
  ]
}
```

## Contribution Process

### 1. Fork and Clone

```bash
git clone https://github.com/your-username/versionintel.git
cd versionintel
```

### 2. Create a Branch

```bash
git checkout -b data/new-service-patterns
```

### 3. Add Your Data

- Place pattern files in the appropriate directory under [data/service-patterns/](../../data/service-patterns/)
- Follow the formats described above
- Include comprehensive examples

### 4. Commit and Push

```bash
git add data/service-patterns/networking/new-service.json
git commit -m "feat(data): add detection patterns for NewService"
git push origin data/new-service-patterns
```

### 5. Create Pull Request

Submit a pull request with:
- Clear description of the contribution
- Examples showing how the patterns work
- References to official documentation

## Quality Standards

### Pattern Quality

1. **Accuracy**: Patterns must correctly identify services without false positives
2. **Specificity**: Avoid overly broad patterns that match unrelated services
3. **Documentation**: Include examples and explanations
4. **Testing**: Verify patterns with real-world examples

### Data Quality

1. **Accuracy**: Verify all information is correct and up-to-date
2. **Completeness**: Include all required fields
3. **Consistency**: Follow existing data formats and conventions
4. **Sources**: Provide references to official documentation when possible

### Contribution Quality

1. **Focused Changes**: Each contribution should address a specific need
2. **Clear Documentation**: Explain what you're adding and why
3. **Follow Guidelines**: Adhere to contribution guidelines and code of conduct

## Getting Help

If you need help with your data contribution:

1. Check existing patterns for examples
2. Review the [CONTRIBUTING.md](../../CONTRIBUTING.md) guide
3. Ask questions in GitHub Discussions
4. Contact maintainers for complex contributions

Thank you for helping improve VersionIntel's detection capabilities!