import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/auth/validation'
import { createUser } from '@/lib/db/users'
import { sendVerificationEmail } from '@/lib/email'
import { getClientIP } from '@/lib/auth/rate-limit'
import { appendFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'

const LOG_FILE = join(process.cwd(), '.cursor', 'debug.log')
async function logDebug(data: any) {
  const logEntry = JSON.stringify({...data, timestamp: Date.now()}) + '\n'
  // Also log to console (captured by PM2)
  console.log('[DEBUG]', logEntry.trim())
  try {
    // Ensure directory exists
    await mkdir(dirname(LOG_FILE), { recursive: true })
    await appendFile(LOG_FILE, logEntry)
  } catch (err) {
    // If file write fails, at least we have console logs
    console.error('[DEBUG] Failed to write log file:', err)
  }
}

export async function POST(request: NextRequest) {
  // #region agent log
  logDebug({location:'register/route.ts:7',message:'POST: entry',data:{hasBody:!!request.body},runId:'run1',hypothesisId:'C'});
  // #endregion
  try {
    // #region agent log
    logDebug({location:'register/route.ts:10',message:'POST: parsing body',data:{},runId:'run1',hypothesisId:'C'});
    // #endregion
    const body = await request.json()
    // #region agent log
    logDebug({location:'register/route.ts:13',message:'POST: body parsed',data:{hasEmail:!!body.email,hasPassword:!!body.password},runId:'run1',hypothesisId:'C'});
    // #endregion
    
    // Validate input
    const validationResult = registerSchema.safeParse(body)
    // #region agent log
    logDebug({location:'register/route.ts:17',message:'POST: validation result',data:{success:validationResult.success,errorCount:validationResult.success?0:validationResult.error.issues.length},runId:'run1',hypothesisId:'C'});
    // #endregion
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
    // #region agent log
    logDebug({location:'register/route.ts:28',message:'POST: calling createUser',data:{email:email?.substring(0,10)+'...'},runId:'run1',hypothesisId:'A'});
    // #endregion
    const existingUser = await createUser(email, password).catch(async (error: any) => {
      // #region agent log
      logDebug({location:'register/route.ts:30',message:'POST: createUser error caught',data:{errorCode:error?.code,errorMessage:error instanceof Error?error.message:String(error),errorName:error?.name,is23505:error?.code==='23505'},runId:'run1',hypothesisId:'B'});
      // #endregion
      // If unique constraint violation, user already exists
      if (error.code === '23505') {
        // Still return generic message to prevent email enumeration
        return null
      }
      throw error
    })
    // #region agent log
    logDebug({location:'register/route.ts:36',message:'POST: createUser result',data:{hasUser:!!existingUser,userId:existingUser?.id},runId:'run1',hypothesisId:'A'});
    // #endregion

    if (!existingUser) {
      // Generic message - don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'Если аккаунт с таким email не существует, вы получите письмо для подтверждения',
      })
    }

    // Send verification email
    // #region agent log
    logDebug({location:'register/route.ts:47',message:'POST: sending email',data:{email:email?.substring(0,10)+'...',hasToken:!!existingUser.verificationToken},runId:'run1',hypothesisId:'F'});
    // #endregion
    try {
      await sendVerificationEmail(email, existingUser.verificationToken)
      // #region agent log
      logDebug({location:'register/route.ts:50',message:'POST: email sent successfully',data:{},runId:'run1',hypothesisId:'F'});
      // #endregion
    } catch (emailError) {
      // #region agent log
      logDebug({location:'register/route.ts:52',message:'POST: email error caught',data:{errorType:emailError?.constructor?.name,errorMessage:emailError instanceof Error?emailError.message:String(emailError)},runId:'run1',hypothesisId:'F'});
      // #endregion
      console.error('[Register] Failed to send verification email:', emailError)
      // Don't fail registration if email fails - user can request resend later
    }

    // #region agent log
    logDebug({location:'register/route.ts:57',message:'POST: returning success',data:{},runId:'run1',hypothesisId:'A'});
    // #endregion
    return NextResponse.json({
      success: true,
      message: 'Проверьте вашу почту для подтверждения аккаунта',
    })
  } catch (error: any) {
    // #region agent log
    logDebug({location:'register/route.ts:64',message:'POST: outer catch error',data:{errorType:error?.constructor?.name,errorMessage:error instanceof Error?error.message:String(error),errorCode:error?.code,errorStack:error instanceof Error?error.stack:undefined},runId:'run1',hypothesisId:'A'});
    // #endregion
    console.error('[Register] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при регистрации' },
      { status: 500 }
    )
  }
}
