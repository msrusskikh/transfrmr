import { NextRequest, NextResponse } from 'next/server'
import { findUserByVerificationToken, verifyUserEmail } from '@/lib/db/users'

export async function GET(request: NextRequest) {
  // Use APP_URL (runtime) first, fallback to NEXT_PUBLIC_APP_URL (build-time), then derive from request
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || request.url.split('/api')[0]
  
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_token`)
    }

    // Find user by verification token
    const user = await findUserByVerificationToken(token)

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_or_expired_token`)
    }

    // Verify email
    await verifyUserEmail(user.id)

    // Redirect to login with success message
    return NextResponse.redirect(`${baseUrl}/login?verified=true`)
  } catch (error) {
    console.error('[VerifyEmail] Error:', error)
    return NextResponse.redirect(`${baseUrl}/login?error=verification_failed`)
  }
}
