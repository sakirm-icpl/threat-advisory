# VersionIntel RBAC Integration Testing Documentation

## 🧪 Overview

This document describes the comprehensive integration testing suite for VersionIntel's Role-Based Access Control (RBAC) system. These tests verify that all components work together correctly, including GitHub OAuth integration, role-based access control, ownership enforcement, and audit logging.

## 🎯 Testing Objectives

1. **Complete GitHub OAuth Flow**: Verify the full authentication process
2. **RBAC Enforcement**: Ensure role-based access control works end-to-end
3. **Ownership-Based Access**: Validate created_by field enforcement
4. **Admin Functionality**: Test user management and system administration
5. **Audit Trail**: Verify all actions are properly logged
6. **Security Compliance**: Ensure no privilege escalation is possible

## ▶️ Running Integration Tests

### Prerequisites
```bash
cd backend
pip install -r requirements.txt
pip install -r requirements-test.txt
```

### Run All Integration Tests
```bash
cd backend
pytest tests/test_integration.py -v
```

### Run with Detailed Output
```bash
cd backend
pytest tests/test_integration.py -v --capture=no
```

## 🧪 Integration Test Scenarios

### 1. Complete GitHub OAuth Flow Test

#### Test: `test_complete_github_oauth_flow`
**Objective**: Verify the GitHub OAuth endpoints are accessible and functional

**Steps**:
1. Call `/auth/github/login` endpoint
2. Verify response contains authorization URL or redirect
3. (Manual) Complete OAuth flow with real GitHub account

**Expected Results**:
- ✅ GitHub login endpoint returns 200 or 302 status
- ✅ Authorization URL is properly formatted
- ✅ Callback endpoint processes OAuth response

### 2. Admin User Lifecycle Test

#### Test: `test_admin_user_lifecycle`
**Objective**: Test the complete lifecycle of admin user management

**Steps**:
1. Create initial admin user
2. Login as admin
3. Create contributor user via admin endpoint
4. List users to verify both exist
5. Promote contributor to admin
6. Verify promotion in user list
7. Create another admin to avoid last admin error
8. Demote promoted user back to contributor

**Expected Results**:
- ✅ Admin can create users with specific roles
- ✅ User listing shows all users
- ✅ User promotion works correctly
- ✅ User demotion works correctly
- ✅ Last admin protection prevents accidental lockout

### 3. RBAC Enforcement with Ownership Test

#### Test: `test_rbac_enforcement_with_created_by_field`
**Objective**: Verify RBAC rules with ownership-based access control

**Steps**:
1. Create admin and contributor users
2. Login as admin and create vendor
3. Login as contributor and attempt to modify admin's vendor
4. Contributor creates their own vendor
5. Contributor updates their own vendor
6. Admin updates contributor's vendor

**Expected Results**:
- ✅ Contributor cannot modify admin's vendor (403 Forbidden)
- ✅ Contributor can modify their own vendor (200 OK)
- ✅ Admin can modify any vendor (200 OK)
- ✅ Proper error messages for unauthorized access

### 4. Audit Logging Integration Test

#### Test: `test_audit_logging_integration`
**Objective**: Verify audit logging captures all relevant actions

**Steps**:
1. Create admin user
2. Login as admin
3. Perform actions (create vendor, update product, etc.)
4. Check audit logs for recorded actions

**Expected Results**:
- ✅ All admin actions are logged
- ✅ Audit log contains user ID, action type, resource type
- ✅ Audit log includes timestamp and request metadata
- ✅ Audit log endpoint is accessible to admins

### 5. Role Change Audit Trail Test

#### Test: `test_role_change_audit_trail`
**Objective**: Verify role changes are properly tracked

**Steps**:
1. Create admin and contributor users
2. Login as admin
3. Promote contributor to admin
4. Check audit logs for role change

**Expected Results**:
- ✅ Role promotion is logged in audit trail
- ✅ Log entry contains old and new role information
- ✅ Log entry includes admin user who performed the action
- ✅ Log entry includes timestamp and reason

## 🔧 Manual Integration Testing Procedures

### GitHub OAuth Manual Testing

1. **Setup GitHub OAuth Application**:
   - Create OAuth app in GitHub Developer Settings
   - Set callback URL to `http://localhost:8000/auth/github/callback`
   - Update environment variables with client ID and secret

2. **Test OAuth Flow**:
   ```bash
   # Start the application
   cd backend
   python main.py
   
   # Visit in browser
   http://localhost:8000/auth/github/login
   
   # Complete GitHub authentication
   # Verify JWT token is returned
   ```

3. **Verify User Creation**:
   - Check database for new user record
   - Verify GitHub ID, username, and email are stored
   - Confirm default role is set to contributor

### Role-Based Access Manual Testing

1. **Admin Access Testing**:
   ```bash
   # Login as admin
   curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "password"}'
   
   # Access admin endpoints
   curl http://localhost:8000/auth/users \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

2. **Contributor Access Testing**:
   ```bash
   # Login as contributor
   curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "contributor", "password": "password"}'
   
   # Attempt admin access (should fail)
   curl http://localhost:8000/auth/users \
     -H "Authorization: Bearer YOUR_CONTRIBUTOR_TOKEN"
   ```

3. **Ownership Testing**:
   ```bash
   # Contributor creates resource
   curl -X POST http://localhost:8000/vendors \
     -H "Authorization: Bearer YOUR_CONTRIBUTOR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Vendor", "description": "My vendor"}'
   
   # Contributor accesses their resource (should succeed)
   curl http://localhost:8000/vendors/1 \
     -H "Authorization: Bearer YOUR_CONTRIBUTOR_TOKEN"
   
   # Another contributor accesses resource (should fail)
   curl http://localhost:8000/vendors/1 \
     -H "Authorization: Bearer ANOTHER_CONTRIBUTOR_TOKEN"
   ```

## 🛡️ Security Integration Testing

### Privilege Escalation Prevention

1. **Test Self-Demotion Prevention**:
   - Admin attempts to demote themselves
   - Verify operation is blocked with appropriate error

2. **Test Last Admin Protection**:
   - Attempt to demote the only admin
   - Verify operation is blocked with appropriate error

3. **Test Unauthorized Role Changes**:
   - Contributor attempts to promote themselves
   - Verify operation is blocked with 403 Forbidden

### Data Access Control

1. **Cross-User Data Access**:
   - Contributor attempts to access another user's data
   - Verify access is denied with appropriate error

2. **Admin Override Verification**:
   - Admin accesses any user's data
   - Verify access is granted

3. **Resource Ownership Enforcement**:
   - Contributor attempts to modify another user's resource
   - Verify modification is denied

## 📊 Performance Integration Testing

### Concurrent Access Testing

1. **Multiple User Sessions**:
   - Simultaneously login multiple users
   - Perform concurrent operations
   - Verify no session conflicts

2. **Rate Limiting Verification**:
   - Make rapid requests to authentication endpoints
   - Verify rate limiting is enforced
   - Check appropriate HTTP status codes (429)

### Resource Access Performance

1. **Large Dataset Access**:
   - Create large number of entities
   - Test pagination and filtering
   - Verify response times are acceptable

2. **Complex Query Performance**:
   - Test complex filtering and sorting
   - Verify database queries are optimized
   - Check for proper indexing usage

## 🎯 Compliance Testing

### Audit Trail Completeness

1. **Action Coverage**:
   - Verify all CRUD operations are logged
   - Check role changes are logged
   - Confirm authentication events are logged

2. **Log Content Verification**:
   - Check user ID is recorded
   - Verify action type and resource type
   - Confirm timestamps are accurate
   - Validate request metadata (IP, user agent)

### Role-Based Access Compliance

1. **Permission Matrix Verification**:
   - Test all combinations of roles and actions
   - Verify admin has full access
   - Confirm contributor restrictions
   - Check proper error responses

## 🛠️ Troubleshooting Integration Issues

### Common Issues and Solutions

#### 1. Authentication Failures
**Symptoms**: 401 Unauthorized responses
**Solutions**:
- Verify JWT secret key configuration
- Check token expiration settings
- Confirm user credentials are correct

#### 2. Authorization Failures
**Symptoms**: 403 Forbidden responses
**Solutions**:
- Verify user roles in database
- Check RBAC middleware configuration
- Confirm resource ownership

#### 3. Database Connection Issues
**Symptoms**: 500 Internal Server Error
**Solutions**:
- Verify database connection settings
- Check database service is running
- Confirm database permissions

#### 4. GitHub OAuth Issues
**Symptoms**: OAuth flow fails or returns errors
**Solutions**:
- Verify client ID and secret
- Check callback URL configuration
- Confirm GitHub app settings

## 📈 Monitoring Integration Tests

### Test Execution Monitoring

1. **Test Duration Tracking**:
   - Monitor test execution times
   - Identify performance regressions
   - Optimize slow tests

2. **Test Coverage Reporting**:
   - Generate coverage reports
   - Identify untested code paths
   - Maintain coverage thresholds

3. **Error Analysis**:
   - Collect and analyze test failures
   - Identify common failure patterns
   - Implement preventive measures

## 🔄 Continuous Integration

### CI/CD Pipeline Integration

```yaml
name: Integration Tests
on: [push, pull_request]
jobs:
  integration-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: versionintel_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
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
      - name: Run integration tests
        run: |
          cd backend
          pytest tests/test_integration.py -v
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/versionintel_test
```

## 📋 Test Results Documentation

### Automated Test Results
- **Pass Rate**: Target 100% pass rate
- **Execution Time**: Target under 2 minutes
- **Coverage**: Target 90%+ code coverage

### Manual Test Results
- **OAuth Flow**: ✅ Verified working
- **Role Management**: ✅ Verified working
- **Access Control**: ✅ Verified working
- **Audit Logging**: ✅ Verified working

## 🚀 Production Deployment Validation

### Pre-Deployment Checklist
- [ ] All integration tests pass
- [ ] Manual OAuth flow tested
- [ ] Role-based access verified
- [ ] Audit logging confirmed
- [ ] Performance benchmarks met
- [ ] Security compliance verified

### Post-Deployment Verification
- [ ] Production OAuth flow working
- [ ] Admin panel accessible
- [ ] User management functional
- [ ] Audit logs populating
- [ ] Performance within acceptable ranges

This comprehensive integration testing ensures the VersionIntel RBAC system functions correctly in all scenarios and maintains security and reliability in production environments.