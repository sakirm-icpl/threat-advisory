# Contributing to Version Detection Pattern Database

Thank you for your interest in contributing to the Version Detection Pattern Database! This document provides guidelines for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Pattern Contribution Guidelines](#pattern-contribution-guidelines)
- [Documentation Improvements](#documentation-improvements)
- [Code Quality](#code-quality)
- [Community](#community)
- [Detailed Pull Request Process](#detailed-pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your work
4. Make your changes
5. Test your changes
6. Commit and push your changes
7. Create a pull request

## How to Contribute

There are many ways to contribute to this project:

1. **Add new patterns** - Research and create regex patterns for detecting software versions
2. **Improve existing patterns** - Enhance accuracy, add test cases, or improve metadata
3. **Fix issues** - Help resolve issues reported on GitHub
4. **Improve documentation** - Enhance guides, tutorials, and explanations
5. **Enhance tooling** - Improve validation tools and utilities
6. **Report bugs** - Identify and report issues with existing patterns or tools

## Pattern Contribution Guidelines

### Pattern Structure

All patterns must follow our standardized JSON structure as defined in the [pattern template](https://github.com/sakirm-icpl/threat-advisory/blob/master/patterns/TEMPLATE.md).

### Research Requirements

Before submitting a pattern:

1. Conduct thorough research on the software's version reporting mechanisms
2. Identify multiple examples of version strings in different contexts
3. Understand variations in version formatting
4. Consider different deployment scenarios

### Quality Standards

1. **Accuracy** - Patterns must correctly identify versions without false positives
2. **Specificity** - Patterns should be specific enough to avoid matching unrelated text
3. **Completeness** - Include comprehensive metadata and test cases
4. **Documentation** - Provide clear descriptions of what the pattern detects

### Test Cases

Every pattern must include test cases that:

1. Cover various version formats for the product
2. Include both positive and negative test cases
3. Demonstrate edge cases
4. Validate correct version extraction

## Documentation Improvements

We welcome improvements to our documentation:

1. Clarify existing documentation
2. Add new guides and tutorials
3. Improve examples
4. Fix typos and grammatical errors
5. Translate documentation to other languages

## Code Quality

For code contributions to our tools:

1. Follow established coding conventions
2. Include comments for complex logic
3. Write clear commit messages
4. Test your changes thoroughly

## Community

We encourage a welcoming and supportive community:

1. Be respectful and inclusive
2. Provide constructive feedback
3. Help newcomers get started
4. Share knowledge and expertise
5. Participate in discussions

## Detailed Pull Request Process

### Before Creating a Pull Request

1. **Ensure your fork is up to date**:
   ```bash
   git remote add upstream https://github.com/sakirm-icpl/threat-advisory.git
   git fetch upstream
   git checkout master
   git merge upstream/master
   ```

2. **Rebase your feature branch** (if needed):
   ```bash
   git checkout your-feature-branch
   git rebase master
   ```

3. **Run validation tools**:
   ```bash
   # For pattern files
   python tools/validate-pattern.py patterns/your-category/your-pattern.json
   
   # For all patterns (optional but recommended)
   python tools/validate-all-patterns.py
   ```

4. **Check your changes**:
   ```bash
   git diff
   git status
   ```

### Creating Your Pull Request

1. **Push your changes to your fork**:
   ```bash
   git push origin your-feature-branch
   ```

2. **Navigate to your fork on GitHub**:
   - Go to https://github.com/YOUR-USERNAME/threat-advisory
   - Switch to your feature branch

3. **Create the Pull Request**:
   - Click the "Compare & pull request" button
   - Or click "New pull request" and select your branch

4. **Fill out the Pull Request Template**:
   - **Title**: Use a clear, descriptive title
   - **Description**: Include:
     * What changes you made
     * Why you made them
     * How you tested them
     * Any related issues (e.g., "Closes #123")

5. **Submit the Pull Request**:
   - Click "Create pull request"

### After Submitting Your Pull Request

1. **Monitor your PR**:
   - Check for automated CI status
   - Respond to any reviewer comments promptly
   - Make requested changes in new commits

2. **Update your PR if needed**:
   ```bash
   # Make changes locally
   git add .
   git commit -m "Address review feedback"
   git push origin your-feature-branch
   ```

3. **Respond to feedback**:
   - Be open to suggestions
   - Ask questions if something is unclear
   - Thank reviewers for their time

### Pull Request Best Practices

1. **Keep PRs focused**:
   - One PR should address one specific issue or feature
   - Avoid combining unrelated changes

2. **Write good commit messages**:
   - Use present tense ("Add pattern for..." not "Added pattern for...")
   - Be specific and concise
   - Reference issues when applicable

3. **Include tests when possible**:
   - Add test cases for pattern contributions
   - Ensure all existing tests still pass

4. **Follow the project's style**:
   - Match the existing code and documentation style
   - Use the established patterns and conventions

### Common Pull Request Scenarios

#### Adding a New Pattern
1. Create a new JSON file in the appropriate category directory
2. Follow the pattern template exactly
3. Include comprehensive test cases
4. Validate with the pattern validation tool
5. Update any relevant documentation

#### Fixing an Existing Pattern
1. Identify the issue with the existing pattern
2. Make minimal changes to fix the issue
3. Add test cases to prevent regression
4. Validate the updated pattern
5. Update documentation if needed

#### Improving Documentation
1. Identify areas that need improvement
2. Make clear, concise changes
3. Check for grammar and spelling
4. Ensure technical accuracy
5. Follow the existing documentation style

## Questions?

If you have questions about contributing, feel free to:

1. Open an issue for general questions
2. Contact the maintainers directly
3. Check our [documentation site](https://sakirm-icpl.github.io/threat-advisory/) for more information

Thank you for helping make the Version Detection Pattern Database better for everyone!