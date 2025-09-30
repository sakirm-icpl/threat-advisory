# Version Detection Pattern Database

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Issues](https://img.shields.io/github/issues/sakirm-icpl/version-detection-db.svg)](https://github.com/sakirm-icpl/version-detection-db/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/sakirm-icpl/version-detection-db.svg)](https://github.com/sakirm-icpl/version-detection-db/pulls)
[![Contributors](https://img.shields.io/github/contributors/sakirm-icpl/version-detection-db.svg)](https://github.com/sakirm-icpl/version-detection-db/graphs/contributors)
[![Patterns](https://img.shields.io/badge/Patterns-100+-blue.svg)](patterns/)

**Version Detection Pattern Database** is an open-source collection of regex patterns designed to help security researchers, penetration testers, and developers identify software versions through service banners, HTTP responses, and other network protocol responses.

## 🌟 About This Repository

This repository serves as a community-driven database of regex patterns for version detection of various software products. Each pattern is carefully crafted and tested to accurately identify software versions from network responses, making it invaluable for:

- Security scanning tools
- Penetration testing
- Vulnerability assessment
- Bug bounty hunting
- Asset discovery and inventory
- Network reconnaissance

## 📂 Repository Structure

```
version-detection-db/
├── patterns/               # Regex patterns organized by category
│   ├── web/                # Web server/application patterns
│   ├── networking/         # Networking service patterns
│   ├── database/           # Database service patterns
│   ├── messaging/          # Messaging service patterns
│   ├── TEMPLATE.md         # Template for new patterns
│   └── CONTRIBUTING.md     # Guide for pattern contributions
├── data/                   # Product and vendor information
│   ├── products.json       # Database of software products
│   ├── vendors.json        # Database of software vendors
│   └── README.md           # Guide to data structure
├── docs/                   # Documentation for contributors and users
│   ├── community/          # Community contribution guides
│   └── index.html          # Static website for GitHub Pages
├── tools/                  # Validation and testing tools
│   └── validate-pattern.py # Pattern validation script
└── .github/                # GitHub integration files
```

## 🎯 Use Cases

### Security Scanning Tools
Integrate these patterns into your security scanners to automatically detect software versions during assessments.

### Penetration Testing
Use patterns to quickly identify target software versions for vulnerability research.

### Bug Bounty Hunting
Rapidly identify potentially vulnerable software versions in scope targets.

### Asset Discovery
Automate the discovery and cataloging of software assets in your network.

### Vulnerability Assessment
Cross-reference detected versions with vulnerability databases to identify potential security risks.

## 🤝 Contributing Patterns

We welcome contributions from the security research community! Help expand our database by contributing new regex patterns.

### Types of Pattern Contributions

1. **Web Server Patterns** - Apache, Nginx, IIS, etc.
2. **Database Patterns** - MySQL, PostgreSQL, MongoDB, etc.
3. **Networking Service Patterns** - SSH, FTP, SMTP, etc.
4. **Application Patterns** - CMS, frameworks, custom applications
5. **Messaging Patterns** - Kafka, RabbitMQ, ActiveMQ, etc.

### How to Contribute Detection Patterns

Community members can contribute new detection patterns by:

1. **Research**: Identify a service that isn't currently detected or needs improved detection
2. **Pattern Development**: Create regex patterns to detect the service and extract versions
3. **Testing**: Develop comprehensive test cases with real service responses
4. **Documentation**: Provide clear documentation and proof of concept
5. **Submission**: Follow the contribution guidelines to submit your pattern

For detailed instructions, see the [Pattern Contribution Guide](patterns/CONTRIBUTING.md).

### Getting Started for New Contributors

If you're new to open-source contribution or cybersecurity research, we've created special resources to help you get started:

- [Beginner's Guide](docs/community/beginners-guide.html) - Step-by-step introduction for new contributors
- [Good First Issues](docs/community/good-first-issues.html) - Curated list of beginner-friendly contribution opportunities
- [Pattern Development Guide](docs/community/pattern-development.html) - Best practices for creating effective patterns

### Standard Contribution Process

1. Fork the repository
2. Create a feature branch: `git checkout -b pattern/new-service`
3. Add your pattern following the [Pattern Template](patterns/TEMPLATE.md)
4. Validate your pattern with our [validation script](tools/validate-pattern.py)
5. Commit your changes: `git commit -am 'Add pattern for NewService'`
6. Push to the branch: `git push origin pattern/new-service`
7. Create a new Pull Request

Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for details.

## 📖 Documentation

Comprehensive documentation for contributors and users is available:

- [Pattern Database Guide](patterns/README.md) - Complete pattern structure and contribution guidelines
- [Pattern Template](patterns/TEMPLATE.md) - Template for creating new patterns
- [Contribution Guide](patterns/CONTRIBUTING.md) - Step-by-step contribution instructions
- [Data Structure Guide](data/README.md) - Product and vendor database information
- [Community Guides](docs/community/) - Additional contribution resources
- [Tool Documentation](tools/README.md) - Validation and testing tools

## 🛠️ Tools

### Pattern Validation
Validate your patterns using our validation script:
```bash
python tools/validate-pattern.py patterns/web/apache.json
```

### Pattern Testing
Test patterns against real service responses:
```bash
python tools/test-pattern.py patterns/networking/ssh.json
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- 📖 **Documentation**: Comprehensive guides available in [patterns/](patterns/) and [docs/](docs/)
- 🐛 **Issues**: Report issues via [GitHub Issues](https://github.com/sakirm-icpl/version-detection-db/issues)
- 💬 **Discussions**: Join community discussions on [GitHub Discussions](https://github.com/sakirm-icpl/version-detection-db/discussions)

### Community

- **Contributors**: [See our contributors](https://github.com/sakirm-icpl/version-detection-db/graphs/contributors)
- **Code of Conduct**: [Read our Code of Conduct](CODE_OF_CONDUCT.md)
- **Contributing Guide**: [Learn how to contribute](CONTRIBUTING.md)

---

**Built with ❤️ by the Version Detection Community**

*Empowering security through community-driven version detection patterns.*

[Project Website](https://sakirm-icpl.github.io/version-detection-db/) | [Pattern Database](patterns/) | [Contributing](CONTRIBUTING.md) | [License](LICENSE)