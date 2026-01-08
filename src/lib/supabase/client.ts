import { createBrowserClient } from '@supabase/ssr'

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  )
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Always return a placeholder client when env vars are missing (build time OR runtime)
    // This allows the app to work without Supabase configured - auth features just won't function
    // The placeholder client will fail gracefully when actually used
    console.warn('[Supabase] Environment variables missing. Supabase features will not function until vars are set.')
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

