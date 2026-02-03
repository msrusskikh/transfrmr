import { NextRequest, NextResponse } from 'next/server'
import { resetPasswordSchema } from '@/lib/auth/validation'
import {
  findUserByResetToken,
  resetUserPassword,
} from '@/lib/db/users'
import { deleteAllUserSessions } from '@/lib/db/sessions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = resetPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.issues[0]?.message || 'Неверные данные' 
        },
        { status: 400 }
      )
    }

    const { token, password } = validationResult.data

    // Find user by reset token
    const user = await findUserByResetToken(token)

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Неверный или истекший токен сброса пароля' 
        },
        { status: 400 }
      )
    }

    // Reset password
    await resetUserPassword(user.id, password)

    // Invalidate all existing sessions for this user
    await deleteAllUserSessions(user.id)

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно изменен',
    })
  } catch (error) {
    console.error('[ResetPassword] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при сбросе пароля' },
      { status: 500 }
    )
  }
}
