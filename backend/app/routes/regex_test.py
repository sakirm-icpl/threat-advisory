from flask import Blueprint, request, jsonify
import re
from flasgger import swag_from

bp = Blueprint('regex_test', __name__, url_prefix='/regex-test')

@bp.route('', methods=['POST'])
@swag_from({
    'tags': ['Regex Testing'],
    'summary': 'Test regular expressions against sample text',
    'description': 'Test regex patterns and validate their behavior',
    'parameters': [{
        'name': 'test_data',
        'in': 'body',
        'required': True,
        'schema': {
            'type': 'object',
            'properties': {
                'pattern': {'type': 'string', 'example': r'(\d+\.\d+\.\d+)'},
                'text': {'type': 'string', 'example': 'Apache/2.4.41'},
                'flags': {'type': 'array', 'items': {'type': 'string'}, 'example': ['IGNORECASE']}
            },
            'required': ['pattern', 'text']
        }
    }],
    'responses': {
        '200': {
            'description': 'Regex test results',
            'schema': {
                'type': 'object',
                'properties': {
                    'matches': {'type': 'array'},
                    'match_count': {'type': 'integer'},
                    'valid_pattern': {'type': 'boolean'},
                    'error': {'type': 'string'}
                }
            }
        },
        '400': {'description': 'Invalid request data'}
    }
})
def test_regex():
    """Test regular expression patterns"""
    try:
        data = request.json
        if not data or 'pattern' not in data or 'text' not in data:
            return jsonify({'error': 'Pattern and text are required'}), 400
        
        pattern = data['pattern']
        text = data['text']
        flags = data.get('flags', [])
        
        # Convert string flags to regex flags
        regex_flags = 0
        flag_map = {
            'IGNORECASE': re.IGNORECASE,
            'MULTILINE': re.MULTILINE,
            'DOTALL': re.DOTALL,
            'VERBOSE': re.VERBOSE
        }
        
        for flag in flags:
            if flag.upper() in flag_map:
                regex_flags |= flag_map[flag.upper()]
        
        try:
            # Test if pattern is valid
            compiled_pattern = re.compile(pattern, regex_flags)
            
            # Find all matches
            matches = compiled_pattern.findall(text)
            
            # Get match objects for more detailed info
            match_objects = []
            for match in compiled_pattern.finditer(text):
                match_objects.append({
                    'match': match.group(),
                    'start': match.start(),
                    'end': match.end(),
                    'groups': match.groups()
                })
            
            return jsonify({
                'valid_pattern': True,
                'matches': matches,
                'match_details': match_objects,
                'match_count': len(matches),
                'error': None
            }), 200
            
        except re.error as e:
            return jsonify({
                'valid_pattern': False,
                'matches': [],
                'match_count': 0,
                'error': f'Invalid regex pattern: {str(e)}'
            }), 200
            
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500