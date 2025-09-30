# Contributing to the Pattern Database

Thank you for your interest in contributing to the Version Detection Pattern Database! This document provides guidelines and best practices for contributing new patterns or improving existing ones.

## Getting Started

1. Fork the repository
2. Create a new branch for your work
3. Follow the [pattern template](TEMPLATE.md) when creating new patterns
4. Ensure all fields are properly filled out
5. Add comprehensive test cases
6. Validate your pattern using our [validation tools](../tools/)
7. Submit a pull request

## Research Best Practices

Before creating a pattern, conduct thorough research:

1. Identify multiple examples of the software/version string in different contexts
2. Look for official documentation about version reporting
3. Check various sources where the version might appear (headers, banners, file contents, etc.)
4. Consider different deployment scenarios (cloud, on-premise, containers)
5. Account for variations in version formatting

## Pattern Quality Requirements

### Regex Guidelines
- Use capture groups to extract version information
- Make patterns specific enough to avoid false positives
- Balance specificity with flexibility for version format variations
- Escape special regex characters properly
- Test against various version formats for the product

### Metadata Standards
- Provide accurate and complete metadata
- Use descriptive pattern names
- Select appropriate categories and tags
- Write clear, concise descriptions
- Set realistic confidence scores based on testing

### Test Cases
Every pattern must include test cases that:
- Cover various version formats for the product
- Include both positive and negative test cases
- Demonstrate edge cases
- Validate the correct version extraction

Example test case structure:
``json
{
  "input": "Sample text containing version",
  "expected_version": "Extracted version string"
}
```

## Priority Scoring

Use the following guidelines for setting pattern priority:

| Score Range | Reliability Level | Description |
|-------------|-------------------|-------------|
| 180-200 | Very High | Official version strings, almost no false positives |
| 150-179 | High | Reliable patterns with minimal false positives |
| 100-149 | Medium | Generally reliable but may have occasional false positives |
| 50-99 | Low | Patterns with known limitations or higher false positive rates |
| 0-49 | Very Low | Experimental patterns or those with significant limitations |

## Confidence Scoring

Confidence represents how accurately the pattern extracts versions:

| Score | Meaning | When to Use |
|-------|---------|-------------|
| 0.9-1.0 | Very High | Consistently extracts correct versions in all test cases |
| 0.7-0.89 | High | Accurately extracts versions with rare exceptions |
| 0.5-0.69 | Medium | Generally accurate but with notable exceptions |
| 0.3-0.49 | Low | Often inaccurate or inconsistent |
| 0.0-0.29 | Very Low | Frequently produces incorrect results |

## Review Process

All contributions go through a review process:

1. Automated validation checks
2. Manual review by maintainers
3. Testing against real-world samples
4. Feedback and revision requests
5. Approval and merge

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Provide constructive feedback
- Welcome newcomers and help them get started
- Focus on the technical merits of contributions
- Maintain professional communication

## Questions?

If you have questions about contributing, feel free to:

1. Open an issue for general questions
2. Contact the maintainers directly
3. Check our [documentation](../docs/) for more information
