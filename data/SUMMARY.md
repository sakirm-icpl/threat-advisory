# VersionIntel Data Repository Summary

This repository contains structured data about software products and their detection methods for version identification.

## Products Data

The `data/products/` directory contains:

1. `vendors.json` - Information about software vendors
2. `products.json` - Information about software products

## Service Detection Patterns

The `data/service-patterns/` directory contains detection patterns organized by category:

### Networking Patterns
- `sami-ftp-server.json` - Detects Karjasoft Sami FTP Server
- `slimftpd.json` - Detects Whitsoft Development SlimFTPd
- `blackmoon-ftp-server.json` - Detects Blackmoon FTP Server
- `openssh.json` - Existing pattern for OpenSSH
- `ftp-servers.json` - Existing patterns for other FTP servers

### Web Patterns
- `apache-traffic-server.json` - Detects Apache Traffic Server
- `apache-answer.json` - Detects Apache Answer
- `apache-pulsar.json` - Detects Apache Pulsar
- `apiman.json` - Detects Apiman
- `argocd.json` - Detects Argo CD
- `concrete-cms.json` - Detects Concrete CMS
- `go-ethereum.json` - Detects Go Ethereum
- `kibana.json` - Detects Elastic Kibana
- `liferay.json` - Detects Liferay Portal
- `zenml.json` - Detects ZenML
- `web-servers.json` - Existing patterns for other web servers

### Database Patterns
- `couchbase.json` - Detects Couchbase Server

## Contributing

See `CONTRIBUTING-DETECTION-METHODS.md` for guidelines on how to contribute new detection methods.

## Validation

Pattern files can be validated using the `validate-pattern.py` script:

```bash
python validate-pattern.py <pattern-file.json>
```

## Pattern Format

Each pattern file follows the format specified in `TEMPLATE.md` with:
- Name and category
- Regular expression pattern with version capture group
- Vendor and product information
- Priority and confidence levels
- Metadata with author information and test cases