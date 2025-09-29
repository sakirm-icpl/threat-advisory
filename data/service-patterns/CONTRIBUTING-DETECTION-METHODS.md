# Contributing Detection Methods with POC and Test Cases

This guide explains how to contribute new detection methods to the VersionIntel repository with proper proof of concept (POC) and test cases.

## Table of Contents

1. [Understanding Detection Methods](#understanding-detection-methods)
2. [Research and Discovery](#research-and-discovery)
3. [Creating the Pattern](#creating-the-pattern)
4. [Developing Test Cases](#developing-test-cases)
5. [Proof of Concept (POC)](#proof-of-concept-poc)
6. [Validation and Testing](#validation-and-testing)
7. [Documentation](#documentation)
8. [Submission Process](#submission-process)

## Understanding Detection Methods

Detection methods in VersionIntel are regular expressions that identify software services and extract version information from their responses. Each method consists of:

- A **pattern** that matches service responses
- **Capture groups** that extract version information
- **Metadata** that describes the pattern
- **Test cases** that validate the pattern

## Research and Discovery

### Step 1: Identify the Target Service
- Determine which service you want to detect
- Research the service's response formats
- Identify version information in responses

### Step 2: Collect Sample Responses
- Gather real-world service responses
- Ensure variety in versions and configurations
- Remove any sensitive information
- Document the source environment (if appropriate)

### Step 3: Analyze Response Patterns
- Look for consistent identifiers in responses
- Identify where version information appears
- Note any variations in format

## Creating the Pattern

### Step 1: Define the Regular Expression
Create a regex pattern that:
- Matches the service identifier
- Captures version information in a group
- Avoids false positives
- Handles common variations

Example:
```regex
OpenSSH_([\\d\\.]+)
```

### Step 2: Set Pattern Parameters
Configure the pattern with appropriate values:

| Parameter | Guidance |
|-----------|----------|
| `name` | Descriptive name of the service |
| `category` | networking, web, database, or application |
| `pattern` | The regex pattern with capture group |
| `vendor` | Software vendor/organization |
| `product` | Product name |
| `version_group` | Capture group number (usually 1) |
| `priority` | 100-200 (higher = processed first) |
| `confidence` | 0.8-1.0 (higher = more reliable) |

### Step 3: Add Metadata
Include essential metadata:
- Author information
- Creation and update timestamps
- Description of what the pattern detects
- Relevant tags for categorization

## Developing Test Cases

### Step 1: Create Comprehensive Test Cases
Develop test cases that cover:
- Different versions of the service
- Various response formats
- Edge cases and unusual responses
- Both matching and non-matching scenarios

### Step 2: Format Test Cases Properly
Each test case should include:
```json
{
  "input": "Actual service response",
  "expected_version": "Expected version string"
}
```

### Step 3: Validate Test Cases
Ensure test cases:
- Use real service responses (when possible)
- Cover common variations
- Don't include sensitive information
- Have correct expected outputs

## Proof of Concept (POC)

### Step 1: Document Your Research
Create a POC document that includes:
1. **Service Information**
   - Service name and vendor
   - Common versions
   - Typical deployment scenarios

2. **Response Analysis**
   - Sample responses with version information highlighted
   - Explanation of where version info appears
   - Common response formats

3. **Pattern Development**
   - Evolution of the regex pattern
   - Reasoning behind pattern choices
   - Consideration of false positives/negatives

### Step 2: Include POC Code
Provide a simple script or code snippet that demonstrates:
- How the pattern matches service responses
- How version extraction works
- Test results with sample data

Example POC script:
```python
import re

# Your pattern
pattern = r"OpenSSH_([\d\.]+)"

# Test cases
test_cases = [
    "SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5",
    "SSH-2.0-OpenSSH_7.9 FreeBSD-20190110"
]

# Test the pattern
for response in test_cases:
    match = re.search(pattern, response)
    if match:
        version = match.group(1)
        print(f"Response: {response}")
        print(f"Detected version: {version}")
    else:
        print(f"No match for: {response}")
```

### Step 3: Show Results
Include the output of your POC:
- Successful detections
- Extracted versions
- Any edge cases handled
- Performance considerations

## Validation and Testing

### Step 1: Test Against Real Services
Validate your pattern against:
- Multiple versions of the target service
- Different configurations
- Various deployment environments
- Services that might produce false positives

### Step 2: Check for False Positives
Ensure your pattern doesn't match:
- Other services accidentally
- Non-version strings
- Malformed responses

### Step 3: Performance Testing
Verify that your pattern:
- Executes efficiently
- Doesn't cause excessive backtracking
- Works with large response sets

## Documentation

### Step 1: Write Clear Descriptions
Provide detailed information about:
- What the pattern detects
- How it extracts version information
- Common use cases
- Limitations or edge cases

### Step 2: Include Tags
Add relevant tags for:
- Service type
- Protocol
- Common use cases
- Deployment scenarios

### Step 3: Update Related Documentation
If applicable, update:
- Vendor information in products directory
- Product information in products directory
- Any related CVE mappings

## Submission Process

### Step 1: Fork and Branch
1. Fork the repository
2. Create a new branch for your contribution:
   ```bash
   git checkout -b detection-method/new-service-name
   ```

### Step 2: Create Your Pattern File
1. Place the file in the appropriate category directory:
   - `data/service-patterns/networking/`
   - `data/service-patterns/web/`
   - `data/service-patterns/database/`
   - `data/service-patterns/application/`

2. Name the file descriptively: `service-name.json`

### Step 3: Validate Your JSON
```bash
python -m json.tool your-pattern-file.json
```

### Step 4: Commit Your Changes
```bash
git add data/service-patterns/category/service-name.json
git commit -m "feat(patterns): add detection method for Service Name with POC"
```

### Step 5: Create a Pull Request
In your pull request, include:
1. **Description**: Explain what service you're detecting
2. **POC Summary**: Brief overview of your research and testing
3. **Test Cases**: Mention the variety of test cases included
4. **Validation Results**: Share results of your testing
5. **References**: Link to official documentation or research

## Example Contribution

### File: `data/service-patterns/web/nginx.json`

```json
{
  "patterns": [
    {
      "name": "nginx Server",
      "category": "web",
      "pattern": "nginx/([\\d\\.]+)",
      "vendor": "nginx",
      "product": "nginx",
      "version_group": 1,
      "priority": 170,
      "confidence": 0.95,
      "metadata": {
        "author": "Web Security Researcher",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "description": "Detects nginx version from Server header",
        "tags": ["http", "nginx", "web-server"],
        "test_cases": [
          {
            "input": "Server: nginx/1.18.0",
            "expected_version": "1.18.0"
          },
          {
            "input": "Server: nginx/1.20.1",
            "expected_version": "1.20.1"
          }
        ]
      }
    }
  ]
}
```

### POC Summary for nginx:
- **Research**: Analyzed HTTP Server headers from nginx installations
- **Pattern**: Simple regex to capture version from "nginx/X.Y.Z" format
- **Testing**: Validated against nginx versions 1.18.0, 1.20.1, and 1.21.3
- **Results**: 100% accuracy on test cases, no false positives identified

## Need Help?

If you need assistance with your detection method contribution:

1. **Check Existing Patterns**: Review similar services in the repository
2. **Ask in Issues**: Create an issue to discuss your approach
3. **Community Support**: Join discussions in GitHub Discussions
4. **Maintainer Contact**: Reach out to maintainers for complex contributions

Thank you for helping improve VersionIntel's detection capabilities!