import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/auth/validation'
import { createUser } from '@/lib/db/users'
import { sendVerificationEmail } from '@/lib/email'
import { getClientIP } from '@/lib/auth/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.issues[0]?.message || 'Неверные данные' 
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Check if user already exists
    const existingUser = await createUser(email, password).catch((error: any) => {
      // If unique constraint violation, user already exists
      if (error.code === '23505') {
        // Still return generic message to prevent email enumeration
        return null
      }
      throw error
    })

    if (!existingUser) {
      // Generic message - don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'Если аккаунт с таким email не существует, вы получите письмо для подтверждения',
      })
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, existingUser.verificationToken)
    } catch (emailError) {
      console.error('[Register] Failed to send verification email:', emailError)
      // Don't fail registration if email fails - user can request resend later
    }

    return NextResponse.json({
      success: true,
      message: 'Проверьте вашу почту для подтверждения аккаунта',
    })
  } catch (error: any) {
    console.error('[Register] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при регистрации' },
      { status: 500 }
    )
  }
}
