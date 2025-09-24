-- VersionIntel Database Initialization Script
-- This script sets up the database for production use

-- Create versionintel user with secure password (if not exists)
DO $$ 
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'versionintel') THEN
      CREATE USER versionintel WITH PASSWORD 'versionintel_secure_password_change_in_production';
   END IF;
END $$;

-- Grant privileges to versionintel user
GRANT ALL PRIVILEGES ON DATABASE versionintel TO versionintel;
GRANT ALL PRIVILEGES ON SCHEMA public TO versionintel;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO versionintel;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO versionintel;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO versionintel;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO versionintel;

-- Create indexes for better performance (will be created when tables are created)
-- These are just placeholders - actual indexes will be created by SQLAlchemy

-- Set timezone
SET timezone = 'UTC';

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'VersionIntel database initialized successfully';
END $$;
