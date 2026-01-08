import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // #region agent log
  const logData = {location:'supabase/client.ts:3',message:'createClient called',data:{hasUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL,hasKey:!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,isClientSide:typeof window!=='undefined',nodeEnv:process.env.NODE_ENV,vercelEnv:process.env.VERCEL_ENV},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'};
  console.log('[DEBUG]', JSON.stringify(logData));
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
  }
  // #endregion
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // #region agent log
  const logData2 = {location:'supabase/client.ts:14',message:'After env var read',data:{supabaseUrl:supabaseUrl||null,hasKey:!!supabaseAnonKey,willCheckMissing:!(supabaseUrl&&supabaseAnonKey)},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'};
  console.log('[DEBUG]', JSON.stringify(logData2));
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
  }
  // #endregion

  // Only throw error on client-side (when actually needed), not during build/SSR
  // During build, if env vars are missing, we'll throw only when called client-side
  const isClientSide = typeof window !== 'undefined'
  const isBuildTime = typeof window === 'undefined' && process.env.NODE_ENV === 'production'
  
  // #region agent log
  const logData3 = {location:'supabase/client.ts:21',message:'Before missing env check',data:{isClientSide,isBuildTime,willThrow:!(supabaseUrl&&supabaseAnonKey)&&!isBuildTime&&isClientSide},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'};
  console.log('[DEBUG]', JSON.stringify(logData3));
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch(()=>{});
  }
  // #endregion
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // #region agent log
    const logData4 = {location:'supabase/client.ts:36',message:'Env vars missing - returning placeholder client',data:{isClientSide,isBuildTime},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H1'};
    console.log('[DEBUG]', JSON.stringify(logData4));
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData4)}).catch(()=>{});
    }
    // #endregion
    
    // Always return a placeholder client when env vars are missing (build time OR runtime)
    // This allows the app to work without Supabase configured - auth features just won't function
    // The placeholder client will fail gracefully when actually used
    console.warn('[Supabase] Environment variables missing. Supabase features will not function until vars are set.')
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }

  // #region agent log
  const logData6 = {location:'supabase/client.ts:51',message:'Creating browser client - env vars present',data:{hasUrl:!!supabaseUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'};
  console.log('[DEBUG]', JSON.stringify(logData6));
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData6)}).catch(()=>{});
  }
  // #endregion

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

