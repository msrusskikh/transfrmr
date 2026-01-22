import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // #region agent log
  const fs = await import('fs').catch(() => null);
  const logPath = '/Users/maxrusskikh/Desktop/Трансформер/Dev/transfrmr/.cursor/debug.log';
  try {
    if (fs) {
      fs.appendFileSync(logPath, JSON.stringify({location:'middleware.ts:4',message:'Middleware called',data:{pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})+'\n');
    }
  } catch {}
  // #endregion
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If environment variables are missing, skip auth check and allow request to continue
  // This prevents crashes when Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase Middleware] Environment variables missing. Skipping auth check.')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it so that users
  // need to sign in again.

  try {
    // #region agent log
    try {
      if (fs) {
        fs.appendFileSync(logPath, JSON.stringify({location:'middleware.ts:45',message:'About to call getUser',data:{pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})+'\n');
      }
    } catch {}
    // #endregion
    const {
      data: { user },
    } = await supabase.auth.getUser()
    // #region agent log
    try {
      if (fs) {
        fs.appendFileSync(logPath, JSON.stringify({location:'middleware.ts:49',message:'getUser completed',data:{hasUser:!!user,pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})+'\n');
      }
    } catch {}
    // #endregion

    if (
      !user &&
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/signup') &&
      !request.nextUrl.pathname.startsWith('/api') &&
      request.nextUrl.pathname.startsWith('/learn')
    ) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } catch (error: any) {
    // #region agent log
    try {
      if (fs) {
        fs.appendFileSync(logPath, JSON.stringify({location:'middleware.ts:62',message:'Middleware error caught',data:{error:error?.message,pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})+'\n');
      }
    } catch {}
    // #endregion
    // If there's an error with Supabase (e.g., network issues), log it and continue
    // This prevents the middleware from crashing the entire application
    console.error('[Supabase Middleware] Error checking user session:', error)
    // Continue with the request without redirecting
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse
}

