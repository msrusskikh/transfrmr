# Database Scripts

## Create Admin User

### Option 1: Using Node.js Script (Recommended)

This script will automatically hash the password and create the admin user.

**Prerequisites:**
- PostgreSQL database must be set up and running
- `DATABASE_URL` environment variable must be set in `.env` file

**Usage:**

```bash
# Set password via command line argument
npm run create-admin -- --password "YourSecurePassword123"

# Or set password via environment variable
ADMIN_PASSWORD="YourSecurePassword123" npm run create-admin

# Or use default password "Admin123" (not recommended for production)
npm run create-admin
```

**Example:**
```bash
npm run create-admin -- --password "MyAdminPass123"
```

The script will:
- Check if user already exists
- Hash the password using bcrypt (cost factor 12)
- Create the user with email verified = true
- Display the created user information

### Option 2: Using SQL Script

If you prefer to use SQL directly:

1. First, generate a password hash using the Node.js script or bcrypt:
   ```bash
   npm run create-admin -- --password "YourPassword123"
   # Copy the password hash from the output
   ```

2. Edit `create-admin-user.sql` and replace the password hash

3. Run the SQL script:
   ```bash
   psql -U your_user -d your_database -f scripts/create-admin-user.sql
   ```

### Admin Email

The admin email is configured in `src/lib/admin.ts`:
- Email: `msrusskikh@gmail.com`

### Password Requirements

The password must meet these requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

Example valid passwords:
- `Admin123`
- `MySecurePass1`
- `TestPassword2024`

### Troubleshooting

**Error: DATABASE_URL not set**
- Make sure you have a `.env` file with `DATABASE_URL` set
- Format: `postgresql://user:password@host:port/database`

**Error: Connection refused**
- Check if PostgreSQL is running
- Verify the connection string is correct
- Check if the database exists

**Error: User already exists**
- The script will detect if the user exists and show a message
- You can update the password using the password reset flow
- Or manually update in the database
