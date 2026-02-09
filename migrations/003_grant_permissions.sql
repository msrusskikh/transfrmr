-- Grant necessary permissions to the application database user
-- This fixes the "permission denied for table users" error (error code 42501)
--
-- IMPORTANT: Replace 'your_app_user' with the actual database user from your DATABASE_URL
-- The user is typically the part before the @ in the connection string:
-- postgresql://your_app_user:password@host:port/database
--
-- To find your database user, check your DATABASE_URL environment variable
-- or run: SELECT current_user; in psql

-- Grant permissions on users table
GRANT SELECT, INSERT, UPDATE ON users TO your_app_user;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO your_app_user; -- If using SERIAL instead of UUID

-- Grant permissions on sessions table
GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO your_app_user;

-- Grant permissions on login_attempts table
GRANT SELECT, INSERT, UPDATE ON login_attempts TO your_app_user;
GRANT USAGE, SELECT ON SEQUENCE login_attempts_id_seq TO your_app_user;

-- Grant permissions on payments table
GRANT SELECT, INSERT, UPDATE ON payments TO your_app_user;

-- If using UUID (which this project does), you might also need:
-- GRANT EXECUTE ON FUNCTION gen_random_uuid() TO your_app_user;

-- Verify permissions (optional - run this to check)
-- SELECT grantee, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE table_name='users' AND grantee='your_app_user';
