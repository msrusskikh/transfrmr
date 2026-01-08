"use client"

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  // Only create client client-side, not during SSR/static generation
  useEffect(() => {
    // #region agent log
    const logData = {location:'contexts/AuthContext.tsx:22',message:'useEffect started',data:{isClientSide:typeof window!=='undefined',hasSupabaseRef:!!supabaseRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'};
    console.log('[DEBUG]', JSON.stringify(logData));
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    }
    // #endregion
    
    // Create client only on client-side
    if (typeof window !== 'undefined' && !supabaseRef.current) {
      // #region agent log
      const logData2 = {location:'contexts/AuthContext.tsx:30',message:'About to call createClient',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'};
      console.log('[DEBUG]', JSON.stringify(logData2));
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
      // #endregion
      
      try {
        supabaseRef.current = createClient()
        // #region agent log
        const logData3 = {location:'contexts/AuthContext.tsx:36',message:'createClient succeeded',data:{hasClient:!!supabaseRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'};
        console.log('[DEBUG]', JSON.stringify(logData3));
        fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch(()=>{});
        // #endregion
      } catch (error) {
        // #region agent log
        const logData4 = {location:'contexts/AuthContext.tsx:41',message:'createClient threw error',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'};
        console.log('[DEBUG]', JSON.stringify(logData4));
        fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData4)}).catch(()=>{});
        // #endregion
        console.error('[AuthContext] Failed to create Supabase client:', error)
        setLoading(false)
        return
      }
    }
    
    const supabase = supabaseRef.current
    if (!supabase) {
      // #region agent log
      const logData5 = {location:'contexts/AuthContext.tsx:50',message:'No supabase client - exiting',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'};
      console.log('[DEBUG]', JSON.stringify(logData5));
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData5)}).catch(()=>{});
      // #endregion
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // #region agent log
      const logData6 = {location:'contexts/AuthContext.tsx:58',message:'getSession completed',data:{hasSession:!!session},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'};
      console.log('[DEBUG]', JSON.stringify(logData6));
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData6)}).catch(()=>{});
      // #endregion
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((error) => {
      // #region agent log
      const logData7 = {location:'contexts/AuthContext.tsx:63',message:'getSession error',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'};
      console.log('[DEBUG]', JSON.stringify(logData7));
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData7)}).catch(()=>{});
      // #endregion
      console.error('[AuthContext] Failed to get session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (supabaseRef.current) {
      await supabaseRef.current.auth.signOut()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

