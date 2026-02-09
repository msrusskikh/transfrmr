import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/auth/validation'
import { createUser } from '@/lib/db/users'
import { sendVerificationEmail } from '@/lib/email'
import { getClientIP } from '@/lib/auth/rate-limit'

export async function POST(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/route.ts:7',message:'POST: entry',data:{hasBody:!!request.body},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  try {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/route.ts:10',message:'POST: parsing body',data:{},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const body = await request.json()
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/route.ts:13',message:'POST: body parsed',data:{hasEmail:!!body.email,hasPassword:!!body.password},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // Validate input
    const validationResult = registerSchema.safeParse(body)
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/route.ts:17',message:'POST: validation result',data:{success:validationResult.success,errorCount:validationResult.success?0:validationResult.error.issues.length},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/route.ts:28',message:'POST: calling createUser',data:{email:email?.substring(0,10)+'...'},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const existingUser = await createUser(email, password).catch(async (error) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/route.ts:30',message:'POST: createUser error caught',data:{errorCode:error?.code,errorMessage:error instanceof Error?error.message:String(error),errorName:error?.name,is23505:error?.code==='23505'},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // If unique constraint violation, user already exists
      if (error.code === '23505') {
        // Still return generic message to prevent email enumeration
        return null
      }
      throw error
    })
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/route.ts:36',message:'POST: createUser result',data:{hasUser:!!existingUser,userId:existingUser?.id},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/route.ts:47',message:'POST: sending email',data:{email:email?.substring(0,10)+'...',hasToken:!!existingUser.verificationToken},timestamp:Date.now(),runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    try {
      await sendVerificationEmail(email, existingUser.verificationToken)
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/route.ts:50',message:'POST: email sent successfully',data:{},timestamp:Date.now(),runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
    } catch (emailError) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/route.ts:52',message:'POST: email error caught',data:{errorType:emailError?.constructor?.name,errorMessage:emailError instanceof Error?emailError.message:String(emailError)},timestamp:Date.now(),runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      console.error('[Register] Failed to send verification email:', emailError)
      // Don't fail registration if email fails - user can request resend later
    }

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/route.ts:57',message:'POST: returning success',data:{},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return NextResponse.json({
      success: true,
      message: 'Проверьте вашу почту для подтверждения аккаунта',
    })
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/route.ts:64',message:'POST: outer catch error',data:{errorType:error?.constructor?.name,errorMessage:error instanceof Error?error.message:String(error),errorCode:error?.code,errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error('[Register] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при регистрации' },
      { status: 500 }
    )
  }
}
