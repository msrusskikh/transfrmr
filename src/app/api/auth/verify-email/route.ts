import { NextRequest, NextResponse } from 'next/server'
import { findUserByVerificationToken, verifyUserEmail } from '@/lib/db/users'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_token', request.url)
      )
    }

    // Find user by verification token
    const user = await findUserByVerificationToken(token)

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_or_expired_token', request.url)
      )
    }

    // Verify email
    await verifyUserEmail(user.id)

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL('/login?verified=true', request.url)
    )
  } catch (error) {
    console.error('[VerifyEmail] Error:', error)
    return NextResponse.redirect(
      new URL('/login?error=verification_failed', request.url)
    )
  }
}
