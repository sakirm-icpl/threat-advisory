# VersionIntel Data Repository

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Issues](https://img.shields.io/github/issues/your-username/versionintel.svg)](https://github.com/your-username/versionintel/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/your-username/versionintel.svg)](https://github.com/your-username/versionintel/pulls)
[![Contributors](https://img.shields.io/github/contributors/your-username/versionintel.svg)](https://github.com/your-username/versionintel/graphs/contributors)
[![Data Count](https://img.shields.io/badge/Data%20Entries-17-blue.svg)](data/)

**VersionIntel Data Repository** is an open-source collection of service detection patterns, vendor/product information, vulnerability mappings, and AI research data designed to help security researchers and developers identify software versions and detect vulnerabilities.

## 🌟 About This Repository

This repository contains structured data for the VersionIntel platform, focusing on community contributions of security research data. The data here helps identify software versions through pattern matching and AI analysis.

The repository has been initialized with data from `export.json`, containing 13 vendors and 17 products with their associated detection methods.

## 📂 Repository Structure

```
versionintel/
├── data/                    # Structured data for community contributions
│   ├── service-patterns/   # Service detection patterns organized by type
│   │   ├── database/       # Database service patterns (1 pattern)
│   │   ├── networking/     # Networking service patterns (3 patterns)
│   │   ├── web/            # Web service patterns (10 patterns)
│   │   ├── TEMPLATE.md     # Template for service patterns
│   │   └── CONTRIBUTING-DETECTION-METHODS.md # Guide for detection methods
│   ├── products/           # Vendor and product information (13 vendors, 17 products)
│   ├── vulnerabilities/    # CVE and vulnerability mappings
│   ├── ai-research/        # AI training data and research findings
│   ├── README.md           # Guide to data structure and contribution
│   └── CONTRIBUTING-PLAYBOOK.md # Step-by-step contribution guide
├── docs/                   # Documentation for contributors
│   ├── community/          # Community contribution guides
│   └── index.html          # Static website for GitHub Pages
└── .github/                # GitHub integration files
```

## 🤝 Contributing Data

We welcome contributions from the security research community! Help improve VersionIntel's detection capabilities by contributing:

### Types of Data Contributions

1. **Service Detection Patterns** - Regex patterns used to identify services from their responses
2. **Vendor/Product Information** - Database of software vendors and their products
3. **Vulnerability Mappings** - Links between products/versions and known CVEs
4. **AI Research Data** - Training data and research findings for AI analysis

### How to Contribute Detection Methods

Community members can contribute new detection methods by:

1. **Research**: Identify a service that isn't currently detected
2. **Pattern Development**: Create regex patterns to detect the service and extract versions
3. **Testing**: Develop comprehensive test cases with real service responses
4. **Documentation**: Provide clear documentation and proof of concept
5. **Submission**: Follow the contribution guidelines to submit your pattern

For detailed instructions, see the [Detection Methods Contribution Guide](data/service-patterns/CONTRIBUTING-DETECTION-METHODS.md).

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b data/new-contribution`
3. Add your data following the [Contribution Playbook](data/CONTRIBUTING-PLAYBOOK.md)
4. Commit your changes: `git commit -am 'Add new data contribution'`
5. Push to the branch: `git push origin data/new-contribution`
6. Create a new Pull Request

Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for details.

## 📖 Documentation

Comprehensive documentation for contributors is available:

- [Data Repository Guide](data/README.md) - Complete data structure and contribution guidelines
- [Contribution Playbook](data/CONTRIBUTING-PLAYBOOK.md) - Step-by-step contribution instructions
- [Detection Methods Guide](data/service-patterns/CONTRIBUTING-DETECTION-METHODS.md) - How to contribute service detection patterns
- [Community Guides](docs/community/) - Additional contribution resources
- [Integration Summary](INTEGRATION_SUMMARY.md) - Summary of data integration from export.json

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- 📖 **Documentation**: Comprehensive guides available in [data/](data/) and [docs/](docs/)
- 🐛 **Issues**: Report issues via [GitHub Issues](https://github.com/your-username/versionintel/issues)
- 💬 **Discussions**: Join community discussions on [GitHub Discussions](https://github.com/your-username/versionintel/discussions)

### Community

- **Contributors**: [See our contributors](https://github.com/your-username/versionintel/graphs/contributors)
- **Code of Conduct**: [Read our Code of Conduct](CODE_OF_CONDUCT.md)
- **Contributing Guide**: [Learn how to contribute](CONTRIBUTING.md)

---

**Built with ❤️ by the VersionIntel Community**

*Empowering security through community-driven data contributions.*

[Project Website](docs/index.html) | [Data Documentation](data/) | [Contributing](CONTRIBUTING.md) | [License](LICENSE)