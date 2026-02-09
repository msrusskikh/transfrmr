import { NextRequest, NextResponse } from 'next/server'
import { findUserByVerificationToken, verifyUserEmail } from '@/lib/db/users'

export async function GET(request: NextRequest) {
  // Use APP_URL (runtime) first, fallback to NEXT_PUBLIC_APP_URL (build-time), then derive from request
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || request.url.split('/api')[0]
  // #region agent log
  console.log('[DEBUG] verify-email route entry:', { requestUrl: request.url, requestHost: new URL(request.url).host, baseUrl, APP_URL: process.env.APP_URL, NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL })
  fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/api/auth/verify-email/route.ts:4',message:'verify-email route entry',data:{requestUrl:request.url,requestHost:new URL(request.url).host,baseUrl,APP_URL:process.env.APP_URL,NEXT_PUBLIC_APP_URL:process.env.NEXT_PUBLIC_APP_URL},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    // #region agent log
    console.log('[DEBUG] token extracted:', { hasToken: !!token, tokenLength: token?.length })
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/api/auth/verify-email/route.ts:8',message:'token extracted',data:{hasToken:!!token,tokenLength:token?.length},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    if (!token) {
      const redirectUrl = `${baseUrl}/login?error=invalid_token`
      // #region agent log
      console.log('[DEBUG] redirect no token:', { redirectUrl, isLocalhost: redirectUrl.includes('localhost'), baseUrl })
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/api/auth/verify-email/route.ts:12',message:'redirect no token',data:{redirectUrl,isLocalhost:redirectUrl.includes('localhost'),baseUrl},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return NextResponse.redirect(redirectUrl)
    }

    // Find user by verification token
    const user = await findUserByVerificationToken(token)
    // #region agent log
    console.log('[DEBUG] user lookup result:', { userFound: !!user, userId: user?.id })
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/api/auth/verify-email/route.ts:20',message:'user lookup result',data:{userFound:!!user,userId:user?.id},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    if (!user) {
      const redirectUrl = `${baseUrl}/login?error=invalid_or_expired_token`
      // #region agent log
      console.log('[DEBUG] redirect invalid token:', { redirectUrl, isLocalhost: redirectUrl.includes('localhost'), requestUrl: request.url, baseUrl })
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/api/auth/verify-email/route.ts:22',message:'redirect invalid token',data:{redirectUrl,isLocalhost:redirectUrl.includes('localhost'),requestUrl:request.url,baseUrl},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return NextResponse.redirect(redirectUrl)
    }

    // Verify email
    await verifyUserEmail(user.id)

    // Redirect to login with success message
    const successRedirectUrl = `${baseUrl}/login?verified=true`
    // #region agent log
    console.log('[DEBUG] redirect success:', { successRedirectUrl, isLocalhost: successRedirectUrl.includes('localhost'), baseUrl })
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/api/auth/verify-email/route.ts:30',message:'redirect success',data:{successRedirectUrl,isLocalhost:successRedirectUrl.includes('localhost'),baseUrl},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return NextResponse.redirect(successRedirectUrl)
  } catch (error) {
    console.error('[VerifyEmail] Error:', error)
    const errorRedirectUrl = `${baseUrl}/login?error=verification_failed`
    // #region agent log
    console.log('[DEBUG] redirect error:', { errorRedirectUrl, isLocalhost: errorRedirectUrl.includes('localhost'), errorMessage: error instanceof Error ? error.message : 'unknown', baseUrl })
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/api/auth/verify-email/route.ts:35',message:'redirect error',data:{errorRedirectUrl,isLocalhost:errorRedirectUrl.includes('localhost'),errorMessage:error instanceof Error?error.message:'unknown',baseUrl},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return NextResponse.redirect(errorRedirectUrl)
  }
}
