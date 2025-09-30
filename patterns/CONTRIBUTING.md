# Contributing Detection Patterns

Thank you for your interest in contributing to the Version Detection Pattern Database! This document provides guidelines for contributing regex patterns to our repository.

## Table of Contents
- [Getting Started](#getting-started)
- [Pattern Requirements](#pattern-requirements)
- [Research Best Practices](#research-best-practices)
- [Creating Quality Patterns](#creating-quality-patterns)
- [Testing Patterns](#testing-patterns)
- [Submission Process](#submission-process)
- [Review Process](#review-process)

## Getting Started

1. Fork the repository
2. Create a new branch for your pattern: `git checkout -b pattern/new-service`
3. Follow the [pattern template](TEMPLATE.md)
4. Test your pattern with our validation tools
5. Submit a pull request with your contribution

## Pattern Requirements

### Technical Requirements
- Patterns must be valid JSON following our schema
- Each pattern must include a version capture group
- Patterns must include comprehensive test cases
- All fields must be properly filled out
- Pattern files must be named appropriately (e.g., `apache.json`)

### Quality Requirements
- Patterns must be accurate and reliable
- False positive rate should be minimized
- Patterns should be specific to avoid over-matching
- Confidence levels must be realistic
- Test cases must cover various scenarios

### Documentation Requirements
- Clear, descriptive pattern names
- Detailed descriptions of what the pattern detects
- Proper categorization
- Relevant tags for discoverability
- Accurate author and timestamp information

## Research Best Practices

### Pattern Development
- Research the target service thoroughly
- Identify common version disclosure mechanisms
- Analyze various service configurations
- Consider different deployment scenarios
- Account for common obfuscation techniques

### Version Extraction
- Focus on extracting accurate version information
- Handle version normalization if needed
- Consider different version formatting conventions
- Account for pre-release and build metadata
- Test with various version strings

### False Positive Prevention
- Make patterns as specific as possible
- Include contextual information when available
- Test against common false positive sources
- Validate with real-world examples
- Consider service-specific identifiers

## Creating Quality Patterns

### Pattern Design
- Use raw strings to avoid escaping issues
- Include only necessary capture groups
- Make patterns efficient and performant
- Consider case sensitivity requirements
- Account for optional components

### Version Group Identification
- Identify the correct capture group for version extraction
- Handle complex version formats appropriately
- Consider version ranges and wildcards
- Normalize version formats when possible
- Document any version format peculiarities

### Priority and Confidence
- Set appropriate priority values based on service commonality
- Assign realistic confidence levels based on testing
- Consider pattern specificity in confidence scoring
- Update values based on real-world performance
- Document any confidence considerations

## Testing Patterns

### Test Case Development
Create comprehensive test cases that include:

#### Positive Test Cases
- Various version formats for the target service
- Different service configurations
- Multiple service versions
- Edge cases and unusual formats

#### Negative Test Cases
- Services that should not match
- Similar services with different versions
- Common false positive sources
- Malformed or incomplete responses

### Validation Process
1. Use our [validation script](../tools/validate-pattern.py) to check JSON schema compliance
2. Test patterns against your test cases
3. Validate against real-world service responses when possible
4. Check for performance issues with large inputs
5. Verify no conflicts with existing patterns

### Testing Tools
```bash
# Validate pattern structure
python tools/validate-pattern.py patterns/web/apache.json

# Test pattern against specific input
python tools/test-pattern.py patterns/web/apache.json "Server: Apache/2.4.41 (Ubuntu)"

# Run comprehensive tests
python tools/test-suite.py patterns/web/apache.json
```

## Submission Process

### 1. Fork and Clone
```bash
git clone https://github.com/your-username/version-detection-db.git
cd version-detection-db
```

### 2. Create a Branch
```bash
git checkout -b pattern/new-service
```

### 3. Add Your Pattern
- Place patterns in the appropriate category directory
- Follow naming conventions: `service-name.json`
- Use the [template](TEMPLATE.md) as a guide
- Include comprehensive documentation

### 4. Validate Your Pattern
```bash
python tools/validate-pattern.py patterns/web/your-pattern.json
```

### 5. Test Your Pattern
```bash
python tools/test-pattern.py patterns/web/your-pattern.json
```

### 6. Commit and Push
```bash
git add patterns/web/your-pattern.json
git commit -m "Add pattern for Service Name version detection"
git push origin pattern/new-service
```

### 7. Create Pull Request
- Provide a clear title and description
- Include testing results and validation
- Reference any related issues
- Request review from maintainers

## Review Process

### Automated Checks
All submissions go through automated validation:
1. JSON schema validation
2. Pattern syntax checking
3. Test case validation
4. Duplicate detection

### Manual Review
Maintainers review submissions for:
1. Technical accuracy
2. Pattern quality and reliability
3. Documentation completeness
4. Test case comprehensiveness
5. Overall contribution value

### Community Feedback
- Community members can review and comment
- Feedback is considered during evaluation
- Constructive criticism is encouraged
- Consensus building when possible

### Approval and Merge
- Approved patterns are merged into main branch
- Authors are credited in commit history
- Patterns are published to the database
- Contributors are added to CONTRIBUTORS file

## Getting Help

### Documentation
- Review all template documentation
- Check existing patterns as examples
- Read through previous community contributions

### Community Support
- Ask questions in GitHub Discussions
- Join our community chat (if available)
- Reach out to maintainers directly

### Tools and Resources
- Use our validation and testing scripts
- Refer to regex documentation and best practices
- Utilize pattern testing platforms

## Recognition

We value all contributions to the database:
- All contributors are listed in our repository
- Significant contributions may be highlighted in release notes
- Outstanding contributors may be invited to join the maintainer team
- Your work helps security professionals worldwide

Thank you for helping to improve version detection for everyone!