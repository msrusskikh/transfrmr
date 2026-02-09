/**
 * Script to grant database permissions to the application user
 * This fixes the "permission denied for table users" error (error code 42501)
 * 
 * Usage:
 *   npm run grant-permissions
 *   or
 *   DATABASE_URL="postgresql://user:pass@host:port/db" npm run grant-permissions
 */

import { Pool } from 'pg'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env or .env.local
function loadEnvFile() {
  const envPath = join(process.cwd(), '.env')
  const envLocalPath = join(process.cwd(), '.env.local')
  
  const envFile = existsSync(envPath) ? envPath : (existsSync(envLocalPath) ? envLocalPath : null)
  
  if (envFile) {
    try {
      const content = readFileSync(envFile, 'utf8')
      content.split('\n').forEach(line => {
        line = line.trim()
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=')
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = value
            }
          }
        }
      })
    } catch (error) {
      // Silently fail if we can't read the file
    }
  }
}

// Load env vars before anything else
loadEnvFile()

function parseDatabaseUrl(url: string): { user?: string; database?: string } {
  try {
    const urlObj = new URL(url)
    return {
      user: urlObj.username || undefined,
      database: urlObj.pathname?.slice(1) || undefined,
    }
  } catch {
    // Fallback: try to parse manually
    const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
    if (match) {
      return {
        user: match[1],
        database: match[5],
      }
    }
    return {}
  }
}

async function grantPermissions() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.error('Please set it in your .env file or export it:')
    console.error('  export DATABASE_URL="postgresql://user:password@localhost:5432/transfrmr"')
    process.exit(1)
  }

  // Parse DATABASE_URL to extract user
  const connectionConfig = parseDatabaseUrl(process.env.DATABASE_URL)
  const appUser = connectionConfig.user

  if (!appUser) {
    console.error('❌ Could not extract database user from DATABASE_URL')
    console.error('DATABASE_URL format should be: postgresql://user:password@host:port/database')
    process.exit(1)
  }

  console.log('🔐 Granting database permissions...')
  console.log(`👤 Database user: ${appUser}`)
  console.log('')

  // Create a connection pool with superuser/admin credentials
  // NOTE: You may need to use a different connection string with admin privileges
  // For example, if your app user doesn't have permission to grant permissions,
  // you'll need to connect as a superuser (postgres user)
  const adminPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // If the app user can't grant permissions, you'll need to:
    // 1. Connect as postgres superuser, or
    // 2. Run this script manually as a superuser
  })

  try {
    // Test connection
    await adminPool.query('SELECT 1')
    console.log('✅ Connected to database')
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    console.error('')
    console.error('If you get a permission error, you may need to:')
    console.error('1. Connect as a database superuser (postgres)')
    console.error('2. Or run the SQL script manually: migrations/003_grant_permissions.sql')
    console.error('3. Replace "your_app_user" with:', appUser)
    process.exit(1)
  }

  try {
    // Grant permissions on users table
    console.log('📝 Granting permissions on users table...')
    await adminPool.query(`
      GRANT SELECT, INSERT, UPDATE ON users TO ${appUser};
    `)
    console.log('   ✅ Users table permissions granted')

    // Grant permissions on sessions table
    console.log('📝 Granting permissions on sessions table...')
    await adminPool.query(`
      GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO ${appUser};
    `)
    console.log('   ✅ Sessions table permissions granted')

    // Grant permissions on login_attempts table
    console.log('📝 Granting permissions on login_attempts table...')
    await adminPool.query(`
      GRANT SELECT, INSERT, UPDATE ON login_attempts TO ${appUser};
      GRANT USAGE, SELECT ON SEQUENCE login_attempts_id_seq TO ${appUser};
    `)
    console.log('   ✅ Login attempts table permissions granted')

    // Grant permissions on payments table
    console.log('📝 Granting permissions on payments table...')
    await adminPool.query(`
      GRANT SELECT, INSERT, UPDATE ON payments TO ${appUser};
    `)
    console.log('   ✅ Payments table permissions granted')

    // Grant execute permission on gen_random_uuid() function (needed for UUID generation)
    console.log('📝 Granting permission on gen_random_uuid() function...')
    try {
      await adminPool.query(`
        GRANT EXECUTE ON FUNCTION gen_random_uuid() TO ${appUser};
      `)
      console.log('   ✅ UUID function permission granted')
    } catch (error: any) {
      // This might fail if the function is in a different schema or already granted
      if (error.code !== '42501' && error.code !== '42883') {
        console.log('   ⚠️  UUID function permission (may already be granted or not needed)')
      }
    }

    console.log('')
    console.log('✅ All permissions granted successfully!')
    console.log('')
    console.log('You can now test the registration flow again.')

  } catch (error: any) {
    console.error('❌ Failed to grant permissions:', error.message)
    console.error('')
    console.error('If you get a permission error, you need to run this as a database superuser.')
    console.error('Options:')
    console.error('1. Connect to database as postgres user and run:')
    console.error(`   psql -U postgres -d ${connectionConfig.database || 'your_database'} -c "GRANT SELECT, INSERT, UPDATE ON users TO ${appUser};"`)
    console.error('   (Replace "your_app_user" with:', appUser, ')')
    console.error('2. Or manually run the SQL commands in migrations/003_grant_permissions.sql')
    process.exit(1)
  } finally {
    await adminPool.end()
  }
}

grantPermissions().catch(console.error)
