import { query } from '@/lib/db'

// Rate limit configurations
const LOGIN_ATTEMPTS_PER_EMAIL = 5
const LOGIN_ATTEMPTS_PER_IP = 20
const LOGIN_WINDOW_MINUTES = 15

const RESET_REQUESTS_PER_EMAIL = 3
const RESET_WINDOW_MINUTES = 60

const REGISTRATION_PER_IP = 5
const REGISTRATION_WINDOW_MINUTES = 60

/**
 * Check if login attempts exceed rate limit for email
 */
export async function checkLoginRateLimitEmail(
  email: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - LOGIN_WINDOW_MINUTES)

  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM login_attempts
     WHERE email = $1 
     AND attempted_at > $2
     AND successful = false`,
    [email.toLowerCase(), windowStart.toISOString()]
  )

  const attempts = parseInt(result.rows[0]?.count || '0', 10)
  const remaining = Math.max(0, LOGIN_ATTEMPTS_PER_EMAIL - attempts)

  return {
    allowed: attempts < LOGIN_ATTEMPTS_PER_EMAIL,
    remaining,
  }
}

/**
 * Check if login attempts exceed rate limit for IP
 */
export async function checkLoginRateLimitIP(
  ipAddress: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - LOGIN_WINDOW_MINUTES)

  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM login_attempts
     WHERE ip_address = $1 
     AND attempted_at > $2
     AND successful = false`,
    [ipAddress, windowStart.toISOString()]
  )

  const attempts = parseInt(result.rows[0]?.count || '0', 10)
  const remaining = Math.max(0, LOGIN_ATTEMPTS_PER_IP - attempts)

  return {
    allowed: attempts < LOGIN_ATTEMPTS_PER_IP,
    remaining,
  }
}

/**
 * Record a login attempt
 */
export async function recordLoginAttempt(
  email: string | null,
  ipAddress: string,
  successful: boolean
): Promise<void> {
  await query(
    `INSERT INTO login_attempts (email, ip_address, successful)
     VALUES ($1, $2, $3)`,
    [email?.toLowerCase() || null, ipAddress, successful]
  )
}

/**
 * Check if password reset requests exceed rate limit
 */
export async function checkResetRateLimit(
  email: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - RESET_WINDOW_MINUTES)

  // Check login_attempts table for any attempts from this email
  // (we reuse the same table for simplicity)
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM login_attempts
     WHERE email = $1 
     AND attempted_at > $2`,
    [email.toLowerCase(), windowStart.toISOString()]
  )

  const attempts = parseInt(result.rows[0]?.count || '0', 10)
  const remaining = Math.max(0, RESET_REQUESTS_PER_EMAIL - attempts)

  return {
    allowed: attempts < RESET_REQUESTS_PER_EMAIL,
    remaining,
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare

  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  // Fallback (won't work in serverless, but good for development)
  return 'unknown'
}
