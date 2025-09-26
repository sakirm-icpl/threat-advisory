# VersionIntel RBAC Unit Tests Documentation

## 🧪 Overview

This document describes the comprehensive unit test suite for VersionIntel's Role-Based Access Control (RBAC) system. The tests cover all aspects of the authentication and authorization system, including GitHub OAuth integration, role-based access control, and ownership-based resource access.

## 📁 Test Structure

```
backend/
├── tests/
│   ├── __init__.py              # Test package initialization
│   ├── conftest.py              # Test configuration and fixtures
│   ├── test_rbac_middleware.py  # RBAC middleware and decorators
│   ├── test_ownership_access.py # Ownership-based access control
│   ├── test_auth_endpoints.py   # Authentication endpoints
│   └── test_admin_endpoints.py  # Admin-only endpoints
├── requirements-test.txt        # Test dependencies
└── run_tests.py                 # Test runner script
```

## 🧰 Test Dependencies

Install test dependencies:
```bash
pip install -r backend/requirements-test.txt
```

## ▶️ Running Tests

### Run All Tests
```bash
cd backend
python run_tests.py
```

### Run Tests with Coverage
```bash
cd backend
pytest tests/ -v --cov=app --cov-report=term-missing
```

### Run Specific Test Files
```bash
# Test RBAC middleware
pytest tests/test_rbac_middleware.py -v

# Test ownership access
pytest tests/test_ownership_access.py -v

# Test authentication endpoints
pytest tests/test_auth_endpoints.py -v

# Test admin endpoints
pytest tests/test_admin_endpoints.py -v
```

## 🧪 Test Coverage

### 1. RBAC Middleware Tests (`test_rbac_middleware.py`)

#### `@require_admin` Decorator
- ✅ Admin users can access admin-only endpoints
- ✅ Contributor users are denied access to admin endpoints
- ✅ Unauthenticated requests are denied access
- ✅ Proper HTTP status codes (401, 403) returned

#### `@require_contributor_or_admin` Decorator
- ✅ Admin users can access contributor endpoints
- ✅ Contributor users can access contributor endpoints
- ✅ Invalid users are denied access
- ✅ Proper error messages returned

### 2. Ownership Access Tests (`test_ownership_access.py`)

#### Resource Ownership Checking
- ✅ User can access their own resources
- ✅ Admin can access any user's resources
- ✅ Contributor cannot access other user's resources
- ✅ User profile ownership verification
- ✅ Vendor, product, and other entity ownership verification

#### `@require_ownership_or_admin` Decorator
- ✅ Owner can access their own resources
- ✅ Admin can access any resources
- ✅ Non-owner contributors are denied access
- ✅ Proper HTTP status codes (403) returned

### 3. Authentication Endpoint Tests (`test_auth_endpoints.py`)

#### GitHub OAuth Endpoints
- ✅ GitHub login endpoint returns authorization URL
- ✅ GitHub callback endpoint processes OAuth flow
- ✅ Proper JWT tokens are issued

#### Legacy Authentication
- ✅ Valid credentials return access tokens
- ✅ Invalid credentials return proper error messages
- ✅ Refresh token endpoint works correctly
- ✅ Profile retrieval endpoint returns user data
- ✅ Profile update endpoint modifies user data

#### Token Management
- ✅ Access token refresh functionality
- ✅ Token expiration handling
- ✅ Invalid token rejection

### 4. Admin Endpoint Tests (`test_admin_endpoints.py`)

#### User Management
- ✅ Admin can list all users
- ✅ Contributor access to user list is denied
- ✅ User promotion from contributor to admin
- ✅ User demotion from admin to contributor
- ✅ Prevention of promoting already-admin users
- ✅ Prevention of demoting last admin user

#### System Administration
- ✅ Audit log retrieval by admin users
- ✅ System statistics retrieval by admin users
- ✅ Proper pagination of audit logs
- ✅ Filtering of audit logs by action/resource type

## 🔐 Security Testing

### Role-Based Access Control
- **Admin Role Verification**: Ensures admins have unrestricted access
- **Contributor Role Limitations**: Verifies contributors can only access their own records
- **Unauthorized Access Prevention**: Tests that role violations are properly rejected

### Ownership-Based Access
- **Resource Ownership**: Validates that users can only access resources they created
- **Admin Override**: Confirms admins can access all resources regardless of ownership
- **Cross-User Access Prevention**: Ensures users cannot access other users' data

### Authentication Security
- **Token Validation**: Tests proper JWT token validation and expiration
- **Password Security**: Verifies password hashing and verification
- **Session Management**: Tests refresh token functionality

## 📊 Test Fixtures

The test suite uses the following fixtures defined in `conftest.py`:

### Users
- `admin_user`: Pre-created admin user for testing
- `contributor_user`: Pre-created contributor user for testing

### Resources
- `sample_vendor`: Sample vendor entity for testing
- `sample_product`: Sample product entity for testing

### Authentication
- `auth_headers`: Authentication headers for admin user
- `contributor_auth_headers`: Authentication headers for contributor user

## 🛡️ Error Handling Tests

All tests verify proper error handling:

| Error Type | HTTP Status | Test Coverage |
|------------|-------------|---------------|
| Unauthorized Access | 401 | ✅ |
| Forbidden Access | 403 | ✅ |
| Resource Not Found | 404 | ✅ |
| Invalid Input | 400 | ✅ |
| Server Errors | 500 | ✅ |

## 🎯 Test Quality Assurance

### Code Coverage Goals
- **100%** coverage for RBAC middleware
- **100%** coverage for authentication services
- **95%+** coverage for authentication endpoints
- **90%+** coverage for admin endpoints

### Test Characteristics
- **Isolation**: Each test runs in isolation with fresh database
- **Reproducibility**: Tests produce consistent results
- **Speed**: Tests execute quickly with minimal setup
- **Clarity**: Test names clearly describe what is being tested

## 🧪 Integration with CI/CD

The test suite is designed to integrate with continuous integration systems:

```yaml
# Example GitHub Actions workflow
name: RBAC Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      - name: Run tests
        run: |
          cd backend
          python run_tests.py
```

## 📈 Performance Testing

The test suite includes performance considerations:

- **Database Isolation**: Each test uses an in-memory SQLite database
- **Mock External Services**: GitHub OAuth calls are mocked
- **Fast Execution**: Tests complete in under 30 seconds
- **Parallel Execution**: Tests can run in parallel

## 🛠️ Maintenance

### Adding New Tests
1. Create a new test file in the `tests/` directory
2. Follow the existing naming convention (`test_*.py`)
3. Use appropriate fixtures from `conftest.py`
4. Add descriptive test method names
5. Include proper assertions and error checking

### Updating Existing Tests
1. Review test coverage reports
2. Add tests for new functionality
3. Update tests when RBAC rules change
4. Maintain backward compatibility when possible

## 📋 Test Results Reporting

The test suite generates comprehensive reports:

### Terminal Output
```
tests/test_rbac_middleware.py::TestRBACMiddleware::test_require_admin_with_admin_user PASSED
tests/test_rbac_middleware.py::TestRBACMiddleware::test_require_admin_with_contributor_user PASSED
...
```

### HTML Coverage Report
Generated in `backend/htmlcov/` directory with:
- Line-by-line coverage visualization
- Missing coverage highlighting
- Branch coverage statistics

### CI/CD Integration Reports
- JUnit XML format for CI systems
- JSON reports for automated analysis
- Custom reporting for monitoring systems

## 🚀 Best Practices

### Test Design
- **One assertion per test** when possible
- **Descriptive test names** that explain the scenario
- **Proper test isolation** with fresh database per test
- **Mock external dependencies** to ensure consistency

### Security Testing
- **Role escalation prevention** testing
- **Privilege escalation detection** testing
- **Data leakage prevention** testing
- **Audit trail verification** testing

### Performance Testing
- **Response time validation** for critical endpoints
- **Concurrent access testing** for shared resources
- **Resource cleanup verification** after tests
- **Memory leak detection** in long-running tests

This comprehensive test suite ensures the VersionIntel RBAC system is robust, secure, and reliable.