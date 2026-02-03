import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie, deleteAuthCookie } from '@/lib/auth/cookies'
import { verifyJWT } from '@/lib/auth/tokens'
import { findSessionByToken, deleteSession } from '@/lib/db/sessions'
import { hashToken } from '@/lib/auth/tokens'

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthCookie()

    if (token) {
      try {
        // Verify token and get session ID
        const payload = await verifyJWT(token)
        
        // Find and delete session
        const session = await findSessionByToken(token)
        if (session) {
          await deleteSession(session.id)
        }
      } catch (error) {
        // Token might be invalid, but we still want to clear the cookie
        console.warn('[Logout] Error verifying token:', error)
      }
    }

    // Always clear the cookie
    await deleteAuthCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Logout] Error:', error)
    // Still try to clear cookie even if there's an error
    await deleteAuthCookie().catch(() => {})
    return NextResponse.json({ success: true })
  }
}
