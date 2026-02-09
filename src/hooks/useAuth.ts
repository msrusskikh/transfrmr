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
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      return { success: data.success, error: data.error }
    } catch (error) {
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
