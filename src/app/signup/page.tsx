"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
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

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const router = useRouter()
  const { register } = useAuth()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов')
      return
    }

    // Check password requirements
    if (!/[A-Z]/.test(password)) {
      setError('Пароль должен содержать хотя бы одну заглавную букву')
      return
    }

    if (!/[0-9]/.test(password)) {
      setError('Пароль должен содержать хотя бы одну цифру')
      return
    }

    setLoading(true)

    try {
      const result = await register(email, password)

      if (result.success) {
        // Show success dialog with email confirmation instructions
        setShowSuccessDialog(true)
      } else {
        setError(result.error || 'Произошла ошибка при регистрации')
      }
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Logo and Title - positioned absolutely above the card */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-[calc(50%+1.25rem)] -translate-y-[calc(50%+20rem)] flex items-center space-x-3">
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
                minLength={8}
              />
              <p className="text-xs text-muted-foreground-override">
                Минимум 8 символов, 1 заглавная буква, 1 цифра
              </p>
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
                minLength={8}
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
