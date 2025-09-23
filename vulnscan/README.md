# Security Scanner Platform

A comprehensive, modular security scanner platform that combines network and host-based scanning capabilities to identify vulnerabilities across enterprise environments.

## Features

- **Network Scanning**: Nmap-based host discovery, port scanning, and service detection
- **Host-Based Scanning**: Cross-platform software inventory and version detection
- **Vulnerability Mapping**: Multi-source CVE integration (NVD, Vulners, OSV)
- **Risk Assessment**: Intelligent vulnerability prioritization and scoring
- **Reporting**: Multi-format reports (JSON, HTML, PDF) with customizable templates
- **API & CLI**: RESTful API and command-line interface
- **Scalability**: Microservices architecture with horizontal scaling support

## Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Redis 6+
- Nmap (for network scanning)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd security-scanner-platform
```

2. Install dependencies:
```bash
make install-dev
```

3. Set up environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development services:
```bash
make dev-start
```

5. Run tests:
```bash
make test
```

### Usage

#### CLI Interface

```bash
# Check configuration
security-scanner config-check

# Start a network scan
security-scanner scan start 192.168.1.0/24 --type network

# Generate a report
security-scanner report generate --scan-id <scan-id> --format html

# Start API server
security-scanner server start-api
```

#### API Interface

Start the API server:
```bash
make run-api
```

Access the API documentation at: http://localhost:8000/docs

## Development

### Project Structure

```
src/security_scanner/
├── core/           # Core utilities and configuration
├── models/         # Data models and database schemas
├── scanners/       # Scanning engine implementations
├── api/           # REST API endpoints
├── cli/           # Command-line interface
├── services/      # Business logic services
└── utils/         # Utility functions

tests/             # Test suite
├── core/          # Core component tests
├── scanners/      # Scanner tests
├── api/          # API tests
└── integration/   # Integration tests
```

### Development Commands

```bash
# Install development dependencies
make install-dev

# Run tests with coverage
make test-cov

# Format code
make format

# Run linting
make lint

# Type checking
make type-check

# Start development environment
make dev-start

# Stop development environment
make dev-stop
```

### Testing

The project uses pytest for testing with the following test categories:

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete workflows

Run tests:
```bash
# All tests
make test

# With coverage
make test-cov

# Specific test categories
pytest -m unit
pytest -m integration
pytest -m e2e
```

## Configuration

Configuration is managed through environment variables and the `.env` file. Key settings include:

- **Database**: PostgreSQL connection settings
- **Redis**: Cache and message broker settings
- **Security**: JWT tokens and encryption keys
- **Scanning**: Nmap paths, timeouts, and limits
- **External APIs**: CVE data source API keys

See `.env.example` for all available configuration options.

## Architecture

The platform follows a microservices architecture with the following components:

- **API Gateway**: Central entry point for all client interactions
- **Scan Orchestrator**: Coordinates scanning workflows
- **Network Scanner**: Handles Nmap integration and network discovery
- **Host Scanner**: Manages host-based software inventory
- **Vulnerability Mapper**: Integrates with CVE data sources
- **Data Aggregator**: Processes and correlates scan results
- **Report Generator**: Creates multi-format reports
- **Alert Manager**: Handles notifications and alerting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- Use Black for code formatting
- Follow PEP 8 guidelines
- Add type hints for all functions
- Write docstrings for all public APIs
- Maintain test coverage above 90%

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

For security issues, please email security@security-scanner.com instead of using the issue tracker.

## Support

- Documentation: [Link to docs]
- Issues: [GitHub Issues]
- Discussions: [GitHub Discussions]