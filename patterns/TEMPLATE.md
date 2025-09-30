# Pattern Template

This template should be used when creating new version detection patterns for the Version Detection Pattern Database.

## Pattern Structure

```json
{
  "patterns": [
    {
      "name": "Descriptive name of the pattern",
      "category": "web|networking|database|messaging|other",
      "pattern": "Regular expression with version capture group",
      "vendor": "Software vendor name",
      "product": "Software product name",
      "version_group": 1,
      "priority": 100,
      "confidence": 0.9,
      "metadata": {
        "author": "Your Name or Organization",
        "created_at": "YYYY-MM-DDTHH:MM:SS",
        "updated_at": "YYYY-MM-DDTHH:MM:SS",
        "description": "Detailed description of what this pattern detects",
        "tags": ["tag1", "tag2", "tag3"],
        "test_cases": [
          {
            "input": "Sample input string that matches the pattern",
            "expected_version": "Expected version extracted by the pattern"
          }
        ]
      }
    }
  ]
}
```

## Field Descriptions

### Name
- A descriptive name for the pattern
- Should clearly indicate what service/software is being detected
- Example: "Apache HTTPD Server"

### Category
- One of the predefined categories:
  - `web` - Web servers and applications
  - `networking` - Networking services (SSH, FTP, SMTP, etc.)
  - `database` - Database systems
  - `messaging` - Messaging systems (Kafka, RabbitMQ, etc.)
  - `other` - Any other category

### Pattern
- Regular expression used to detect and extract version information
- Must include a capture group for the version information
- Use raw strings to avoid escaping issues
- Example: `"Server: Apache/([\\d.]+)"`

### Vendor
- The vendor/organization that creates the software
- Example: "Apache", "Microsoft", "Oracle"

### Product
- The specific product name
- Example: "HTTPD", "IIS", "MySQL"

### Version Group
- The capture group number that contains the version information
- Usually 1 for simple patterns
- For complex patterns with multiple groups, specify the correct group number

### Priority
- Numerical priority value (higher = higher priority)
- Used to determine pattern matching order
- Range: 1-999
- Example values:
  - 300+: Critical/common services
  - 200+: Common services
  - 100+: Less common services
  - 50+: Rare services

### Confidence
- Numerical confidence value (0.0-1.0)
- Indicates how reliable the pattern is
- 1.0 = Very high confidence
- 0.9 = High confidence
- 0.7-0.8 = Medium confidence
- < 0.7 = Low confidence

### Metadata

#### Author
- Your name or organization
- Example: "John Doe", "Security Research Team"

#### Created At / Updated At
- ISO 8601 formatted timestamps
- Example: "2025-09-30T14:30:00"

#### Description
- Detailed description of what the pattern detects
- Include information about false positives/negatives
- Mention any special considerations

#### Tags
- Array of descriptive tags
- Used for categorization and searching
- Include relevant keywords
- Example: ["http", "apache", "webserver"]

#### Test Cases
- Array of test cases to validate the pattern
- Each test case includes:
  - `input`: Sample input string that should match
  - `expected_version`: Version that should be extracted

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
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
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