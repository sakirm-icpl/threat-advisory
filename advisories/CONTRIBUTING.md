# Contributing to the Advisory Database

Thank you for your interest in contributing to the Threat Advisory Database! This document provides guidelines and best practices for contributing new advisories or improving existing ones.

## Getting Started

1. Fork the repository
2. Create a new branch for your work
3. Follow the [advisory template](TEMPLATE.md) when creating new advisories
4. Ensure all fields are properly filled out
5. Add comprehensive references and recommendations
6. Validate your advisory using our [validation tools](../tools/)
7. Submit a pull request

## Research Best Practices

Before creating an advisory, conduct thorough research:

1. Verify the threat or vulnerability from multiple sources
2. Gather evidence and proof of concept where possible
3. Identify affected products and versions
4. Determine the potential impact
5. Research existing advisories to avoid duplication
6. Collect authoritative references and sources

## Advisory Quality Requirements

### Content Guidelines
- Provide accurate and complete information
- Use clear, concise language
- Include actionable recommendations
- Provide reliable references
- Set realistic severity scores based on impact

### Metadata Standards
- Provide accurate and complete metadata
- Use descriptive advisory titles
- Select appropriate categories and tags
- Write clear, concise descriptions
- Set realistic CVSS scores for vulnerability advisories

### References
Every advisory must include references that:
- Link to authoritative sources
- Provide additional context or information
- Are accessible and reliable
- Are properly formatted URLs

Example reference structure:
```json
"references": [
  "https://example.com/authoritative-source",
  "https://nvd.nist.gov/vuln/detail/CVE-XXXX-XXXX"
]
```

## Severity Scoring

Use the following guidelines for setting advisory severity:

| Level | Description | When to Use |
|-------|-------------|-------------|
| Critical | Immediate threat with severe impact | System compromise, data breach, widespread impact |
| High | Significant threat with major impact | Privilege escalation, data exposure, service disruption |
| Medium | Moderate threat with notable impact | Limited exposure, requires specific conditions |
| Low | Minimal threat with limited impact | Informational, requires significant prerequisites |

## Review Process

All contributions go through a review process:

1. Automated validation checks
2. Manual review by maintainers
3. Verification of sources and references
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