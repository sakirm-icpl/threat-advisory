# Vendor and Product Data Template

This template shows how to structure vendor and product information for contribution to the VersionIntel data repository.

## Vendor Template

```json
{
  "vendors": [
    {
      "id": "unique-vendor-id",
      "name": "Vendor Name",
      "website": "https://vendor-website.com",
      "description": "Brief description of the vendor/company",
      "founded": "YYYY-MM-DD",
      "country": "Country Code (ISO 3166-1 alpha-2)",
      "metadata": {
        "created_at": "YYYY-MM-DDTHH:MM:SSZ",
        "updated_at": "YYYY-MM-DDTHH:MM:SSZ",
        "source": "official|community|research"
      }
    }
  ]
}
```

### Vendor Fields

| Field | Description | Required |
|-------|-------------|----------|
| `id` | Unique identifier (lowercase, hyphen-separated) | Yes |
| `name` | Full vendor/company name | Yes |
| `website` | Official website URL | Yes |
| `description` | Brief description of the vendor | Yes |
| `founded` | Company founding date (YYYY-MM-DD) | No |
| `country` | Country code (ISO 3166-1 alpha-2) | No |
| `metadata` | Additional information | Yes |

## Product Template

```json
{
  "products": [
    {
      "id": "unique-product-id",
      "name": "Product Name",
      "vendor_id": "vendor-id-from-vendors-file",
      "description": "Brief description of the product",
      "categories": ["category1", "category2"],
      "website": "https://product-website.com",
      "first_release": "YYYY-MM-DD",
      "cpe": "cpe:/a:vendor:product",
      "metadata": {
        "created_at": "YYYY-MM-DDTHH:MM:SSZ",
        "updated_at": "YYYY-MM-DDTHH:MM:SSZ",
        "source": "official|community|research"
      }
    }
  ]
}
```

### Product Fields

| Field | Description | Required |
|-------|-------------|----------|
| `id` | Unique identifier (lowercase, hyphen-separated) | Yes |
| `name` | Full product name | Yes |
| `vendor_id` | Reference to vendor ID | Yes |
| `description` | Brief description of the product | Yes |
| `categories` | Array of product categories | Yes |
| `website` | Official product website | Yes |
| `first_release` | Initial release date (YYYY-MM-DD) | No |
| `cpe` | Common Platform Enumeration identifier | No |
| `metadata` | Additional information | Yes |

## Categories

Common product categories include:
- `web-server`
- `database`
- `operating-system`
- `application-server`
- `firewall`
- `load-balancer`
- `reverse-proxy`
- `mail-server`
- `ftp-server`
- `ssh-server`
- `cms`
- `framework`
- `library`
- `open-source`
- `proprietary`

## Examples

### Adding a New Vendor

File: `data/products/security-company.json`

```json
{
  "vendors": [
    {
      "id": "acme-security",
      "name": "ACME Security Solutions",
      "website": "https://acme-security.com",
      "description": "Leading provider of enterprise security solutions",
      "founded": "2010-03-15",
      "country": "US",
      "metadata": {
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "source": "official"
      }
    }
  ]
}
```

### Adding Products for the New Vendor

File: `data/products/acme-products.json`

```json
{
  "products": [
    {
      "id": "acme-firewall-pro",
      "name": "Firewall Pro",
      "vendor_id": "acme-security",
      "description": "Enterprise-grade next-generation firewall solution",
      "categories": ["firewall", "network-security", "proprietary"],
      "website": "https://acme-security.com/products/firewall-pro",
      "first_release": "2015-06-01",
      "cpe": "cpe:/a:acme-security:firewall_pro",
      "metadata": {
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "source": "official"
      }
    },
    {
      "id": "acme-intrusion-detection",
      "name": "Intrusion Detection System",
      "vendor_id": "acme-security",
      "description": "Advanced network intrusion detection and prevention system",
      "categories": ["ids", "ips", "network-security", "proprietary"],
      "website": "https://acme-security.com/products/intrusion-detection",
      "first_release": "2018-09-10",
      "cpe": "cpe:/a:acme-security:intrusion_detection_system",
      "metadata": {
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "source": "official"
      }
    }
  ]
}
```

## Contribution Guidelines

1. **File Naming**: Use descriptive names like `vendor-name.json` for vendor files and `vendor-products.json` for product files
2. **Unique IDs**: Ensure all IDs are unique across the repository
3. **Valid JSON**: Validate your JSON before submitting
4. **Accurate Information**: Verify all information is correct and up-to-date
5. **Proper Categories**: Use existing categories when possible
6. **Metadata**: Always include proper metadata with timestamps
7. **References**: Link products to existing vendors using the vendor_id field

## Validation

Before submitting your contribution, validate your JSON:

```bash
# Using Python
python -m json.tool your-file.json

# Using Node.js
node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('your-file.json')), null, 2))"
```