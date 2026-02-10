import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/auth/validation'
import { createUser, findUserByEmail } from '@/lib/db/users'
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

    // Add timeout protection for database operations
    const dbTimeout = 5000 // 5 seconds max
    const dbTimeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Database timeout - service may be recovering'))
      }, dbTimeout)
    })

    try {
      // Check if user already exists FIRST (cheap SELECT query)
      // This prevents expensive password hashing for existing users
      const existingUserCheck = await Promise.race([
        findUserByEmail(email),
        dbTimeoutPromise
      ])

      if (existingUserCheck) {
        // User already exists - return generic message to prevent email enumeration
        return NextResponse.json({
          success: true,
          message: 'Если аккаунт с таким email не существует, вы получите письмо для подтверждения',
        })
      }

      // User doesn't exist - now create (this will hash password)
      const newUser = await Promise.race([
        createUser(email, password),
        dbTimeoutPromise
      ])

      // Send verification email
      try {
        await sendVerificationEmail(email, newUser.verificationToken)
      } catch (emailError) {
        console.error('[Register] Failed to send verification email:', emailError)
        // Don't fail registration if email fails - user can request resend later
      }

      return NextResponse.json({
        success: true,
        message: 'Проверьте вашу почту для подтверждения аккаунта',
      })
    } catch (dbError: any) {
      // Handle database timeout or other errors
      if (dbError.message?.includes('timeout')) {
        console.error('[Register] Database timeout:', dbError.message)
        return NextResponse.json(
          { success: false, error: 'Сервис временно недоступен. Пожалуйста, попробуйте позже.' },
          { status: 503 }
        )
      }
      
      // Handle unique constraint violation (shouldn't happen with check above, but safety net)
      if (dbError.code === '23505') {
        // User was created between check and insert (race condition)
        return NextResponse.json({
          success: true,
          message: 'Если аккаунт с таким email не существует, вы получите письмо для подтверждения',
        })
      }
      
      // Re-throw other errors to be caught by outer catch
      throw dbError
    }
  } catch (error: any) {
    console.error('[Register] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при регистрации' },
      { status: 500 }
    )
  }
}
