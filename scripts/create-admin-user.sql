-- SQL script to manually create an admin user
-- Replace 'YourSecurePassword123' with your desired password hash
-- 
-- To generate a password hash, you can:
-- 1. Use the Node.js script: npm run create-admin -- --password "YourPassword123"
-- 2. Or use bcrypt online tool (not recommended for production)
-- 3. Or use the Node.js script to generate hash, then copy it here

-- Example: Create admin user with email verified
-- Note: You need to generate the password hash first using bcrypt
-- The password hash below is for password "Admin123" (cost factor 12)
-- DO NOT use this in production - generate your own!

INSERT INTO users (
    email,
    password_hash,
    email_verified,
    email_verification_token,
    email_verification_expires,
    created_at,
    updated_at
) VALUES (
    'msrusskikh@gmail.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5Y', -- Replace with your password hash
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, email, email_verified, created_at FROM users WHERE email = 'msrusskikh@gmail.com';
