#!/usr/bin/env python3
"""
Test runner for VersionIntel RBAC system.
"""
import os
import sys
import subprocess

def run_tests():
    """Run all tests for the RBAC system."""
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    # Run tests with coverage
    cmd = [
        sys.executable, '-m', 'pytest',
        'tests/',
        '-v',
        '--cov=app',
        '--cov-report=term-missing',
        '--cov-report=html:htmlcov'
    ]
    
    try:
        result = subprocess.run(cmd, check=True)
        print("\n✅ All tests passed!")
        return True
    except subprocess.CalledProcessError:
        print("\n❌ Some tests failed!")
        return False

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)