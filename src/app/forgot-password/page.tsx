"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/lesson/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess("Если аккаунт существует, вы получите письмо со ссылкой для сброса пароля.")
      } else {
        // Even on error, keep message generic to avoid email enumeration
        setSuccess("Если аккаунт существует, вы получите письмо со ссылкой для сброса пароля.")
      }
    } catch (err: any) {
      // Generic error message
      setSuccess("Если аккаунт существует, вы получите письмо со ссылкой для сброса пароля.")
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
          <CardTitle className="text-2xl">Забыли пароль?</CardTitle>
          <CardDescription>
            Введите email, чтобы получить ссылку для сброса пароля
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md p-3">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-md p-3">
                {success}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Отправка..." : "Отправить ссылку для сброса"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Вернуться к входу
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

