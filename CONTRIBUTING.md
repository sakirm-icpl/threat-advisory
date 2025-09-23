# Contributing to VersionIntel

Welcome to VersionIntel! We're excited to have you contribute to this open source version detection and vulnerability management platform. This guide will help you get started with contributing to the project.

## 🎯 Quick Start for Contributors

### Prerequisites
- **Git**: Latest version for version control
- **Docker**: 20.10+ and Docker Compose 2.0+ for local development
- **Node.js**: 16+ for frontend development
- **Python**: 3.8+ for backend development
- **Code Editor**: VS Code, PyCharm, or your preferred editor

### Setting Up Your Development Environment

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/versionintel.git
   cd versionintel
   
   # Add upstream remote
   git remote add upstream https://github.com/ORIGINAL_OWNER/versionintel.git
   ```

2. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   # Remove or replace API keys with your own for testing
   ```

3. **Start Development Environment**
   ```bash
   # Start all services
   ./build-and-deploy.sh
   
   # Verify services are running
   docker-compose ps
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🤝 How to Contribute

### 🐛 Reporting Bugs

1. **Check Existing Issues**: Search for existing bug reports
2. **Create Detailed Report**: Use the bug report template
3. **Include Information**:
   - Operating System and version
   - Docker version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Log files from `docker-compose logs`

### 💡 Suggesting Features

1. **Check Roadmap**: Review existing feature requests and roadmap
2. **Create Feature Request**: Use the feature request template
3. **Provide Context**:
   - Use case and problem statement
   - Proposed solution
   - Alternative solutions considered
   - Additional context

### 🔧 Code Contributions

#### Types of Contributions We Welcome

1. **🔍 Detection Methods**
   - New service banner patterns
   - Version detection regex improvements
   - Protocol support expansion
   - False positive reduction

2. **🌐 Platform Support**
   - New operating system support
   - Package manager integrations
   - Cloud platform detection
   - Container runtime support

3. **📊 Data Sources**
   - Additional CVE databases
   - Threat intelligence feeds
   - SBOM (Software Bill of Materials) support
   - Custom vulnerability sources

4. **🎨 User Interface**
   - Dashboard improvements
   - Mobile responsiveness
   - Accessibility enhancements
   - New visualization components

5. **⚡ Performance**
   - Database optimization
   - API performance improvements
   - Frontend optimization
   - Memory usage reduction

6. **🔒 Security**
   - Security vulnerability fixes
   - Authentication improvements
   - Authorization enhancements
   - Input validation

#### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-number-description
   ```

2. **Make Your Changes**
   - Follow coding standards (see Style Guide below)
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure all tests pass

3. **Test Your Changes**
   ```bash
   # Backend tests
   cd backend
   python -m pytest tests/ -v
   
   # Frontend tests
   cd frontend
   npm test
   
   # Integration tests
   docker-compose exec backend python -m pytest tests/integration/
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "type: brief description of changes
   
   Detailed explanation of what was changed and why.
   
   Fixes #issue-number"
   ```

5. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

## 📝 Style Guides

### Python (Backend)
- **Formatter**: Black with line length 88
- **Linter**: Flake8 with project configuration
- **Type Hints**: Use type hints for all functions
- **Docstrings**: Google-style docstrings
- **Imports**: Organized with isort

```python
from typing import List, Optional
import requests
from app.models import Vendor

def get_vendor_by_name(name: str) -> Optional[Vendor]:
    """Get vendor by name from database.
    
    Args:
        name: Vendor name to search for
        
    Returns:
        Vendor object if found, None otherwise
        
    Raises:
        DatabaseError: If database connection fails
    """
    return Vendor.query.filter_by(name=name).first()
```

### JavaScript/React (Frontend)
- **Formatter**: Prettier with project configuration
- **Linter**: ESLint with React configuration
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **File Naming**: PascalCase for components, camelCase for utilities

```javascript
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/api/vendors');
      setVendors(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Component JSX */}
    </div>
  );
};

export default VendorList;
```

### Git Commit Messages
Follow the Conventional Commits specification:

```
type(scope): brief description

Detailed explanation if needed.

Fixes #issue-number
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(api): add CVE search by severity filter

Add ability to filter CVE search results by severity level.
Includes API endpoint, frontend interface, and tests.

Fixes #123

fix(frontend): resolve infinite loading on vendor page

The vendor list was not handling empty responses correctly,
causing infinite loading spinner.

Fixes #456
```

## 🧪 Testing Guidelines

### Backend Testing
- **Framework**: pytest
- **Coverage**: Aim for >80% test coverage
- **Types**: Unit tests, integration tests, API tests

```python
import pytest
from app import create_app
from app.models import Vendor

@pytest.fixture
def client():
    app = create_app('testing')
    with app.test_client() as client:
        yield client

def test_create_vendor(client):
    """Test vendor creation endpoint."""
    vendor_data = {
        'name': 'Test Vendor',
        'description': 'Test Description'
    }
    response = client.post('/api/vendors', json=vendor_data)
    assert response.status_code == 201
    assert response.json['data']['name'] == 'Test Vendor'
```

### Frontend Testing
- **Framework**: Jest and React Testing Library
- **Types**: Component tests, integration tests, user interaction tests

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import VendorForm from '../VendorForm';

test('renders vendor form with required fields', () => {
  render(<VendorForm />);
  
  expect(screen.getByLabelText(/vendor name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
});

test('submits form with valid data', async () => {
  const mockOnSubmit = jest.fn();
  render(<VendorForm onSubmit={mockOnSubmit} />);
  
  fireEvent.change(screen.getByLabelText(/vendor name/i), {
    target: { value: 'Test Vendor' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /save/i }));
  
  await waitFor(() => {
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Test Vendor',
      description: ''
    });
  });
});
```

## 📚 Documentation

### What to Document
- **API Changes**: Update API.md for any API modifications
- **New Features**: Add documentation for new features
- **Configuration**: Document new configuration options
- **Deployment**: Update deployment guides if needed

### Documentation Style
- **Clear and Concise**: Write for your target audience
- **Examples**: Include code examples and use cases
- **Screenshots**: Add screenshots for UI changes
- **Links**: Link to relevant sections and external resources

## 🔄 Pull Request Process

### Before Submitting
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### Pull Request Template
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Related Issues
Fixes #(issue number)
```

### Review Process
1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Maintainer Review**: Project maintainer reviews code
3. **Feedback**: Address any feedback or requested changes
4. **Approval**: Once approved, the PR will be merged

## 🎯 Recognition Program

### Contributor Levels
- **First-time Contributor**: Special welcome and recognition
- **Regular Contributor**: 5+ merged PRs, gets mention in releases
- **Trusted Contributor**: 20+ PRs, can review other PRs
- **Maintainer**: Core team member with merge permissions

### Recognition Methods
- **Contributors File**: Listed in CONTRIBUTORS.md
- **Release Notes**: Mentioned in release announcements
- **Social Media**: Highlighted on project social media
- **Swag**: Project stickers and swag for significant contributors

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Technical questions and bug reports
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat with community
- **Email**: security@versionintel.org for security issues

### Mentorship Program
New contributors can request mentorship from experienced contributors:
- **Getting Started**: Help with initial setup and first contribution
- **Code Review**: Guidance on code quality and best practices
- **Feature Development**: Support for developing new features

## 📋 Contributor Checklist

### First-Time Setup
- [ ] Fork and clone repository
- [ ] Set up development environment
- [ ] Run tests successfully
- [ ] Read documentation thoroughly
- [ ] Join community Discord

### Before Each Contribution
- [ ] Sync with upstream main branch
- [ ] Create feature branch
- [ ] Check existing issues/PRs
- [ ] Understand the scope of work

### During Development
- [ ] Follow coding standards
- [ ] Write tests for new code
- [ ] Update documentation
- [ ] Test changes thoroughly
- [ ] Run linting and formatting

### After Development
- [ ] Create comprehensive PR description
- [ ] Respond to review feedback
- [ ] Update PR based on comments
- [ ] Celebrate your contribution! 🎉

## 🌟 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

### Key Principles
- **Be Respectful**: Treat all community members with respect
- **Be Inclusive**: Welcome people of all backgrounds and experience levels
- **Be Constructive**: Focus on what is best for the community
- **Be Patient**: Understand that people have different skill levels and time availability

---

Thank you for contributing to VersionIntel! Your contributions help make cybersecurity tools more accessible to everyone. 🚀