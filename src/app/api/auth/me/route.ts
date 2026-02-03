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

    // Verify JWT
    let payload
    try {
      payload = await verifyJWT(token)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check session exists in database and not expired
    const session = await findSessionByToken(token)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 401 }
      )
    }

    // Get user data
    const user = await getUserById(payload.sub)
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
  } catch (error) {
    console.error('[Me] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
