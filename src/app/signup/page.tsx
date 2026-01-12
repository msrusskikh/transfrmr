"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lesson/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, Mail } from 'lucide-react'
import type { SupabaseClient } from '@supabase/supabase-js'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  // Check for payment access token on page load
  useEffect(() => {
    const checkAccessToken = async () => {
      try {
        const response = await fetch('/api/payment/check-access-token')
        const data = await response.json()

        if (!data.valid) {
          // No valid access token - redirect to home page
          router.replace('/')
          return
        }

        // Token is valid - allow access
        setCheckingAccess(false)
      } catch (error) {
        console.error('Error checking access token:', error)
        // On error, redirect to home page for security
        router.replace('/')
      }
    }

    checkAccessToken()
  }, [router])

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Check if Supabase is configured before attempting signup
    if (!isSupabaseConfigured()) {
      setError('Supabase не настроен. Пожалуйста, настройте переменные окружения NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY на Vercel.')
      return
    }

    if (!supabaseRef.current) {
      setError('Supabase client не инициализирован. Пожалуйста, обновите страницу.')
      return
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabaseRef.current.auth.signUp({
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
        } else if (error.message.includes('email')) {
          setError('Этот email уже зарегистрирован или неверный формат.')
        } else {
          setError(error.message || 'Произошла ошибка при регистрации')
        }
        return
      }

      // Show success dialog with email confirmation instructions
      setShowSuccessDialog(true)
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
        setError(error.message || 'Произошла ошибка при регистрации')
      }
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking access token
  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Загрузка...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>
            Создайте аккаунт для доступа к курсу
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
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
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md p-3">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Уже есть аккаунт? </span>
            <Link href="/login" className="text-primary hover:underline">
              Войти
            </Link>
          </div>
          <div className="mt-2 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Вернуться на главную
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Регистрация успешна!
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Мы отправили письмо с подтверждением на <strong>{email}</strong>.
              Пожалуйста, проверьте почту и перейдите по ссылке для активации аккаунта.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Что делать дальше:</p>
                  <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                    <li>Проверьте почту (включая папку "Спам")</li>
                    <li>Нажмите на ссылку подтверждения в письме</li>
                    <li>Вернитесь на сайт и войдите в аккаунт</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false)
                router.push('/login')
              }}
              className="w-full sm:w-auto"
            >
              Перейти к входу
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false)
                router.push('/')
              }}
              className="w-full sm:w-auto"
            >
              На главную
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

