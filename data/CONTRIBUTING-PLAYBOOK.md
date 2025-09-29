# Data Contribution Playbook

This playbook provides step-by-step instructions for contributing different types of data to the VersionIntel repository.

## Table of Contents

1. [Contributing Service Detection Patterns](#contributing-service-detection-patterns)
2. [Contributing Vendor Information](#contributing-vendor-information)
3. [Contributing Product Information](#contributing-product-information)
4. [Contributing CVE Mappings](#contributing-cve-mappings)
5. [Contributing AI Research Data](#contributing-ai-research-data)
6. [Validation and Submission](#validation-and-submission)

## Contributing Service Detection Patterns

### Step 1: Identify the Service Category
Determine which category your pattern belongs to:
- `networking` - SSH, FTP, SMTP, etc.
- `web` - Apache, Nginx, IIS, etc.
- `database` - MySQL, PostgreSQL, etc.
- `application` - Custom application patterns

### Step 2: Create the Pattern File
Create a new JSON file in the appropriate directory:
```bash
# Example for a new SSH service
touch data/service-patterns/networking/new-ssh-service.json
```

### Step 3: Define the Pattern
Add your pattern following the template:
```json
{
  "patterns": [
    {
      "name": "New SSH Service",
      "category": "networking",
      "pattern": "NewSSH_([\\d\\.]+)",
      "vendor": "New Vendor",
      "product": "New SSH Service",
      "version_group": 1,
      "priority": 150,
      "confidence": 0.9,
      "metadata": {
        "author": "Your Name",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "description": "Detects New SSH Service version from banner",
        "tags": ["ssh", "new-service"],
        "test_cases": [
          {
            "input": "SSH-2.0-NewSSH_1.2.3",
            "expected_version": "1.2.3"
          }
        ]
      }
    }
  ]
}
```

### Step 4: Test Your Pattern
Verify your pattern works with real service responses.

## Contributing Vendor Information

### Step 1: Check Existing Vendors
Review existing vendor files to ensure the vendor doesn't already exist:
```bash
ls data/products/*.json
```

### Step 2: Create Vendor File
Create a new JSON file for the vendor:
```bash
# Use vendor name or ID as filename
touch data/products/new-vendor.json
```

### Step 3: Add Vendor Information
```json
{
  "vendors": [
    {
      "id": "new-vendor-id",
      "name": "New Vendor Name",
      "website": "https://new-vendor.com",
      "description": "Description of the new vendor",
      "founded": "2020-01-01",
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

## Contributing Product Information

### Step 1: Ensure Vendor Exists
Verify the vendor for the product exists in the vendors data.

### Step 2: Create Product File
Create a new JSON file for the products:
```bash
# Group products by vendor
touch data/products/new-vendor-products.json
```

### Step 3: Add Product Information
```json
{
  "products": [
    {
      "id": "new-product-id",
      "name": "New Product Name",
      "vendor_id": "new-vendor-id",
      "description": "Description of the new product",
      "categories": ["web-server", "open-source"],
      "website": "https://new-vendor.com/new-product",
      "first_release": "2020-06-01",
      "cpe": "cpe:/a:new-vendor:new-product",
      "metadata": {
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "source": "official"
      }
    }
  ]
}
```

## Contributing CVE Mappings

### Step 1: Verify Product Exists
Ensure the product and vendor exist in the data repository.

### Step 2: Create CVE File
Create a new JSON file for CVE mappings:
```bash
# Group by vendor or year
touch data/vulnerabilities/new-vendor-cve-2024.json
```

### Step 3: Add CVE Mapping
```json
{
  "cve_mappings": [
    {
      "cve_id": "CVE-2024-12345",
      "product_id": "new-product-id",
      "vendor_id": "new-vendor-id",
      "affected_versions": [
        {
          "version": "1.0.0",
          "operator": "="
        },
        {
          "version": "1.1.0",
          "operator": "="
        }
      ],
      "cvss_score": 9.8,
      "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      "severity": "CRITICAL",
      "description": "Remote code execution vulnerability",
      "references": [
        "https://new-vendor.com/security/advisory",
        "https://nvd.nist.gov/vuln/detail/CVE-2024-12345"
      ],
      "published_date": "2024-01-01T00:00:00Z",
      "last_modified": "2024-01-01T00:00:00Z",
      "metadata": {
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "source": "nvd"
      }
    }
  ]
}
```

## Contributing AI Research Data

### Step 1: Define Research Scope
Determine the focus of your research data (version detection, pattern matching, etc.).

### Step 2: Create Research File
Create a new JSON file for research data:
```bash
# Use descriptive naming
touch data/ai-research/version-detection-research-001.json
```

### Step 3: Add Research Data
```json
{
  "research_datasets": [
    {
      "id": "version-detection-research-001",
      "title": "Version Detection in Complex Responses",
      "authors": ["Your Name"],
      "description": "Dataset for training models to detect versions in complex responses",
      "methodology": "Collected real-world service responses and manually extracted versions",
      "findings": "Identified patterns that improve detection accuracy by 12%",
      "data_samples": [
        {
          "input": "Complex service response with version info",
          "expected_output": "Product 1.2.3",
          "notes": "Example of complex version detection"
        }
      ],
      "references": [
        "https://research-paper.com",
        "https://dataset-source.com"
      ],
      "metadata": {
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "license": "MIT"
      }
    }
  ]
}
```

## Validation and Submission

### Step 1: Validate JSON Syntax
```bash
# Validate all JSON files you've created
python -m json.tool data/service-patterns/networking/new-ssh-service.json
python -m json.tool data/products/new-vendor.json
python -m json.tool data/products/new-vendor-products.json
python -m json.tool data/vulnerabilities/new-vendor-cve-2024.json
python -m json.tool data/ai-research/version-detection-research-001.json
```

### Step 2: Check File Structure
Ensure your files follow the established structure and naming conventions.

### Step 3: Commit Changes
```bash
# Add your files
git add data/service-patterns/networking/new-ssh-service.json
git add data/products/new-vendor.json
git add data/products/new-vendor-products.json
git add data/vulnerabilities/new-vendor-cve-2024.json
git add data/ai-research/version-detection-research-001.json

# Commit with descriptive message
git commit -m "feat(data): add new SSH service patterns and related data for New Vendor"
```

### Step 4: Create Pull Request
Submit a pull request with:
1. Clear description of what you've added
2. Reason for the contribution
3. Testing/validation results
4. References to official documentation

### Step 5: Respond to Feedback
Be prepared to address any feedback from maintainers during the review process.

## Need Help?

If you need assistance with your contribution:
1. Check the templates in each data directory
2. Review existing data files for examples
3. Ask questions in GitHub Issues or Discussions
4. Contact maintainers directly for complex contributions

Thank you for helping improve VersionIntel's data repository!