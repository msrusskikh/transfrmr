import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/auth/validation'
import { verifyUserPassword } from '@/lib/db/users'
import { generateJWT } from '@/lib/auth/tokens'
import { setAuthCookie } from '@/lib/auth/cookies'
import {
  checkLoginRateLimitEmail,
  checkLoginRateLimitIP,
  recordLoginAttempt,
  getClientIP,
} from '@/lib/auth/rate-limit'
import { createSession } from '@/lib/db/sessions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = loginSchema.safeParse(body)
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
    const ipAddress = getClientIP(request)

    // Check rate limits
    const emailRateLimit = await checkLoginRateLimitEmail(email)
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Слишком много попыток входа. Попробуйте позже.' 
        },
        { status: 429 }
      )
    }

    const ipRateLimit = await checkLoginRateLimitIP(ipAddress)
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Слишком много попыток входа. Попробуйте позже.' 
        },
        { status: 429 }
      )
    }

    // Verify password
    const user = await verifyUserPassword(email, password)

    if (!user) {
      await recordLoginAttempt(email, ipAddress, false)
      return NextResponse.json(
        { success: false, error: 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!user.email_verified) {
      await recordLoginAttempt(email, ipAddress, false)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Пожалуйста, подтвердите вашу почту перед входом' 
        },
        { status: 403 }
      )
    }

    // Generate JWT and create session
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    const token = await generateJWT(user.id, user.email, sessionId)
    
    // Create session in database
    const userAgent = request.headers.get('user-agent') || undefined
    await createSession(user.id, token, expiresAt, ipAddress, userAgent)

    // Set cookie
    await setAuthCookie(token)

    // Record successful login
    await recordLoginAttempt(email, ipAddress, true)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('[Login] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при входе' },
      { status: 500 }
    )
  }
}
