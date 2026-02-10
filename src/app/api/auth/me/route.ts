import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { verifyJWT } from '@/lib/auth/tokens'
import { findSessionByToken } from '@/lib/db/sessions'
import { getUserById } from '@/lib/db/users'

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthCookie()

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify JWT (fast operation, no DB needed)
    let payload
    try {
      payload = await verifyJWT(token)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Add timeout wrapper for database operations
    const dbTimeout = 3000 // 3 seconds max for auth check
    const dbTimeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Database timeout - service may be recovering'))
      }, dbTimeout)
    })

    try {
      // Race between DB queries and timeout
      const [session, user] = await Promise.race([
        Promise.all([
          findSessionByToken(token),
          getUserById(payload.sub)
        ]),
        dbTimeoutPromise
      ])

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 401 }
        )
      }

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
        },
      })
    } catch (dbError: any) {
      // If database times out or fails, log but don't crash
      console.error('[Me] Database error (non-critical):', dbError.message)
      // Return 503 (Service Unavailable) instead of 500 to indicate temporary issue
      return NextResponse.json(
        { error: 'Authentication service temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }
  } catch (error: any) {
    console.error('[Me] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
