# Contributing to VersionIntel

Thank you for your interest in contributing to VersionIntel! We welcome contributions from the community to help improve our platform for version detection and vulnerability analysis.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How You Can Contribute](#how-you-can-contribute)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Adding New Data](#adding-new-data)
- [Code Style and Quality](#code-style-and-quality)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to help us maintain a welcoming and inclusive community.

## How You Can Contribute

There are many ways to contribute to VersionIntel:

1. **Report bugs** - Help us identify issues in the platform
2. **Suggest features** - Propose new capabilities or improvements
3. **Add detection patterns** - Contribute new service identification patterns
4. **Fix bugs** - Resolve existing issues in the codebase
5. **Improve documentation** - Enhance guides and explanations
6. **Write tests** - Increase test coverage and quality
7. **Translate content** - Help make VersionIntel accessible to more users

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/versionintel.git`
3. Create a new branch for your contribution: `git checkout -b feature/your-feature-name`
4. Follow the [Development Setup Guide](docs/development/setup.md) to set up your environment

## Development Process

We follow a standard GitHub workflow:

1. Create an issue describing your proposed change (for significant changes)
2. Fork the repository and create your branch from `main`
3. Make your changes, following our [code standards](docs/development/code-standards.md)
4. Add or update tests as needed
5. Ensure all tests pass
6. Update documentation if necessary
7. Commit your changes using [conventional commit messages](https://www.conventionalcommits.org/)
8. Push your branch to your fork
9. Open a pull request to the `main` branch

## Adding New Data

VersionIntel relies on community contributions to expand its detection capabilities. You can contribute:

### Service Detection Patterns
- Add new service banners in [patterns/](patterns/)
- Follow the [Data Contribution Guide](docs/community/data-contribution.md)
- Ensure patterns are well-documented and tested

### Product/Vendor Information
- Add new products to the database via the API
- Submit vendor information through the platform
- Contribute CVE mappings for better vulnerability detection

### AI Research Data
- Share findings from security research
- Contribute to our knowledge base of version detection techniques
- Provide examples of challenging detection scenarios

## Code Style and Quality

### Backend (Python/Flask)
- Follow [PEP 8](https://pep8.org/) style guide
- Use [Black](https://github.com/psf/black) for code formatting
- Maintain 85%+ test coverage
- Use type hints where possible

### Frontend (JavaScript/React)
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code formatting
- Maintain 80%+ test coverage
- Use functional components and hooks

### General Guidelines
- Write clear, self-documenting code
- Include comments for complex logic
- Keep functions small and focused
- Follow existing patterns in the codebase

## Testing

### Backend Testing
```bash
# Run all backend tests
cd backend && python -m pytest

# Run tests with coverage
cd backend && python -m pytest --cov=app
```

### Frontend Testing
```bash
# Run all frontend tests
cd frontend && npm test

# Run tests with coverage
cd frontend && npm test -- --coverage
```

### Integration Testing
- Test API endpoints with tools like Postman
- Verify UI functionality in different browsers
- Check database migrations and data integrity

## Documentation

Good documentation is crucial for an open-source project. When contributing:

1. Update README files when changing functionality
2. Add docstrings to new functions and classes
3. Create or update user guides for new features
4. Include examples and screenshots where helpful
5. Keep documentation up-to-date with code changes

## Pull Request Process

1. Ensure your changes are well-tested and documented
2. Follow the [Pull Request Template](.github/pull_request_template.md)
3. Include a clear description of the changes
4. Reference any related issues
5. Request review from maintainers
6. Address feedback promptly
7. Squash commits if requested

### PR Requirements
- All tests must pass
- Code must follow style guidelines
- Documentation must be updated
- Changes must be reviewed and approved

## Community

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General discussion and questions
- **Email**: Contact maintainers directly for sensitive issues

### Recognition
We value all contributions and recognize contributors in:
- Release notes
- Contributor list
- Annual community report

### Support
If you need help with your contribution:
1. Check existing documentation
2. Search issues and discussions
3. Ask in GitHub Discussions
4. Contact maintainers directly

Thank you for helping make VersionIntel better for everyone!