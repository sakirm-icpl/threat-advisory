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

## Questions?

If you have questions about contributing, feel free to:

1. Open an issue for general questions
2. Contact the maintainers directly
3. Check our [documentation site](http://172.17.14.65:3000/) for more information

Thank you for helping make the Version Detection Pattern Database better for everyone!