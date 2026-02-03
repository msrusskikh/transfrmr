import { cookies } from 'next/headers'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

const COOKIE_NAME = 'auth_token'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

/**
 * Get cookie options for auth token
 */
function getCookieOptions(): Partial<ResponseCookie> {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  }
}

/**
 * Set auth token cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, getCookieOptions())
}

/**
 * Get auth token from cookie
 */
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}

/**
 * Delete auth token cookie
 */
export async function deleteAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Get auth token from request cookies (for middleware)
 */
export function getAuthCookieFromRequest(
  cookieHeader: string | null
): string | undefined {
  if (!cookieHeader) return undefined
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    if (key && value) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, string>)
  
  return cookies[COOKIE_NAME]
}
