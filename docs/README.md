# VersionIntel Data Repository Documentation

Welcome to the VersionIntel Data Repository documentation. This guide will help you understand and contribute to the VersionIntel data collection - a community-driven repository of service detection patterns and security research data.

## Table of Contents

### 👥 Community
- [Data Contribution Guide](community/data-contribution.md) - How to contribute detection patterns and data
- [Adding New Data](community/adding-new-data.md) - Detailed instructions for data contributions
- [Contributing Guide](../CONTRIBUTING.md) - General contribution guidelines
- [Code of Conduct](../CODE_OF_CONDUCT.md) - Community standards and expectations

## Overview

VersionIntel Data Repository is a community-driven collection of service detection patterns, vendor/product information, vulnerability mappings, and AI research data. The data in this repository helps identify software versions through pattern matching and AI analysis.

## Repository Structure

```
versionintel/
├── data/                    # Structured data for community contributions
│   ├── service-patterns/   # Service detection patterns organized by type
│   │   ├── database/       # Database service patterns
│   │   ├── networking/     # Networking service patterns
│   │   ├── web/            # Web service patterns
│   │   └── application/    # Application-specific patterns
│   ├── products/           # Vendor and product information
│   ├── vulnerabilities/    # CVE and vulnerability mappings
│   ├── ai-research/        # AI training data and research findings
│   ├── README.md           # Guide to data structure and contribution
│   └── CONTRIBUTING-PLAYBOOK.md # Step-by-step contribution guide
├── docs/                   # Documentation for contributors
│   ├── community/          # Community contribution guides
│   └── index.html          # Static website for GitHub Pages
└── .github/                # GitHub integration files
```

## Data Contribution Resources

For detailed information on contributing different types of data, see:

- [Data Repository Guide](../data/README.md) - Complete data structure and contribution guidelines
- [Contribution Playbook](../data/CONTRIBUTING-PLAYBOOK.md) - Step-by-step contribution instructions
- [Service Patterns Template](../data/service-patterns/TEMPLATE.md) - Template for service detection patterns
- [Products Template](../data/products/TEMPLATE.md) - Template for vendor/product information
- [Vulnerabilities Template](../data/vulnerabilities/TEMPLATE.md) - Template for CVE mappings
- [AI Research Template](../data/ai-research/TEMPLATE.md) - Template for research data

## Getting Help

If you need help with contributing to the VersionIntel Data Repository:

1. **Check Documentation**: Start with the guides in the [data/](../data/) directory
2. **GitHub Issues**: Report issues or request new pattern categories
3. **GitHub Discussions**: Ask questions and connect with the community

## Contributing

We welcome contributions from the community! See our [Contributing Guide](../CONTRIBUTING.md) for details on how to get involved.

## License

VersionIntel Data Repository is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.