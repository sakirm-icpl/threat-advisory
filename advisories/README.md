# Advisory Database

This directory contains the threat advisories used to inform security professionals about emerging threats and vulnerabilities. Advisories are organized by category to make them easy to find and manage.

## Categories

- [cve](cve/) - Common Vulnerabilities and Exposures
- [malware](malware/) - Malware threat advisories
- [apt](apt/) - Advanced Persistent Threat group advisories
- [vulnerability](vulnerability/) - General vulnerability advisories
- [threat](threat/) - General threat advisories

## Advisory Structure

Each advisory file follows a standardized JSON structure defined in our [template](TEMPLATE.md). This ensures consistency across all advisories and makes them easy to process programmatically.

## Naming Convention

Advisory files should be named using the advisory ID in lowercase:
- threat-2024-001.json
- cve-2024-12345.json
- apt29-campaign.json

## Contributing

To contribute new advisories or improve existing ones:

1. Follow our [contribution guidelines](CONTRIBUTING.md)
2. Use the [advisory template](TEMPLATE.md) as a starting point
3. Ensure all required fields are completed
4. Include comprehensive references and recommendations
5. Validate your advisory with our tools

## Validation

All advisories are validated using our [advisory validation tool](../tools/validate-advisory.py) which checks:

- JSON schema compliance
- Required fields completion
- Reference URL validity
- Metadata completeness

Advisories that don't pass validation will not be accepted.