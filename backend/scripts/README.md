# Backend Scripts

This directory contains utility scripts for managing the VersionIntel application.

## Available Scripts

### `list_users.py`
Lists all users in the database. Useful for administrative purposes.

## Usage

Run this script from the backend directory:

```bash
python scripts/list_users.py
```

## User Management

Since VersionIntel uses GitHub OAuth only:
- No password reset scripts needed
- Admin privileges granted manually via database
- All users authenticate through GitHub

**Note:** These scripts are for administrative use only and should be used with caution. 