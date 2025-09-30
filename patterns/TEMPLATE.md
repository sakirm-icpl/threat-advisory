# Pattern Template

Use this template when creating new pattern files for the database.

```json
{
  "patterns": [
    {
      "name": "Pattern Name",
      "category": "pattern_category",
      "pattern": "regex_pattern_with_capture_groups",
      "vendor": "Vendor Name",
      "product": "Product Name",
      "version_group": 1,
      "priority": 100,
      "confidence": 0.95,
      "metadata": {
        "author": "Your Name",
        "created_at": "YYYY-MM-DD",
        "updated_at": "YYYY-MM-DD",
        "description": "Brief description of what this pattern detects",
        "tags": ["tag1", "tag2", "tag3"],
        "test_cases": [
          {
            "input": "Sample input text that should match the pattern",
            "expected_version": "Expected version string"
          }
        ]
      }
    }
  ]
}
```

## Field Descriptions

| Field | Description | Required |
|-------|-------------|----------|
| `name` | A descriptive name for the pattern | Yes |
| `category` | Category of the pattern (web, networking, database, messaging, os, cms, framework) | Yes |
| `pattern` | The actual regex pattern with capture groups for version extraction | Yes |
| `vendor` | The company or organization that creates the product | Yes |
| `product` | The specific product name | Yes |
| `version_group` | The capture group number that contains the version string | Yes |
| `priority` | Priority score (0-200) indicating reliability (higher = more reliable) | Yes |
| `confidence` | Confidence level (0.0-1.0) in the pattern's accuracy | Yes |
| `metadata.author` | The pattern creator's name or handle | Yes |
| `metadata.created_at` | Creation date in ISO 8601 format (YYYY-MM-DD) | Yes |
| `metadata.updated_at` | Last update date in ISO 8601 format (YYYY-MM-DD) | Yes |
| `metadata.description` | Detailed description of what the pattern detects | Yes |
| `metadata.tags` | Relevant tags to help with searching and categorization | Yes |
| `metadata.test_cases` | Array of test cases to validate the pattern | Yes |

## Example Pattern

```json
{
  "patterns": [
    {
      "name": "Apache HTTPD Server",
      "category": "web",
      "pattern": "Server: Apache/([\\d.]+)",
      "vendor": "Apache",
      "product": "HTTPD",
      "version_group": 1,
      "priority": 180,
      "confidence": 0.9,
      "metadata": {
        "author": "Security Scanner Team",
        "created_at": "2024-01-01",
        "updated_at": "2024-01-01",
        "description": "Detects Apache HTTPD version from HTTP server banner. This pattern matches the Server header commonly returned by Apache HTTPD servers.",
        "tags": ["http", "apache", "webserver"],
        "test_cases": [
          {
            "input": "Server: Apache/2.4.41 (Ubuntu)",
            "expected_version": "2.4.41"
          },
          {
            "input": "Server: Apache/2.4.52",
            "expected_version": "2.4.52"
          }
        ]
      }
    }
  ]
}
```

