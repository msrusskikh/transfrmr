"use client"

import { createContext, useContext, useEffect } from 'react'
import { useAuth as useAuthStore } from '@/hooks/useAuth'

interface AuthContextType {
  user: { id: string; email: string } | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout, checkAuth } = useAuthStore()

  // Check auth on mount with timeout protection
  useEffect(() => {
    let mounted = true
    
    // Set a timeout to stop loading if auth check takes too long
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('[AuthProvider] Auth check timeout - proceeding without auth')
        // Don't block rendering if auth check is slow
      }
    }, 5000) // 5 second timeout
    
    // Run auth check with error handling
    checkAuth().catch((error) => {
      console.error('[AuthProvider] Auth check failed:', error)
      // Don't block rendering on auth failure
    }).finally(() => {
      clearTimeout(timeoutId)
    })
    
    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [checkAuth])

  const signOut = async () => {
    await logout()
  }

  return (
    <AuthContext.Provider value={{ user, loading: isLoading, signOut }}>
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
