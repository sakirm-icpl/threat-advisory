# Local Development Setup

This document summarizes the changes made to configure the Version Detection Pattern Database for local development using the URL http://172.17.14.65:3000/.

## Changes Made

### Footer Links Updated
All HTML pages have been updated to use http://172.17.14.65:3000/ for the "Live Site" link in the footer:
- docs/index.html
- docs/pattern-database.html
- docs/community/beginners-guide.html
- docs/community/good-first-issues.html
- docs/community/pattern-development.html

### Documentation Links Updated
- README.md: Updated documentation site links to http://172.17.14.65:3000/
- CONTRIBUTING.md: Updated documentation site links to http://172.17.14.65:3000/
- patterns/CONTRIBUTING.md: Updated documentation site links to http://172.17.14.65:3000/

### Community Page Links
Updated community page links in README.md to point to the local development server:
- Beginner's Guide: http://172.17.14.65:3000/community/beginners-guide.html
- Good First Issues: http://172.17.14.65:3000/community/good-first-issues.html
- Pattern Development Guide: http://172.17.14.65:3000/community/pattern-development.html

## Pattern Links Unchanged
The direct links to pattern files in the pattern database page still point to the GitHub repository:
- Each pattern name links to its JSON file in the sakirm-icpl/threat-advisory repository
- This allows users to view the actual pattern files while testing the site locally

## Testing the Site
To test the site locally:

1. Serve the docs/ directory from your local server
2. Access the site at http://172.17.14.65:3000/
3. All navigation and footer links will work correctly
4. Pattern links will take users to the GitHub repository files

## Deployment Note
When deploying to GitHub Pages, you may want to revert the footer links to point to the GitHub Pages URL instead of the local development URL.