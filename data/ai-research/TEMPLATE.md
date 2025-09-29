# AI Research Data Template

This template shows how to structure AI research data for contribution to the VersionIntel data repository.

## Research Data Template

```json
{
  "research_datasets": [
    {
      "id": "unique-dataset-id",
      "title": "Research Dataset Title",
      "authors": ["Author 1", "Author 2"],
      "description": "Brief description of the research dataset",
      "methodology": "Description of the research methodology used",
      "findings": "Key findings from the research",
      "data_samples": [
        {
          "input": "Sample input data",
          "expected_output": "Expected result",
          "notes": "Additional notes about this sample"
        }
      ],
      "references": [
        "https://research-paper-link.com",
        "https://dataset-source.com"
      ],
      "metadata": {
        "created_at": "YYYY-MM-DDTHH:MM:SSZ",
        "updated_at": "YYYY-MM-DDTHH:MM:SSZ",
        "license": "MIT|Apache-2.0|CC-BY-4.0"
      }
    }
  ]
}
```

### Research Data Fields

| Field | Description | Required |
|-------|-------------|----------|
| `id` | Unique identifier (lowercase, hyphen-separated) | Yes |
| `title` | Descriptive title of the research dataset | Yes |
| `authors` | Array of author names | Yes |
| `description` | Brief description of the research | Yes |
| `methodology` | Description of research methodology | Yes |
| `findings` | Key research findings | Yes |
| `data_samples` | Array of research data samples | Yes |
| `references` | Array of reference URLs | Yes |
| `metadata` | Additional information | Yes |

### Data Sample Object

```json
{
  "input": "Sample input data",
  "expected_output": "Expected result",
  "notes": "Additional notes about this sample"
}
```

## Examples

### Version Detection Research Data

File: `data/ai-research/version-detection-dataset-001.json`

```json
{
  "research_datasets": [
    {
      "id": "version-detection-obfuscated-001",
      "title": "Version Detection in Obfuscated Service Responses",
      "authors": ["AI Research Team"],
      "description": "Dataset of obfuscated service responses and their corresponding version information for training AI models",
      "methodology": "Collected real-world service responses from various network services and manually extracted version information",
      "findings": "Identified common patterns in obfuscated responses that can be used to improve version detection accuracy through machine learning",
      "data_samples": [
        {
          "input": "SSH-2.0-OpenSSH_8.2 FreeBSD-20200501",
          "expected_output": "OpenSSH 8.2",
          "notes": "Standard SSH banner with version information"
        },
        {
          "input": "220 mail.example.com ESMTP Exim 4.94.2 #2 Fri, 01 Jan 2021 00:00:00 +0000",
          "expected_output": "Exim 4.94.2",
          "notes": "Complex SMTP banner with version information embedded"
        },
        {
          "input": "Server: Apache-Coyote/1.1",
          "expected_output": "Apache Tomcat 7.0.52",
          "notes": "Obfuscated version information in HTTP server header"
        }
      ],
      "references": [
        "https://research-paper-link.com/version-detection-ai",
        "https://dataset-source.com/network-service-banners"
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

### Pattern Matching Research Data

File: `data/ai-research/pattern-matching-dataset-001.json`

```json
{
  "research_datasets": [
    {
      "id": "pattern-matching-complex-001",
      "title": "Complex Pattern Matching for Service Identification",
      "authors": ["Machine Learning Team", "Security Research Team"],
      "description": "Dataset of complex service responses and their identification patterns for training pattern matching algorithms",
      "methodology": "Collected service responses with complex patterns and developed regex patterns for identification",
      "findings": "Developed advanced pattern matching techniques that improve service identification accuracy by 15%",
      "data_samples": [
        {
          "input": "HTTP/1.1 200 OK\r\nServer: nginx/1.18.0\r\nDate: Mon, 01 Jan 2021 00:00:00 GMT\r\nContent-Type: text/html\r\nContent-Length: 1234\r\nLast-Modified: Sun, 31 Dec 2020 23:59:59 GMT\r\nConnection: keep-alive\r\nETag: \"1234567890\"\r\nAccept-Ranges: bytes\r\n\r\n",
          "expected_output": "nginx 1.18.0",
          "notes": "HTTP response with version in Server header"
        }
      ],
      "references": [
        "https://ml-research.com/pattern-matching",
        "https://security-research.org/advanced-patterns"
      ],
      "metadata": {
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "license": "Apache-2.0"
      }
    }
  ]
}
```

## Contribution Guidelines

1. **File Naming**: Use descriptive names like `research-topic-dataset-NNN.json`
2. **Unique IDs**: Ensure all dataset IDs are unique across the repository
3. **Valid References**: Ensure all reference URLs are valid and accessible
4. **Clear Methodology**: Provide detailed methodology descriptions
5. **Representative Samples**: Include diverse and representative data samples
6. **Proper Licensing**: Specify appropriate license for the research data
7. **Metadata**: Always include proper metadata with timestamps

## Validation

Before submitting your contribution, validate your JSON:

```bash
# Using Python
python -m json.tool your-file.json

# Using Node.js
node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('your-file.json')), null, 2))"
```