# Data Contribution Guide

VersionIntel relies on community contributions to expand its detection capabilities. This guide explains how to contribute new data to improve version detection and vulnerability analysis.

## Table of Contents

- [Overview](#overview)
- [Types of Data Contributions](#types-of-data-contributions)
- [Service Detection Patterns](#service-detection-patterns)
- [Product/Vendor Information](#productvendor-information)
- [CVE Mappings](#cve-mappings)
- [AI Research Data](#ai-research-data)
- [Contribution Process](#contribution-process)
- [Quality Standards](#quality-standards)

## Overview

VersionIntel uses several types of data to identify software versions and detect vulnerabilities:

1. **Service Detection Patterns** - Regex patterns and banners used to identify services
2. **Product/Vendor Information** - Database of software products and their vendors
3. **CVE Mappings** - Links between products/versions and known vulnerabilities
4. **AI Research Data** - Training data and research findings for AI analysis

## Types of Data Contributions

### Service Detection Patterns

These are the core of VersionIntel's detection capabilities. Patterns help identify:
- Software services running on specific ports
- Version information from service banners
- Unique identifiers for different software products

### Product/Vendor Information

Maintaining an accurate database of software products helps:
- Link detected services to known vulnerabilities
- Provide detailed information about software
- Enable better AI analysis

### CVE Mappings

Connecting products to vulnerabilities is crucial for:
- Security assessment
- Risk evaluation
- Patch prioritization

### AI Research Data

Improving AI capabilities through:
- Training data for machine learning models
- Research findings on detection techniques
- Case studies of challenging scenarios

## Service Detection Patterns

### Pattern File Structure

Service detection patterns are stored in JSON files in the [data/service-patterns/](https://github.com/sakirm-icpl/versionintel/tree/main/data/service-patterns) directory:

```json
{
  "service_name": "Apache HTTP Server",
  "patterns": [
    {
      "type": "banner",
      "regex": "Apache/([0-9]+\\.[0-9]+\\.[0-9]+)",
      "ports": [80, 443, 8080],
      "confidence": 0.95,
      "examples": [
        "Apache/2.4.41 (Ubuntu)",
        "Apache/2.2.34"
      ]
    }
  ]
}
```

### Pattern Fields

| Field | Description | Required |
|-------|-------------|----------|
| `service_name` | Human-readable name of the service | Yes |
| `patterns` | Array of pattern objects | Yes |
| `type` | Type of pattern (banner, header, response, etc.) | Yes |
| `regex` | Regular expression to match | Yes |
| `ports` | Common ports where service runs | No |
| `confidence` | Confidence level (0.0-1.0) | Yes |
| `examples` | Example strings that should match | Yes |

### Best Practices

1. **Specificity**: Patterns should be specific enough to avoid false positives
2. **Examples**: Always include real-world examples
3. **Confidence**: Set appropriate confidence levels based on pattern reliability
4. **Documentation**: Include examples and explanations

## Product/Vendor Information

### Product Database Structure

Products are stored in the database with the following information:

```json
{
  "name": "WordPress",
  "vendor": "Automattic",
  "website": "https://wordpress.org",
  "description": "Open source content management system",
  "categories": ["CMS", "Web Application"],
  "cpe": "cpe:/a:wordpress:wordpress"
}
```

### Product Fields

| Field | Description | Required |
|-------|-------------|----------|
| `name` | Product name | Yes |
| `vendor` | Company or organization | Yes |
| `website` | Official website | Yes |
| `description` | Brief description | Yes |
| `categories` | Product categories | Yes |
| `cpe` | Common Platform Enumeration identifier | No |

## CVE Mappings

### CVE Structure

CVE mappings connect products to vulnerabilities:

```json
{
  "cve_id": "CVE-2021-1234",
  "product_name": "WordPress",
  "affected_versions": ["5.0.0", "5.1.0", "5.2.0"],
  "cvss_score": 8.8,
  "severity": "HIGH",
  "description": "Vulnerability description",
  "references": [
    "https://wordpress.org/news/2021/01/wordpress-5-6-1-security-release/"
  ]
}
```

## AI Research Data

### Research Data Format

AI research data helps improve our machine learning models:

```json
{
  "research_topic": "Version Detection in Obfuscated Responses",
  "findings": "Description of research findings",
  "methodology": "Research methodology used",
  "data_samples": [
    {
      "input": "Sample input data",
      "expected_output": "Expected result",
      "notes": "Additional notes"
    }
  ]
}
```

## Contribution Process

### 1. Fork and Clone

```bash
git clone https://github.com/sakirm-icpl/versionintel.git
cd versionintel
```

### 2. Create a Branch

```bash
git checkout -b data/new-service-patterns
```

### 3. Add Your Data

- Place pattern files in the appropriate directory under [data/service-patterns/](https://github.com/sakirm-icpl/versionintel/tree/main/data/service-patterns)
- Follow the formats described above
- Include comprehensive examples

### 4. Commit and Push

```bash
git add data/service-patterns/web/new-service.json
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
2. Review the [CONTRIBUTING.md](https://github.com/sakirm-icpl/versionintel/blob/main/CONTRIBUTING.md) guide
3. Ask questions in GitHub Discussions
4. Contact maintainers for complex contributions

Thank you for helping improve VersionIntel's detection capabilities!