import { query } from './index'
import { hashPassword, comparePasswordSafe } from '@/lib/auth/password'
import { generateSecureToken, hashToken } from '@/lib/auth/tokens'
import { appendFile } from 'fs/promises'
import { join } from 'path'

const LOG_FILE = join(process.cwd(), '.cursor', 'debug.log')
async function logDebug(data: any) {
  try {
    await appendFile(LOG_FILE, JSON.stringify({...data, timestamp: Date.now()}) + '\n')
  } catch {}
}

export interface User {
  id: string
  email: string
  password_hash: string
  email_verified: boolean
  email_verification_token: string | null
  email_verification_expires: Date | null
  password_reset_token: string | null
  password_reset_expires: Date | null
  created_at: Date
  updated_at: Date
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string
): Promise<{ id: string; email: string; verificationToken: string }> {
  // #region agent log
  logDebug({location:'users.ts:21',message:'createUser: entry',data:{email:email?.substring(0,10)+'...',hasPassword:!!password},runId:'run1',hypothesisId:'A'});
  // #endregion
  const passwordHash = await hashPassword(password)
  const verificationToken = generateSecureToken()
  const verificationExpires = new Date()
  verificationExpires.setHours(verificationExpires.getHours() + 24) // 24 hours

  // #region agent log
  logDebug({location:'users.ts:30',message:'createUser: before query',data:{hasPasswordHash:!!passwordHash,hasToken:!!verificationToken},runId:'run1',hypothesisId:'A'});
  // #endregion
  const result = await query<User>(
    `INSERT INTO users (email, password_hash, email_verification_token, email_verification_expires)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email`,
    [
      email.toLowerCase(),
      passwordHash,
      hashToken(verificationToken),
      verificationExpires.toISOString(),
    ]
  )
  // #region agent log
  logDebug({location:'users.ts:42',message:'createUser: query success',data:{rowCount:result.rowCount,hasUser:!!result.rows[0]},runId:'run1',hypothesisId:'A'});
  // #endregion

  const user = result.rows[0]
  
  // Return the plain token (not hashed) so it can be sent in email
  return {
    id: user.id,
    email: user.email,
    verificationToken,
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT * FROM users WHERE email = $1`,
    [email.toLowerCase()]
  )
  return result.rows[0] || null
}

/**
 * Find user by email verification token
 */
export async function findUserByVerificationToken(
  token: string
): Promise<User | null> {
  const tokenHash = hashToken(token)
  const result = await query<User>(
    `SELECT * FROM users 
     WHERE email_verification_token = $1 
     AND email_verification_expires > NOW()`,
    [tokenHash]
  )
  return result.rows[0] || null
}

/**
 * Find user by password reset token
 */
export async function findUserByResetToken(
  token: string
): Promise<User | null> {
  const tokenHash = hashToken(token)
  const result = await query<User>(
    `SELECT * FROM users 
     WHERE password_reset_token = $1 
     AND password_reset_expires > NOW()`,
    [tokenHash]
  )
  return result.rows[0] || null
}

/**
 * Verify user email
 */
export async function verifyUserEmail(userId: string): Promise<void> {
  await query(
    `UPDATE users 
     SET email_verified = true,
         email_verification_token = NULL,
         email_verification_expires = NULL,
         updated_at = NOW()
     WHERE id = $1`,
    [userId]
  )
}

/**
 * Set password reset token
 */
export async function setPasswordResetToken(
  userId: string,
  token: string
): Promise<void> {
  const tokenHash = hashToken(token)
  const expires = new Date()
  expires.setHours(expires.getHours() + 1) // 1 hour

  await query(
    `UPDATE users 
     SET password_reset_token = $1,
         password_reset_expires = $2,
         updated_at = NOW()
     WHERE id = $3`,
    [tokenHash, expires.toISOString(), userId]
  )
}

/**
 * Reset user password
 */
export async function resetUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const passwordHash = await hashPassword(newPassword)

  await query(
    `UPDATE users 
     SET password_hash = $1,
         password_reset_token = NULL,
         password_reset_expires = NULL,
         updated_at = NOW()
     WHERE id = $2`,
    [passwordHash, userId]
  )
}

/**
 * Verify user password
 */
export async function verifyUserPassword(
  email: string,
  password: string
): Promise<User | null> {
  const user = await findUserByEmail(email)
  
  if (!user) {
    // Use safe comparison to prevent timing attacks
    await comparePasswordSafe(password, null)
    return null
  }

  const isValid = await comparePasswordSafe(password, user.password_hash)
  return isValid ? user : null
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT * FROM users WHERE id = $1`,
    [userId]
  )
  return result.rows[0] || null
}
