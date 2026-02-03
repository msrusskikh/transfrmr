import { SignJWT, jwtVerify } from 'jose'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = 60 * 60 * 24 * 7 // 7 days in seconds

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET must be set and at least 32 characters long'
  )
}

const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  sub: string // user id
  email: string
  iat: number
  exp: number
  jti: string // session id
}

/**
 * Generate a secure random token (32 bytes, hex encoded)
 * Used for email verification and password reset tokens
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate a JWT token for a user session
 */
export async function generateJWT(
  userId: string,
  email: string,
  sessionId: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  
  const jwt = await new SignJWT({
    sub: userId,
    email,
    jti: sessionId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + JWT_EXPIRES_IN)
    .sign(secret)

  return jwt
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify<JWTPayload>(token, secret)
  return payload
}

/**
 * Hash a token for storage in database
 * Uses SHA-256 for fast lookups while keeping original token secure
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
