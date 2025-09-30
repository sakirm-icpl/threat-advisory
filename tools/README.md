# Tools

This directory contains tools for validating and testing version detection patterns.

## Validation Tools

### Pattern Validation
The [validate-pattern.py](validate-pattern.py) script validates pattern files against the expected JSON schema and tests the regex patterns with provided test cases.

#### Usage
```bash
python validate-pattern.py patterns/web/apache.json
python validate-pattern.py patterns/networking/openssh.json patterns/database/mysql.json
```

#### Features
- JSON schema validation
- Regex compilation testing
- Test case execution
- Version extraction validation

## Testing Tools

### Pattern Testing
(Coming Soon) Tools for testing patterns against real service responses.

## Development Tools

### Pattern Generator
(Coming Soon) Tools for generating pattern templates and scaffolding.

## Requirements

To use these tools, you need:
- Python 3.6+
- jsonschema package

Install requirements:
```bash
pip install jsonschema
```

## Contributing

If you'd like to contribute new tools or improve existing ones, please:
1. Follow the existing code style
2. Include comprehensive documentation
3. Add test cases for new functionality
4. Submit a pull request

## License

These tools are provided under the MIT License. See [LICENSE](../LICENSE) file in the root directory for more information.