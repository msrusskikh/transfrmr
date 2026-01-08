"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lesson/card'
import type { SupabaseClient } from '@supabase/supabase-js'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  // Defer client creation to client-side only
  useEffect(() => {
    if (typeof window !== 'undefined' && !supabaseRef.current) {
      supabaseRef.current = createClient()
      
      // Check if Supabase is not configured
      if (!isSupabaseConfigured()) {
        setError('Supabase не настроен. Пожалуйста, настройте переменные окружения NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY на Vercel.')
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if Supabase is configured before attempting login
    if (!isSupabaseConfigured()) {
      setError('Supabase не настроен. Пожалуйста, настройте переменные окружения NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY на Vercel.')
      return
    }
    
    if (!supabaseRef.current) {
      setError('Supabase client не инициализирован. Пожалуйста, обновите страницу.')
      return
    }
    
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabaseRef.current.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Provide more helpful error messages
        if (error.message.includes('Invalid API key') || 
            error.message.includes('JWT') || 
            error.message.includes('Failed to fetch') || 
            error.message.includes('Load failed') ||
            error.message.includes('NetworkError') ||
            error.message.includes('fetch')) {
          setError('Supabase не настроен или недоступен. Проверьте настройки переменных окружения NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY на Vercel.')
        } else if (error.message.includes('Invalid login') || error.message.includes('Invalid credentials')) {
          setError('Неверный email или пароль.')
        } else {
          setError(error.message || 'Произошла ошибка при входе')
        }
        return
      }

      router.push('/learn')
      router.refresh()
    } catch (error: any) {
      // Handle network errors or placeholder client errors
      if (error.message?.includes('Missing Supabase') || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Load failed') ||
          error.message?.includes('NetworkError') ||
          error.message?.includes('fetch') ||
          error.name === 'TypeError' ||
          (error.message && typeof error.message === 'string' && error.message.toLowerCase().includes('load'))) {
        setError('Supabase не настроен или недоступен. Проверьте настройки переменных окружения NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY на Vercel.')
      } else {
        setError(error.message || 'Произошла ошибка при входе')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>
            Войдите в свой аккаунт для доступа к курсу
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md p-3">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Нет аккаунта? </span>
            <Link href="/signup" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </div>
          <div className="mt-2 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Вернуться на главную
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

