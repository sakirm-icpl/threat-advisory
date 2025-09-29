# VersionIntel Data Repository

This directory contains structured data about software products and their detection methods for version identification.

## Directory Structure

- `products/` - Vendor and product information
- `service-patterns/` - Detection patterns organized by category
- `vulnerabilities/` - Vulnerability data (if applicable)
- `ai-research/` - AI research data (if applicable)

## Products Data

The `products/` directory contains structured information about software vendors and products:

- `vendors.json` - List of software vendors
- `products.json` - List of software products with their attributes

## Service Detection Patterns

The `service-patterns/` directory contains detection patterns organized by category:

### Categories
- `networking/` - Network service detection patterns (FTP, SSH, etc.)
- `web/` - Web application detection patterns
- `database/` - Database detection patterns

### Pattern Files

Each pattern file follows the format specified in `TEMPLATE.md` and contains:

- Name and category
- Regular expression pattern with version capture group
- Vendor and product information
- Priority and confidence levels
- Metadata with author information and test cases

## Contributing

See `CONTRIBUTING-DETECTION-METHODS.md` for guidelines on how to contribute new detection methods.

## Validation

Pattern files can be validated using the `validate-pattern.py` script:

```bash
python validate-pattern.py <pattern-file.json>
```

## License

This data is provided under the MIT License. See LICENSE file in the root directory for more information.
