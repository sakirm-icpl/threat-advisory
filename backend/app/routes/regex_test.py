from flask import Blueprint, request, jsonify
import re

bp = Blueprint('regex_test', __name__, url_prefix='/regex-test')

@bp.route('', methods=['GET', 'POST'])
def test_regex():
    try:
        if request.method == 'GET':
            regex = request.args.get('regex')
            sample = request.args.get('sample')
            regex_type = request.args.get('type', 'python')  # python or ruby
        else:
            data = request.json
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            regex = data.get('regex')
            sample = data.get('sample')
            regex_type = data.get('type', 'python')
        
        if not regex or not sample:
            return jsonify({'error': 'regex and sample are required'}), 400
        
        if regex_type not in ['python', 'ruby']:
            return jsonify({'error': 'type must be either "python" or "ruby"'}), 400
        
        try:
            # For Ruby regex, we need to handle some differences
            if regex_type == 'ruby':
                # Convert Ruby regex to Python regex (basic conversion)
                # Ruby uses \A and \z for start/end of string, Python uses ^ and $
                regex = regex.replace(r'\A', '^').replace(r'\z', '$')
                # Ruby uses (?i) for case insensitive, Python uses re.IGNORECASE
                case_insensitive = '(?i)' in regex
                regex = regex.replace('(?i)', '')
                flags = re.IGNORECASE if case_insensitive else 0
            else:
                flags = 0
            
            match = re.search(regex, sample, flags)
            
            if match:
                return jsonify({
                    'match': match.group(0),
                    'groups': match.groups(),
                    'start': match.start(),
                    'end': match.end(),
                    'regex_type': regex_type
                })
            else:
                return jsonify({
                    'match': None,
                    'groups': (),
                    'start': None,
                    'end': None,
                    'regex_type': regex_type
                })
                
        except re.error as e:
            return jsonify({'error': f'Invalid regex pattern: {str(e)}'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
