-- Create versionintel user
CREATE USER versionintel WITH PASSWORD 'versionintel';

-- Grant privileges to versionintel user
GRANT ALL PRIVILEGES ON DATABASE versionintel TO versionintel;
GRANT ALL PRIVILEGES ON SCHEMA public TO versionintel;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO versionintel;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO versionintel;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO versionintel;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO versionintel;
