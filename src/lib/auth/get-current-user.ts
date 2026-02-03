import { getAuthCookie } from '@/lib/auth/cookies'
import { verifyJWT } from '@/lib/auth/tokens'
import { findSessionByToken } from '@/lib/db/sessions'
import { getUserById } from '@/lib/db/users'

/**
 * Get the current authenticated user from the request
 * Returns null if not authenticated or token is invalid
 */
export async function getCurrentUser(): Promise<{
  id: string
  email: string
} | null> {
  try {
    const token = await getAuthCookie()

    if (!token) {
      return null
    }

    // Verify JWT
    const payload = await verifyJWT(token)

    // Check session exists in database and not expired
    const session = await findSessionByToken(token)
    if (!session) {
      return null
    }

    // Get user data
    const user = await getUserById(payload.sub)
    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
    }
  } catch (error) {
    console.error('[getCurrentUser] Error:', error)
    return null
  }
}
