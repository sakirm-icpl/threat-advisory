import os
from app import create_app

# Set PYTHONPATH to ensure imports work
import sys
sys.path.insert(0, '/app')

app = create_app()

if __name__ == "__main__":
    # Only run development server if called directly
    port = int(os.environ.get('PORT', 5000))
    app.run(host="0.0.0.0", port=port, debug=False) 