# Pattern Database

This directory contains the regex patterns used to detect software versions. Patterns are organized by category to make them easy to find and manage.

## Categories

- [web](web/) - Web servers, proxies, and web-related technologies
- [networking](networking/) - Routers, switches, firewalls, and other networking devices
- [database](database/) - Database management systems
- [messaging](messaging/) - Message queues, brokers, and messaging systems
- [os](os/) - Operating systems
- [cms](cms/) - Content management systems
- [framework](framework/) - Software frameworks and libraries

## Getting Started

1. Use our [pattern template](TEMPLATE.md) as a starting point for new patterns
2. Follow our [contribution guidelines](CONTRIBUTING.md)
3. Include comprehensive test cases
4. Validate your pattern with our tools

## Validation

All patterns are validated using our [pattern validation tool](../tools/validate-pattern.py) which checks:

- JSON schema compliance
- Regex pattern compilation
- Test case execution
- Metadata completeness

Patterns that don't pass validation will not be accepted.

## License

This pattern database is provided under the MIT License. See [LICENSE](../LICENSE) file in the root directory for more information.