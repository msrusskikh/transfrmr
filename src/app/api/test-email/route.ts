import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email'
import { generateSecureToken } from '@/lib/auth/tokens'

/**
 * Test endpoint for sending emails
 * 
 * Usage:
 * POST /api/test-email
 * Body: { "email": "test@example.com", "type": "verification" | "reset" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate type
    if (!type || (type !== 'verification' && type !== 'reset')) {
      return NextResponse.json(
        { success: false, error: 'Type must be "verification" or "reset"' },
        { status: 400 }
      )
    }

    // Generate a test token
    const token = generateSecureToken()

    // Send the appropriate email
    if (type === 'verification') {
      await sendVerificationEmail(email, token)
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully',
        email,
        type: 'verification',
        // Include token for testing purposes (so you can manually construct the URL)
        testUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`,
      })
    } else {
      await sendPasswordResetEmail(email, token)
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent successfully',
        email,
        type: 'reset',
        // Include token for testing purposes (so you can manually construct the URL)
        testUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`,
      })
    }
  } catch (error) {
    console.error('[TestEmail] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
