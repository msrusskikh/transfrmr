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

  // Check auth on mount
  useEffect(() => {
    checkAuth()
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
