"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Zap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"

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
      <DialogContent className="sm:max-w-[540px] max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)] sm:w-full p-0 gap-0 rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-0">
          <div className="relative flex items-center mb-3">
            <Zap className="h-5 w-5 text-[#E6CC93] absolute left-0" />
            <DialogTitle className="text-xl font-normal tracking-tight text-center w-full">
              Есть проблема или идея?
            </DialogTitle>
          </div>
        </DialogHeader>
        
        {submitStatus === "success" ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 space-y-4">
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
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
            <div className="space-y-2">
              <Textarea
                id="feedback-message"
                placeholder="Опишите проблему или поделитесь идеей"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[120px] md:min-h-[140px] resize-none text-sm leading-relaxed transition-all focus:ring-2 focus:ring-[#E6CC93]/50 border-border/50"
                required
              />
            </div>

            {submitStatus === "error" && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 dark:bg-red-500/5 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                  Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.
                </p>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 px-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:min-w-[100px] order-2 sm:order-1"
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !message.trim()}
                className="w-full sm:w-auto sm:min-w-[120px] bg-[#E6CC93] hover:bg-[#E6CC93]/90 text-black font-medium order-1 sm:order-2"
                style={{ color: '#000000' }}
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
