# Service Detection Pattern Template

This template shows how to structure service detection patterns for contribution to the VersionIntel data repository.

## Pattern File Format

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
        "created_at": "YYYY-MM-DDTHH:MM:SSZ",
        "updated_at": "YYYY-MM-DDTHH:MM:SSZ",
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
| `category` | Category of the service (networking, web, database, application) | Yes |
| `pattern` | Regular expression with capture group for version | Yes |
| `vendor` | Software vendor/organization | Yes |
| `product` | Product name | Yes |
| `version_group` | Capture group number containing the version | Yes |
| `priority` | Priority level (higher = processed first, 1-200) | Yes |
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

## Categories

Common service categories include:
- `networking` - SSH, FTP, SMTP, Telnet, etc.
- `web` - Apache, Nginx, IIS, etc.
- `database` - MySQL, PostgreSQL, MongoDB, etc.
- `application` - Custom application patterns

## Best Practices

1. **Specificity**: Patterns should be specific enough to avoid false positives
2. **Capture Groups**: Use parentheses to capture the version information
3. **Priority**: Set appropriate priority levels (100-200 for common services, lower for rare ones)
4. **Confidence**: Set confidence levels based on pattern reliability (0.8-1.0)
5. **Documentation**: Provide clear descriptions and tags
6. **Test Cases**: Include comprehensive test cases with real examples

## Examples

### Simple Pattern Example

File: `data/service-patterns/networking/openssh.json`

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

### Complex Pattern Example

File: `data/service-patterns/web/apache.json`

```json
{
  "patterns": [
    {
      "name": "Apache HTTP Server",
      "category": "web",
      "pattern": "Apache/([\\d\\.]+(?:\\.[\\d\\.]+)*)",
      "vendor": "Apache Software Foundation",
      "product": "HTTP Server",
      "version_group": 1,
      "priority": 180,
      "confidence": 0.9,
      "metadata": {
        "author": "Web Security Team",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "description": "Detects Apache HTTP Server version from Server header",
        "tags": ["http", "apache", "web-server"],
        "test_cases": [
          {
            "input": "Server: Apache/2.4.41 (Ubuntu)",
            "expected_version": "2.4.41"
          },
          {
            "input": "Server: Apache/2.2.34",
            "expected_version": "2.2.34"
          },
          {
            "input": "Server: Apache/2.4.52 (Debian)",
            "expected_version": "2.4.52"
          }
        ]
      }
    }
  ]
}
```

## Test Cases

Test cases are crucial for validating patterns. Each test case should include:

1. **Realistic Input**: Actual service responses (without sensitive data)
2. **Expected Output**: The version that should be extracted
3. **Variety**: Different versions and formats to ensure robustness

### Test Case Format

```json
{
  "input": "Actual service response",
  "expected_version": "Expected version string"
}
```

## Contribution Guidelines

1. **File Naming**: Use descriptive names like `service-name.json` (e.g., `openssh.json`, `apache.json`)
2. **Category Placement**: Place files in the appropriate category directory
3. **Unique Patterns**: Ensure patterns don't duplicate existing ones
4. **Valid JSON**: Validate your JSON before submitting
5. **Accurate Information**: Verify all information is correct
6. **Comprehensive Testing**: Include multiple test cases
7. **Proper Metadata**: Include author information and timestamps
8. **Clear Descriptions**: Explain what the pattern detects

## Validation

Before submitting your contribution, validate your JSON:

```bash
# Using Python
python -m json.tool your-file.json

# Using Node.js
node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('your-file.json')), null, 2))"
```