import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { debugLogServer } from '@/lib/debug-log'

const TOKEN_COOKIE_NAME = 'payment_access_token'
const TOKEN_EXPIRY_HOURS = 12

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const body = await request.json()
    const { orderId } = body

    // #region agent log
    await debugLogServer({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H5',
      location: 'src/app/api/payment/set-access-token/route.ts:POST',
      message: 'Set access token called',
      data: { orderId },
      timestamp: Date.now(),
    })
    // #endregion agent log

    // Generate secure token using crypto.randomUUID()
    const token = crypto.randomUUID()

    // Calculate expiration date (12 hours from now)
    const expirationDate = new Date()
    expirationDate.setHours(expirationDate.getHours() + TOKEN_EXPIRY_HOURS)

    // Set HttpOnly cookie with the access token
    cookieStore.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expirationDate,
      path: '/',
    })

    console.log('Payment access token set for order:', orderId)

    return NextResponse.json(
      { success: true, message: 'Access token set' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error setting access token:', error)
    return NextResponse.json(
      { error: 'Failed to set access token' },
      { status: 500 }
    )
  }
}
