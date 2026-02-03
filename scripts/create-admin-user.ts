/**
 * Script to create an admin user in the database
 * 
 * Usage:
 *   npm run create-admin -- --password "YourPassword123"
 *   or
 *   ADMIN_PASSWORD="YourPassword123" npm run create-admin
 */

import { hashPassword } from '../src/lib/auth/password'
import { query } from '../src/lib/db'
import { ADMIN_EMAIL } from '../src/lib/admin'

async function createAdminUser() {
  // Get password from command line args or environment variable
  const args = process.argv.slice(2)
  const passwordArg = args.find(arg => arg.startsWith('--password='))
  const password = passwordArg
    ? passwordArg.split('=')[1]
    : process.env.ADMIN_PASSWORD || 'Admin123'

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.error('Please set it in your .env file or export it:')
    console.error('  export DATABASE_URL="postgresql://user:password@localhost:5432/transfrmr"')
    process.exit(1)
  }

  console.log('🔐 Creating admin user...')
  console.log(`📧 Email: ${ADMIN_EMAIL}`)
  console.log(`🔑 Password: ${password}`)
  console.log('')

  try {
    // Check if user already exists
    const existingUser = await query(
      'SELECT id, email, email_verified FROM users WHERE email = $1',
      [ADMIN_EMAIL.toLowerCase()]
    )

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0]
      console.log('⚠️  User already exists!')
      console.log(`   ID: ${user.id}`)
      console.log(`   Email verified: ${user.email_verified}`)
      console.log('')
      console.log('To update the password, you can:')
      console.log('  1. Use the password reset flow')
      console.log('  2. Manually update in the database')
      process.exit(0)
    }

    // Hash password
    console.log('🔒 Hashing password...')
    const passwordHash = await hashPassword(password)

    // Create user with email verified
    console.log('👤 Creating user...')
    const result = await query(
      `INSERT INTO users (
        email, 
        password_hash, 
        email_verified,
        email_verification_token,
        email_verification_expires
      )
      VALUES ($1, $2, $3, NULL, NULL)
      RETURNING id, email, email_verified, created_at`,
      [ADMIN_EMAIL.toLowerCase(), passwordHash, true]
    )

    const user = result.rows[0]
    console.log('')
    console.log('✅ Admin user created successfully!')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Email verified: ${user.email_verified}`)
    console.log(`   Created at: ${user.created_at}`)
    console.log('')
    console.log('🎉 You can now login at /login')
    console.log('')
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message)
    if (error.code === '23505') {
      console.error('   User with this email already exists')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Could not connect to database. Is PostgreSQL running?')
      console.error('   Check your DATABASE_URL connection string')
    }
    process.exit(1)
  }
}

// Run the script
createAdminUser()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
