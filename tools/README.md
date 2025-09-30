# Tools

This directory contains utility scripts for working with the advisory database.

## Validation Tools

### validate-advisory.py

Validates a single advisory file against our schema and checks the completeness of the advisory data.

Usage:
```bash
python validate-advisory.py ../advisories/cve/cve-2024-12345.json
```

### validate-all-advisories.py

Validates all advisory files in the repository.

Usage:
```bash
python validate-all-advisories.py
```

## Summary Tools

### generate-advisory-summary.py

Generates a summary report of all advisories in the database, including statistics by category, severity, and other metrics.

Usage:
```bash
python generate-advisory-summary.py
```

## Tool Requirements

All tools are written in Python and require:
- Python 3.6 or higher

No additional Python packages are required for the validation tools.

## Contributing to Tools

When adding new tools or modifying existing ones:

1. Ensure the tool is well-documented with usage examples
2. Include error handling for common failure cases
3. Follow Python best practices and coding standards
4. Test the tool thoroughly before submitting
5. Update this README with information about new tools

## Tool Descriptions

### Advisory Validation

The validation tools check:

1. JSON schema compliance
2. Required fields completion
3. Reference URL validity
4. Metadata completeness
5. Severity and category values

These tools help ensure that all advisories in the database meet our quality standards and function correctly.