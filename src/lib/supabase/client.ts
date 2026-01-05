import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // #region agent log
  const logData = {location:'supabase/client.ts:4',message:'createClient called',data:{hasUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL,hasKey:!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,isServer:typeof window==='undefined',isBuild:process.env.NODE_ENV==='production'&&!process.env.VERCEL_ENV,nodeEnv:process.env.NODE_ENV,vercelEnv:process.env.VERCEL_ENV},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'};
  console.log('[DEBUG]', JSON.stringify(logData));
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
  }
  // #endregion
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // #region agent log
  const logData2 = {location:'supabase/client.ts:13',message:'Before env var check',data:{supabaseUrl:supabaseUrl||null,supabaseAnonKey:supabaseAnonKey?`${supabaseAnonKey.substring(0,10)}...`:null},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'};
  console.log('[DEBUG]', JSON.stringify(logData2));
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
  }
  // #endregion

  // Only throw error on client-side (when actually needed), not during build/SSR
  // During build, if env vars are missing, we'll throw only when called client-side
  const isClientSide = typeof window !== 'undefined'
  const isBuildTime = typeof window === 'undefined' && process.env.NODE_ENV === 'production'
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // #region agent log
    const callStack = typeof Error !== 'undefined' ? new Error().stack?.split('\n').slice(0,5).join('|') : 'N/A';
    const logData3 = {location:'supabase/client.ts:25',message:'Env vars missing',data:{callStack,isClientSide,isBuildTime,willThrow:isClientSide||!isBuildTime},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'};
    console.log('[DEBUG]', JSON.stringify(logData3));
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch(()=>{});
    }
    // #endregion
    
    // During build time (server-side, production), if env vars are missing, 
    // don't throw - allow build to continue. The error will surface client-side if actually used.
    if (isBuildTime && !isClientSide) {
      // Return a mock client that will fail gracefully when actually used
      // This allows the build to succeed even if env vars aren't set on Vercel
      console.warn('[Supabase] Environment variables missing during build. Client will not function until vars are set.')
      return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
    }
    
    // On client-side, throw the error as normal
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file contains:\n' +
      'NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

