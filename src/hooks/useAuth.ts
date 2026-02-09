import { create } from 'zustand'
import { useEffect } from 'react'

interface User {
  id: string
  email: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success) {
        set({ user: data.user })
        return { success: true }
      }
      return { success: false, error: data.error || 'Ошибка при входе' }
    } catch (error) {
      console.error('[useAuth] Login error:', error)
      return { success: false, error: 'Произошла ошибка при входе' }
    }
  },

  register: async (email, password) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.ts:41',message:'register: entry',data:{email:email?.substring(0,10)+'...',hasPassword:!!password},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.ts:44',message:'register: fetch start',data:{url:'/api/auth/register'},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.ts:50',message:'register: fetch response',data:{status:res.status,statusText:res.statusText,ok:res.ok,contentType:res.headers.get('content-type')},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const data = await res.json()
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.ts:53',message:'register: response parsed',data:{success:data.success,hasError:!!data.error,error:data.error},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return { success: data.success, error: data.error }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.ts:56',message:'register: catch error',data:{errorType:error?.constructor?.name,errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('[useAuth] Register error:', error)
      return { success: false, error: 'Произошла ошибка при регистрации' }
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      set({ user: null })
    } catch (error) {
      console.error('[useAuth] Logout error:', error)
      // Still clear user state even if request fails
      set({ user: null })
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        set({ user: data.user })
      } else {
        set({ user: null })
      }
    } catch (error) {
      console.error('[useAuth] Check auth error:', error)
      set({ user: null })
    } finally {
      set({ isLoading: false })
    }
  },
}))

/**
 * Hook to automatically check auth on mount
 */
export function useAuthWithCheck() {
  const { checkAuth, isLoading, user } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return { isLoading, user }
}
