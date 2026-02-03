"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/lesson/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  // Check for query params
  const verified = searchParams?.get('verified')
  const redirect = searchParams?.get('redirect')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        // Redirect to original destination or /learn
        router.push(redirect || '/learn')
        router.refresh()
      } else {
        setError(result.error || 'Произошла ошибка при входе')
      }
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Logo and Title - positioned absolutely above the card */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-[calc(50%+1.25rem)] -translate-y-[calc(50%+19rem)] flex items-center space-x-3">
        <Image 
          src="/logo.svg" 
          alt="Трансформер" 
          width={32} 
          height={32}
          className="object-contain"
        />
        <h1 className="text-[1.4625rem] font-semibold text-foreground">Трансформер</h1>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>
            Войдите в свой аккаунт для доступа к курсу
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verified && (
            <div className="mb-4 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-md p-3">
              Email успешно подтвержден! Теперь вы можете войти.
            </div>
          )}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs !text-muted-foreground hover:!text-muted-foreground hover:underline"
                >
                  Забыли пароль?
                </Link>
              </div>
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
