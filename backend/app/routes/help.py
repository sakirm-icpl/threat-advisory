from flask import Blueprint, jsonify, current_app

help_bp = Blueprint('help', __name__, url_prefix='/help')

@help_bp.route('/', methods=['GET'])
def help_index():
    """Main help page content"""
    try:
        help_content = {
            'title': 'VersionIntel Help Center',
            'sections': [
                {
                    'title': 'Getting Started',
                    'description': 'Learn the basics of using VersionIntel',
                    'links': [
                        {'title': 'User Guide', 'url': '/help/guide'},
                        {'title': 'FAQ', 'url': '/help/faq'},
                        {'title': 'Video Tutorials', 'url': '/help/videos'}
                    ]
                },
                {
                    'title': 'Contributing',
                    'description': 'How to contribute to the VersionIntel community',
                    'links': [
                        {'title': 'Best Practices', 'url': '/help/best-practices'},
                        {'title': 'Pattern Submission Guide', 'url': '/submit/pattern'},
                        {'title': 'Community Guidelines', 'url': '/guidelines'}
                    ]
                },
                {
                    'title': 'API Documentation',
                    'description': 'Technical documentation for developers',
                    'links': [
                        {'title': 'API Overview', 'url': '/api'},
                        {'title': 'Search API', 'url': '/api#search'},
                        {'title': 'Pattern API', 'url': '/api#patterns'}
                    ]
                }
            ]
        }
        
        return jsonify(help_content)
        
    except Exception as e:
        current_app.logger.error(f"Error loading help content: {e}")
        return jsonify({'error': 'Failed to load help content'}), 500

@help_bp.route('/guide', methods=['GET'])
def help_guide():
    """User guide content"""
    try:
        guide_content = {
            'title': 'VersionIntel User Guide',
            'sections': [
                {
                    'title': '1. Account Setup',
                    'content': '''
## Getting Started with VersionIntel

### Creating Your Account
1. Click "Sign in with GitHub" on the login page
2. Authorize VersionIntel to access your GitHub account
3. Your profile will be automatically created

### Profile Setup
- Visit your profile page to add additional information
- Set your visibility preferences
- Configure notification settings
                    '''
                },
                {
                    'title': '2. Searching for Version Information',
                    'content': '''
## Using the Search Feature

### Basic Search
- Use the search bar to find detection patterns
- Search by product name, vendor, or technique
- Filter results by category or date

### Advanced Search
- Use CVE search for vulnerability information
- Apply multiple filters simultaneously
- Export search results for analysis
                    '''
                },
                {
                    'title': '3. Contributing Patterns',
                    'content': '''
## Submitting Detection Patterns

### Pattern Requirements
- Provide a clear pattern name and description
- Include working regex patterns
- Add sample text that demonstrates the pattern
- Test your pattern before submission

### Review Process
- All submissions are reviewed by community maintainers
- You'll receive notifications about review status
- Approved patterns become part of the public database
                    '''
                },
                {
                    'title': '4. Community Features',
                    'content': '''
## Engaging with the Community

### Contributing
- Submit detection patterns, documentation, or bug reports
- Vote on community contributions
- Participate in discussions

### Recognition
- Earn reputation points for quality contributions
- Unlock contributor badges and levels
- Join the contributor leaderboard
                    '''
                }
            ]
        }
        
        return jsonify(guide_content)
        
    except Exception as e:
        current_app.logger.error(f"Error loading guide content: {e}")
        return jsonify({'error': 'Failed to load guide content'}), 500

@help_bp.route('/faq', methods=['GET'])
def help_faq():
    """FAQ content"""
    try:
        faq_content = {
            'title': 'Frequently Asked Questions',
            'categories': [
                {
                    'title': 'General',
                    'questions': [
                        {
                            'question': 'What is VersionIntel?',
                            'answer': 'VersionIntel is a community-driven platform for version detection patterns and techniques. It helps security researchers and developers identify software versions in various systems.'
                        },
                        {
                            'question': 'How do I get started?',
                            'answer': 'Simply sign in with your GitHub account and start exploring the database of detection patterns. You can search, contribute, and learn from the community.'
                        },
                        {
                            'question': 'Is VersionIntel free to use?',
                            'answer': 'Yes, VersionIntel is completely free and open-source. All detection patterns and tools are available to the community at no cost.'
                        }
                    ]
                },
                {
                    'title': 'Contributing',
                    'questions': [
                        {
                            'question': 'How do I submit a detection pattern?',
                            'answer': 'Go to the pattern submission form, fill in the required details including regex pattern and sample text, then submit for community review.'
                        },
                        {
                            'question': 'What makes a good detection pattern?',
                            'answer': 'Good patterns are accurate, well-documented, tested against real examples, and include clear descriptions of what they detect.'
                        },
                        {
                            'question': 'How long does review take?',
                            'answer': 'Most submissions are reviewed within 3-7 days by community maintainers. Complex patterns may take longer for thorough testing.'
                        }
                    ]
                },
                {
                    'title': 'Technical',
                    'questions': [
                        {
                            'question': 'What regex flavor is supported?',
                            'answer': 'VersionIntel supports Python regex (re module) syntax. Patterns are tested using this engine.'
                        },
                        {
                            'question': 'Can I use the API programmatically?',
                            'answer': 'Yes, VersionIntel provides a REST API for programmatic access. Check the API documentation for details.'
                        },
                        {
                            'question': 'How do I report bugs or issues?',
                            'answer': 'Use the bug report form to submit issues. Provide detailed steps to reproduce and expected vs actual behavior.'
                        }
                    ]
                }
            ]
        }
        
        return jsonify(faq_content)
        
    except Exception as e:
        current_app.logger.error(f"Error loading FAQ content: {e}")
        return jsonify({'error': 'Failed to load FAQ content'}), 500

@help_bp.route('/videos', methods=['GET'])
def help_videos():
    """Video tutorials content"""
    try:
        videos_content = {
            'title': 'Video Tutorials',
            'description': 'Learn VersionIntel through step-by-step video guides',
            'videos': [
                {
                    'title': 'Getting Started with VersionIntel',
                    'description': 'A complete walkthrough of account setup and basic usage',
                    'duration': '8:30',
                    'url': '/help/videos/getting-started',
                    'thumbnail': '/images/tutorials/getting-started-thumb.jpg'
                },
                {
                    'title': 'Creating Your First Detection Pattern',
                    'description': 'Step-by-step guide to submitting a detection pattern',
                    'duration': '12:15',
                    'url': '/help/videos/first-pattern',
                    'thumbnail': '/images/tutorials/first-pattern-thumb.jpg'
                },
                {
                    'title': 'Advanced Search Techniques',
                    'description': 'Master the search features and filtering options',
                    'duration': '6:45',
                    'url': '/help/videos/advanced-search',
                    'thumbnail': '/images/tutorials/advanced-search-thumb.jpg'
                },
                {
                    'title': 'Community Features Overview',
                    'description': 'Explore community features and engagement tools',
                    'duration': '9:20',
                    'url': '/help/videos/community-features',
                    'thumbnail': '/images/tutorials/community-features-thumb.jpg'
                }
            ],
            'playlists': [
                {
                    'title': 'Beginner Series',
                    'description': 'Perfect for new users getting started',
                    'video_count': 4,
                    'total_duration': '35:50'
                },
                {
                    'title': 'Advanced Techniques',
                    'description': 'For experienced users and contributors',
                    'video_count': 6,
                    'total_duration': '52:30'
                }
            ]
        }
        
        return jsonify(videos_content)
        
    except Exception as e:
        current_app.logger.error(f"Error loading videos content: {e}")
        return jsonify({'error': 'Failed to load videos content'}), 500

@help_bp.route('/best-practices', methods=['GET'])
def help_best_practices():
    """Best practices guide"""
    try:
        best_practices_content = {
            'title': 'VersionIntel Best Practices',
            'sections': [
                {
                    'title': 'Pattern Creation Guidelines',
                    'practices': [
                        {
                            'title': 'Be Specific and Accurate',
                            'description': 'Create patterns that precisely match the target software version without false positives.',
                            'example': 'Use `Server: Apache/([0-9.]+)` instead of `Apache.*([0-9]+)`'
                        },
                        {
                            'title': 'Test Thoroughly',
                            'description': 'Test your patterns against multiple real-world examples before submission.',
                            'example': 'Include various version formats: 2.4.41, 2.4.41-Ubuntu, 2.4.41-1.el7'
                        },
                        {
                            'title': 'Document Edge Cases',
                            'description': 'Note any special conditions or limitations of your pattern.',
                            'example': 'Pattern works for versions 2.0+ but may fail for legacy 1.x releases'
                        }
                    ]
                },
                {
                    'title': 'Submission Quality',
                    'practices': [
                        {
                            'title': 'Clear Descriptions',
                            'description': 'Write clear, detailed descriptions of what your pattern detects.',
                            'example': 'Instead of "Apache pattern", use "Apache HTTP Server version from Server header"'
                        },
                        {
                            'title': 'Provide Context',
                            'description': 'Explain where and how the pattern should be used.',
                            'example': 'Specify if pattern works on HTTP headers, banners, or configuration files'
                        },
                        {
                            'title': 'Include Sample Data',
                            'description': 'Always include realistic sample text that demonstrates the pattern.',
                            'example': 'Server: Apache/2.4.41 (Ubuntu)\\nX-Powered-By: PHP/7.4.3'
                        }
                    ]
                },
                {
                    'title': 'Community Engagement',
                    'practices': [
                        {
                            'title': 'Constructive Feedback',
                            'description': 'Provide helpful, constructive feedback on other contributions.',
                            'example': 'Suggest improvements rather than just pointing out problems'
                        },
                        {
                            'title': 'Stay Updated',
                            'description': 'Keep your contributions updated as software versions change.',
                            'example': 'Update patterns when new version formats are introduced'
                        },
                        {
                            'title': 'Share Knowledge',
                            'description': 'Contribute documentation and help others learn.',
                            'example': 'Write guides for detecting specific software categories'
                        }
                    ]
                }
            ]
        }
        
        return jsonify(best_practices_content)
        
    except Exception as e:
        current_app.logger.error(f"Error loading best practices content: {e}")
        return jsonify({'error': 'Failed to load best practices content'}), 500