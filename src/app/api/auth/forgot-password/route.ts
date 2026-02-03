import { NextRequest, NextResponse } from 'next/server'
import { forgotPasswordSchema } from '@/lib/auth/validation'
import { findUserByEmail, setPasswordResetToken } from '@/lib/db/users'
import { generateSecureToken } from '@/lib/auth/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { checkResetRateLimit } from '@/lib/auth/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.errors[0]?.message || 'Неверные данные' 
        },
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    // Check rate limit
    const rateLimit = await checkResetRateLimit(email)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Слишком много запросов. Попробуйте позже.' 
        },
        { status: 429 }
      )
    }

    // Find user
    const user = await findUserByEmail(email)

    // Always return same response (don't reveal if email exists)
    if (user) {
      // Generate reset token
      const resetToken = generateSecureToken()
      await setPasswordResetToken(user.id, resetToken)

      // Send reset email
      try {
        await sendPasswordResetEmail(email, resetToken)
      } catch (emailError) {
        console.error('[ForgotPassword] Failed to send reset email:', emailError)
        // Don't reveal if email sending failed
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Если аккаунт существует, вы получите письмо со ссылкой для сброса пароля',
    })
  } catch (error) {
    console.error('[ForgotPassword] Error:', error)
    return NextResponse.json(
      { 
        success: true, 
        message: 'Если аккаунт существует, вы получите письмо со ссылкой для сброса пароля' 
      }
    )
  }
}
