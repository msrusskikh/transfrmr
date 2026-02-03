import { query } from './index'
import { hashToken } from '@/lib/auth/tokens'

export interface Session {
  id: string
  user_id: string
  token_hash: string
  expires_at: Date
  created_at: Date
  ip_address: string | null
  user_agent: string | null
}

/**
 * Create a new session
 */
export async function createSession(
  userId: string,
  token: string,
  expiresAt: Date,
  ipAddress?: string,
  userAgent?: string
): Promise<Session> {
  const tokenHash = hashToken(token)

  const result = await query<Session>(
    `INSERT INTO sessions (user_id, token_hash, expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      userId,
      tokenHash,
      expiresAt.toISOString(),
      ipAddress || null,
      userAgent || null,
    ]
  )

  return result.rows[0]
}

/**
 * Find session by token hash
 */
export async function findSessionByToken(
  token: string
): Promise<Session | null> {
  const tokenHash = hashToken(token)
  const result = await query<Session>(
    `SELECT * FROM sessions 
     WHERE token_hash = $1 
     AND expires_at > NOW()`,
    [tokenHash]
  )
  return result.rows[0] || null
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE id = $1`, [sessionId])
}

/**
 * Delete all sessions for a user (useful when password is reset)
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE user_id = $1`, [userId])
}

/**
 * Clean up expired sessions (can be run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await query(
    `DELETE FROM sessions WHERE expires_at < NOW()`
  )
  return result.rowCount || 0
}
