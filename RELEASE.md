# VersionIntel Release Process

This document outlines the release process for VersionIntel, including versioning strategy, release checklist, and procedures for creating and publishing releases.

## Versioning Strategy

VersionIntel follows [Semantic Versioning 2.0.0](https://semver.org/) (SemVer):

### Version Format
`MAJOR.MINOR.PATCH` (e.g., 1.2.3)

### Version Numbering

- **MAJOR** version: Incompatible API changes, major new functionality
- **MINOR** version: Backward-compatible new features
- **PATCH** version: Backward-compatible bug fixes

### Pre-release Versions
Pre-release versions may be denoted by appending a hyphen and a series of dot separated identifiers:
- `1.0.0-alpha.1`
- `1.0.0-beta.2`
- `1.0.0-rc.1`

### Examples

| Version | Type | Description |
|---------|------|-------------|
| 1.0.0 | Initial release | First stable release |
| 1.0.1 | Patch release | Bug fixes only |
| 1.1.0 | Minor release | New features, backward compatible |
| 2.0.0 | Major release | Breaking changes |

## Release Process

### 1. Pre-release Preparation

#### Code Quality Checks
- [ ] All tests pass (`python tests/run_all_tests.py`)
- [ ] Code coverage meets minimum requirements (85% backend, 80% frontend)
- [ ] Code linting passes (`flake8` for backend, `eslint` for frontend)
- [ ] Security scan completed
- [ ] Documentation updated

#### Issue Triage
- [ ] All issues in milestone are closed or moved to next milestone
- [ ] Release notes drafted
- [ ] Breaking changes documented

### 2. Version Bump

#### Update Version Numbers
1. Update version in backend `setup.py` or equivalent
2. Update version in frontend `package.json`
3. Update version in `README.md` badges
4. Update version in documentation

#### Create Version Commit
```bash
git checkout -b release/vX.Y.Z
# Update version files
git add .
git commit -m "chore(release): bump version to vX.Y.Z"
```

### 3. Release Candidate

#### Create RC Branch
```bash
git checkout -b release/vX.Y.Z-rc.1
```

#### Tag and Publish RC
```bash
git tag -a vX.Y.Z-rc.1 -m "Release Candidate vX.Y.Z-rc.1"
git push origin vX.Y.Z-rc.1
```

#### Testing
- [ ] Manual testing on all supported platforms
- [ ] Integration testing with external services
- [ ] Performance testing
- [ ] Security review

### 4. Final Release

#### Create Release Branch
```bash
git checkout -b release/vX.Y.Z
git merge main
```

#### Final Checks
- [ ] All RC feedback addressed
- [ ] Final testing completed
- [ ] Release notes finalized
- [ ] Documentation published

#### Tag Release
```bash
git tag -a vX.Y.Z -m "VersionIntel vX.Y.Z"
git push origin vX.Y.Z
```

### 5. Publication

#### GitHub Release
1. Create GitHub release from tag
2. Upload release assets
3. Publish release notes
4. Update release description

#### Docker Images
```bash
# Build and push backend image
docker build -t versionintel/backend:vX.Y.Z ./backend
docker push versionintel/backend:vX.Y.Z

# Build and push frontend image
docker build -t versionintel/frontend:vX.Y.Z ./frontend
docker push versionintel/frontend:vX.Y.Z
```

#### Package Managers
- [ ] Update PyPI packages
- [ ] Update NPM packages (if applicable)
- [ ] Update Homebrew formula (if applicable)

## Release Checklist

### Code Freeze
- [ ] Feature freeze 1 week before release
- [ ] Bug fix only period
- [ ] No new features merged

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] End-to-end tests pass
- [ ] Cross-platform testing
- [ ] Browser compatibility testing

### Documentation
- [ ] Release notes updated
- [ ] API documentation updated
- [ ] User guides updated
- [ ] Migration guides (for breaking changes)

### Assets
- [ ] Docker images built and pushed
- [ ] Binary releases created
- [ ] Checksums generated
- [ ] Release assets uploaded

### Communication
- [ ] Release announcement drafted
- [ ] Social media posts prepared
- [ ] Mailing list notification
- [ ] Blog post (for major releases)

## Release Notes Template

```markdown
# VersionIntel vX.Y.Z

[Release Date]

## Highlights

- [Major feature 1]
- [Major feature 2]
- [Important bug fix]

## New Features

- [Feature 1] - Brief description
- [Feature 2] - Brief description

## Bug Fixes

- [Bug fix 1] - Brief description
- [Bug fix 2] - Brief description

## Breaking Changes

- [Breaking change 1] - Migration instructions
- [Breaking change 2] - Migration instructions

## Security Updates

- [Security fix 1] - CVE reference if applicable
- [Security fix 2] - CVE reference if applicable

## Contributors

- [Contributor 1]
- [Contributor 2]
```

## Hotfix Process

For critical security issues or major bugs:

### 1. Create Hotfix Branch
```bash
git checkout -b hotfix/vX.Y.Z+1 tags/vX.Y.Z
```

### 2. Apply Fix
```bash
# Implement fix
git add .
git commit -m "fix: critical security issue"
```

### 3. Release Hotfix
```bash
git tag -a vX.Y.Z+1 -m "Hotfix vX.Y.Z+1"
git push origin vX.Y.Z+1
```

### 4. Merge Back
```bash
git checkout main
git merge hotfix/vX.Y.Z+1
git push origin main
```

## Long-term Support (LTS) Releases

### LTS Policy
- Major versions receive LTS for 18 months
- Security updates only during LTS period
- Critical bug fixes only during LTS period

### LTS Release Process
- Designated by `-lts` suffix in version
- Extended testing and validation
- Dedicated release branch

## Support Policy

### Version Support
| Version | Status | Support Until |
|---------|--------|---------------|
| 2.x     | Active | TBD |
| 1.x     | LTS    | 2025-12-31 |
| 0.x     | End of Life | 2024-06-30 |

### Support Levels
1. **Active Development**: Full feature development, bug fixes, security updates
2. **Maintenance**: Bug fixes, security updates
3. **LTS**: Security updates only
4. **End of Life**: No support

## Tools and Automation

### Release Scripts
- `scripts/release.sh` - Automated release process
- `scripts/version-bump.sh` - Version number updates
- `scripts/changelog.sh` - Changelog generation

### CI/CD Integration
- Automated testing on release branches
- Automated Docker image building
- Automated release publishing

## Emergency Procedures

### Rollback Process
1. Identify failing release
2. Revert to previous stable version
3. Notify users
4. Investigate and fix issue
5. Release hotfix

### Communication Plan
- GitHub status page
- Twitter/LinkedIn announcements
- Mailing list notification
- Direct contact for enterprise users

## Roles and Responsibilities

### Release Manager
- Coordinates release process
- Ensures quality standards
- Communicates with stakeholders

### Quality Assurance
- Executes release testing
- Validates release candidates
- Reports issues

### Documentation Team
- Updates release notes
- Maintains user guides
- Publishes API documentation

### Security Team
- Reviews security implications
- Coordinates security releases
- Handles vulnerability reports

This release process ensures consistent, high-quality releases while maintaining clear communication with the community.