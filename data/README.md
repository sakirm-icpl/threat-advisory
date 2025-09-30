# Product and Vendor Database

This directory contains structured information about software products and vendors that are referenced in the version detection patterns.

## Files

- `vendors.json` - Database of software vendors
- `products.json` - Database of software products

## Vendor Database Structure

```json
{
  "vendors": [
    {
      "id": "unique-vendor-id",
      "name": "Vendor Name",
      "website": "https://vendor-website.com",
      "description": "Brief description of the vendor",
      "metadata": {
        "created_at": "YYYY-MM-DDTHH:MM:SS",
        "updated_at": "YYYY-MM-DDTHH:MM:SS"
      }
    }
  ]
}
```

## Product Database Structure

```json
{
  "products": [
    {
      "id": "unique-product-id",
      "name": "Product Name",
      "vendor_id": "vendor-id-reference",
      "description": "Brief description of the product",
      "categories": ["web-server", "database", "application"],
      "website": "https://product-website.com",
      "first_release": "YYYY-MM-DD",
      "cpe": "cpe:/a:vendor:product",
      "metadata": {
        "created_at": "YYYY-MM-DDTHH:MM:SS",
        "updated_at": "YYYY-MM-DDTHH:MM:SS"
      }
    }
  ]
}
```

## Purpose

This database serves to:

1. Provide detailed information about vendors and products referenced in patterns
2. Enable cross-referencing between patterns and product information
3. Support vulnerability mapping and CVE correlation
4. Facilitate product categorization and filtering

## Contributing

When contributing new patterns, please also add relevant vendor and product information to these databases if they don't already exist.

## Validation

These files can be validated using standard JSON validation tools.

## License

This data is provided under the MIT License. See LICENSE file in the root directory for more information.