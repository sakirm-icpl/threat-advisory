# Version Detection Pattern Database

This directory contains the Version Detection Pattern Database - a collection of regex patterns for identifying software versions from service responses.

## Directory Structure

- `web/` - Patterns for web servers and applications
- `networking/` - Patterns for networking services (SSH, FTP, SMTP, etc.)
- `database/` - Patterns for database systems
- `messaging/` - Patterns for messaging systems
- `TEMPLATE.md` - Template for creating new patterns
- `CONTRIBUTING.md` - Guide for contributing patterns

## Pattern Categories

### Web Patterns
Patterns for detecting web servers and applications:
- Apache HTTPD
- Nginx
- Microsoft IIS
- Apache Tomcat
- Node.js applications
- And more...

### Networking Patterns
Patterns for detecting networking services:
- OpenSSH
- ProFTPD
- vsftpd
- Exim
- Postfix
- And more...

### Database Patterns
Patterns for detecting database systems:
- MySQL
- PostgreSQL
- MongoDB
- Redis
- And more...

### Messaging Patterns
Patterns for detecting messaging systems:
- Apache Kafka
- RabbitMQ
- ActiveMQ
- And more...

## Pattern Format

Each pattern file follows a standardized JSON format:

```json
{
  "patterns": [
    {
      "name": "Pattern Name",
      "category": "web|networking|database|messaging|other",
      "pattern": "Regular expression with version capture group",
      "vendor": "Software vendor",
      "product": "Software product",
      "version_group": 1,
      "priority": 100,
      "confidence": 0.9,
      "metadata": {
        "author": "Author Name",
        "created_at": "YYYY-MM-DDTHH:MM:SS",
        "updated_at": "YYYY-MM-DDTHH:MM:SS",
        "description": "Pattern description",
        "tags": ["tag1", "tag2"],
        "test_cases": [
          {
            "input": "Sample input",
            "expected_version": "Expected version"
          }
        ]
      }
    }
  ]
}
```

## Using Patterns

### Integration with Security Tools
Patterns can be integrated with security tools by:
1. Parsing the JSON pattern files
2. Compiling the regex patterns
3. Applying patterns to service responses
4. Extracting and normalizing version information

### Example Usage (Python)
```python
import json
import re

# Load pattern file
with open('patterns/web/apache.json') as f:
    pattern_data = json.load(f)

# Extract pattern information
pattern = pattern_data['patterns'][0]
regex = re.compile(pattern['pattern'])
version_group = pattern['version_group']

# Test against service response
response = "Server: Apache/2.4.41 (Ubuntu)"
match = regex.search(response)
if match:
    version = match.group(version_group)
    print(f"Detected {pattern['product']} version {version}")
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute new patterns to the database.

## Validation

Pattern files can be validated using the [validation script](../tools/validate-pattern.py):

```bash
python ../tools/validate-pattern.py web/apache.json
```

## License

This pattern database is provided under the MIT License. See [LICENSE](../LICENSE) file in the root directory for more information.