"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const COOKIE_CONSENT_KEY = "cookie-consent-dismissed"

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true")
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border/50 shadow-lg">
      <div className="container mx-auto px-4 min-[375px]:px-6 py-3 sm:py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 max-w-6xl mx-auto">
          <p className="text-sm text-muted-foreground text-center sm:text-left flex-1">
            Мы используем файлы cookies для авторизации и корректной работы сайта.  {" "}
            <Link
              href="/privacy-policy"
              className="text-primary hover:text-primary/80 underline underline-offset-3 transition-colors"
            >
              Подробнее
            </Link>
            
          </p>
          <Button
            onClick={handleDismiss}
            size="sm"
            className="min-h-[44px] sm:min-h-0 sm:h-8 px-6 touch-manipulation flex-shrink-0"
          >
            Хорошо
          </Button>
        </div>
      </div>
    </div>
  )
}
