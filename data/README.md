# Data Structure

This directory contains structured data about threat categories, severity levels, and other metadata that can be used in conjunction with the advisory database.

## Files

- [categories.json](categories.json) - List of advisory categories
- [severity-levels.json](severity-levels.json) - Severity level definitions
- [vendors.json](vendors.json) - List of software vendors

## Category Structure

```json
{
  "categories": [
    {
      "id": "unique_identifier",
      "name": "Category Name",
      "description": "Brief description of the category"
    }
  ]
}
```

## Severity Level Structure

```json
{
  "severity_levels": [
    {
      "level": "critical",
      "description": "Immediate threat with severe impact",
      "cvss_range": "9.0-10.0"
    }
  ]
}
```

## Vendor Structure

```json
{
  "vendors": [
    {
      "id": "unique_identifier",
      "name": "Official Vendor Name",
      "website": "https://vendor-website.com",
      "description": "Brief description of the vendor"
    }
  ]
}
```

## Purpose

These files serve as reference data that can be used to:

1. Ensure consistency in category and severity naming across advisories
2. Provide additional context about threats and vulnerabilities
3. Enable cross-referencing between advisories and structured data
4. Support tools that consume the advisory database

## Contributing

When adding new categories, severity levels, or vendors:

1. Use existing entries as examples
2. Ensure IDs are unique and follow the naming convention
3. Provide accurate website URLs
4. Write clear, concise descriptions