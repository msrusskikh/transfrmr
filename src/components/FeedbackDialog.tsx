"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Zap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { getLesson, getModule } from "@/lib/content"

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const pathname = usePathname()
  const { user } = useAuth()

  // Get page/lesson name from pathname
  const getPageName = () => {
    if (!pathname) return null
    
    // Check for exact /learn page first
    if (pathname === '/learn') {
      return "Главная страница"
    }
    
    if (pathname.startsWith('/learn/')) {
      const pathParts = pathname.split('/').filter(Boolean)
      if (pathParts.length >= 3) {
        // Lesson page: /learn/[module]/[section]
        const moduleId = parseInt(pathParts[1])
        const sectionId = parseInt(pathParts[2])
        const lesson = getLesson(moduleId, sectionId)
        return lesson?.title || null
      } else if (pathParts.length === 2) {
        // Module page: /learn/[module]
        const moduleId = parseInt(pathParts[1])
        const module = getModule(moduleId)
        return module?.title || null
      }
    }
    
    // For other pages, return a friendly name
    const pageNames: Record<string, string> = {
      '/': 'Главная',
      '/login': 'Вход',
      '/signup': 'Регистрация',
      '/pitch': 'О курсе',
      '/privacy-policy': 'Политика конфиденциальности',
      '/oferta': 'Оферта',
    }
    
    return pageNames[pathname] || pathname
  }

  const pageName = getPageName()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
          context: {
            url: typeof window !== "undefined" ? window.location.href : "",
            pathname: pathname,
            timestamp: new Date().toISOString(),
          },
          userEmail: user?.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      setSubmitStatus("success")
      setMessage("")
      
      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false)
        setSubmitStatus("idle")
      }, 2000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage("")
      setSubmitStatus("idle")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6CC93]/20">
              <Zap className="h-5 w-5 text-[#E6CC93]" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Есть проблема или идея?
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-base leading-relaxed text-muted-foreground">
            Поделитесь своим опытом. Ваш отзыв поможет нам улучшить курс.
          </DialogDescription>
        </DialogHeader>
        
        {submitStatus === "success" ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 dark:bg-green-500/20">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                Спасибо за ваш отзыв!
              </p>
              <p className="text-sm text-muted-foreground">
                Мы ценим ваше мнение и обязательно учтем его.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label 
                htmlFor="feedback-message" 
                className="text-sm font-medium text-foreground"
              >
                Ваше сообщение
              </Label>
              <Textarea
                id="feedback-message"
                placeholder="Опишите проблему или поделитесь идеей..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[140px] resize-none text-base leading-relaxed transition-all focus:ring-2 focus:ring-[#E6CC93]/50"
                required
              />
              {pageName && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40"></span>
                  {pageName}
                </div>
              )}
            </div>

            {submitStatus === "error" && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 dark:bg-red-500/5 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.
                </p>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !message.trim()}
                className="min-w-[120px] bg-[#E6CC93] hover:bg-[#E6CC93]/90 text-gray-900 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  "Отправить"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
