# CVE Search Client

A Python script for querying the open-source `cve-search` API to find CVEs (Common Vulnerabilities and Exposures) affected by specific vendors and products.

## Features

- 🔍 Query CVEs by vendor and product using the `/api/cvefor/:vendor/:product` endpoint
- 📊 Extract and display CVE ID, summary, CVSS score, publish date, and severity
- 🛡️ Comprehensive error handling for API failures, connection issues, and missing results
- 🔄 Interactive mode for multiple searches
- 📝 Formatted output with clear results presentation
- ⚙️ Configurable server URL and timeout settings

## Prerequisites

- Python 3.6 or higher
- `requests` library
- A running `cve-search` server (see [cve-search documentation](https://github.com/cve-search/cve-search))

## Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements_cve_client.txt
   ```

2. **Make the script executable (optional):**
   ```bash
   chmod +x cve_search_client.py
   ```

## Usage

### Basic Usage

Search for CVEs affecting a specific vendor and product:

```bash
python cve_search_client.py <vendor> <product>
```

**Examples:**
```bash
# Search for Apache HTTP Server vulnerabilities
python cve_search_client.py apache http_server

# Search for Microsoft Windows vulnerabilities
python cve_search_client.py microsoft windows

# Search for OpenSSL vulnerabilities
python cve_search_client.py openssl openssl
```

### Advanced Usage

**Specify a custom server URL:**
```bash
python cve_search_client.py --server http://192.168.1.100:5000 apache tomcat
```

**Run in interactive mode:**
```bash
python cve_search_client.py --interactive
```

**Enable verbose output:**
```bash
python cve_search_client.py --verbose apache http_server
```

**Get help:**
```bash
python cve_search_client.py --help
```

### Interactive Mode

Interactive mode allows you to perform multiple searches without restarting the script:

```bash
python cve_search_client.py --interactive
```

Example session:
```
🔍 CVE Search Interactive Mode
========================================
✅ Connected to cve-search server at http://localhost:5000

Enter vendor name (or 'quit' to exit): apache
Enter product name: tomcat

Searching for CVEs affecting apache/tomcat...
Querying: http://localhost:5000/api/cvefor/apache/tomcat

🔍 Search Results for apache / tomcat
📊 Total CVEs found: 15

================================================================================

1. CVE ID: CVE-2021-42340
   Summary: In Apache Tomcat 10.1.0-M1 to 10.1.0-M8, 10.0.0-M1 to 10.0.14, 9.0.54 to 9.0.56, and 8.5.54 to 8.5.56, the Form authentication example in the examples web application displayed user provided data without filtering, causing a stored XSS vulnerability.
   CVSS Score: 6.1
   Severity: MEDIUM
   Published: 2021-11-15T00:00:00Z
   References: 3 found
----------------------------------------
```

## API Integration

### Using the CVESearchClient Class

You can also use the `CVESearchClient` class in your own Python scripts:

```python
from cve_search_client import CVESearchClient, print_results

# Initialize client
client = CVESearchClient("http://localhost:5000")

# Search for CVEs
results = client.search_cves_by_vendor_product("apache", "http_server")

# Print results
print_results(results)

# Access raw data
if 'results' in results:
    for cve in results['results']:
        print(f"CVE: {cve['id']}")
        print(f"Summary: {cve['summary']}")
        print(f"CVSS Score: {cve['cvss_score']}")
        print(f"Published: {cve['publish_date']}")
```

### Response Format

The script returns a structured dictionary with the following format:

```python
{
    'results': [
        {
            'id': 'CVE-2021-44228',
            'summary': 'CVE description...',
            'cvss_score': 9.8,
            'publish_date': '2021-12-10T00:00:00Z',
            'severity': 'CRITICAL',
            'references': ['http://example.com/ref1', 'http://example.com/ref2'],
            'raw_data': {...}  # Original API response
        }
    ],
    'total_results': 1,
    'search_params': {'vendor': 'apache', 'product': 'http_server'},
    'timestamp': '2024-01-15T10:30:00.123456'
}
```

## Error Handling

The script handles various error scenarios:

### Connection Errors
- **Server not running:** Clear error message with instructions
- **Network issues:** Timeout and connection error handling
- **Invalid server URL:** Proper error reporting

### API Errors
- **404 Not Found:** No CVEs found for the specified vendor/product
- **500 Internal Server Error:** Server-side issues
- **Invalid JSON response:** Malformed API responses

### Data Processing Errors
- **Missing fields:** Graceful handling of incomplete CVE data
- **Invalid data types:** Type conversion and validation
- **Empty results:** Clear indication when no CVEs are found

## Testing

Run the test script to verify functionality:

```bash
# Run all test cases
python test_cve_search_client.py

# Run single test
python test_cve_search_client.py single
```

## Troubleshooting

### Common Issues

1. **"Failed to connect to cve-search server"**
   - Ensure the cve-search server is running
   - Check the server URL and port
   - Verify network connectivity

2. **"No CVEs found"**
   - Verify vendor and product names are correct
   - Check if the cve-search database is populated
   - Try different case variations (e.g., "Apache" vs "apache")

3. **"Request timed out"**
   - The server may be overloaded
   - Try again later
   - Check server performance

4. **"Invalid JSON response"**
   - The API may have changed its response format
   - Check cve-search version compatibility
   - Review server logs for errors

### Debug Mode

Enable verbose output to see detailed request information:

```bash
python cve_search_client.py --verbose apache http_server
```

### Server Status Check

The script automatically checks server connectivity and provides warnings if the server is not accessible.

## cve-search Server Setup

To use this client, you need a running cve-search server. Here's a quick setup guide:

1. **Clone and setup cve-search:**
   ```bash
   git clone https://github.com/cve-search/cve-search.git
   cd cve-search
   pip install -r requirements.txt
   ```

2. **Configure database:**
   ```bash
   # Edit config.ini with your MongoDB settings
   cp config.ini.sample config.ini
   ```

3. **Populate database:**
   ```bash
   python3 sbin/db_mgmt.py -p
   python3 sbin/db_mgmt_cpe_dictionary.py
   ```

4. **Start the API server:**
   ```bash
   python3 bin/web.py
   ```

The server will be available at `http://localhost:5000` by default.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this script.

## License

This script is provided as-is for educational and security research purposes.

## Security Note

This tool is designed for security research and vulnerability assessment. Always ensure you have proper authorization before testing systems you don't own. 