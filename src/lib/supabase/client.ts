import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Only throw error on client-side (when actually needed), not during build/SSR
  // During build, if env vars are missing, we'll throw only when called client-side
  const isClientSide = typeof window !== 'undefined'
  const isBuildTime = typeof window === 'undefined' && process.env.NODE_ENV === 'production'
  
  if (!supabaseUrl || !supabaseAnonKey) {
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

