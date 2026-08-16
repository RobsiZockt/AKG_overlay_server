-- Allow the readonly user to connect to databases
-- created from template1.
GRANT CONNECT ON DATABASE template1 TO readonly_user;

-- Allow access to the default public schema
GRANT USAGE ON SCHEMA public TO readonly_user;

-- Read existing tables in template1
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Read sequences
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO readonly_user;

-- Read future tables
ALTER DEFAULT PRIVILEGES
    IN SCHEMA public
    GRANT SELECT ON TABLES TO readonly_user;

-- Read future sequences
ALTER DEFAULT PRIVILEGES
    IN SCHEMA public
    GRANT SELECT ON SEQUENCES TO readonly_user;