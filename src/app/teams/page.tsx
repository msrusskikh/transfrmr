"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/lesson/card"
import { useProgressStore } from "@/lib/progress"
import { modules } from "@/lib/content"
import { useEffect, useState, Suspense, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import {
  User,
  LogOut,
  LogIn,
  Sparkles,
  Clock,
  Target,
  Gamepad2,
  Briefcase,
  Smartphone,
  Brain,
  MessageSquare,
  Wrench,
  Lightbulb,
  AlertCircle,
  Shield,
  TrendingUp,
  ChevronDown,
  CheckCircle2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CookieBanner } from "@/components/CookieBanner"

// Course Module Card Component
function CourseModuleCard({ module }: { module: { title: string; description: string; icon: React.ComponentType<{ className?: string }> } }) {
  const [isOpen, setIsOpen] = useState(false)
  const Icon = module.icon

  return (
    <Card
      className="cursor-pointer touch-manipulation min-h-[44px] rounded-3xl border transition-colors"
      style={{ borderColor: "#e3e3de", backgroundColor: isOpen ? "#f3f3ef" : "#fbfbf9" }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 border" style={{ borderColor: "#e0e0db", backgroundColor: "#f4f4f1" }}>
              <Icon className="h-5 w-5 text-[#252525]" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg mb-2" style={{ color: "#171717" }}>{module.title}</CardTitle>
              {isOpen && (
                <div className="leading-relaxed text-base mt-2 whitespace-pre-line" style={{ color: "#5f5f59" }}>
                  {module.description}
                </div>
              )}
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`} style={{ color: "#6b6b64" }} />
        </div>
      </CardHeader>
    </Card>
  )
}

// Payment callback handler component (needs Suspense boundary for useSearchParams)
function PaymentCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verificationState, setVerificationState] = useState<"verifying" | "error" | "success" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showRetry, setShowRetry] = useState(false)
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingStartTimeRef = useRef<number | null>(null)
  const maxPollingTime = 30000 // 30 seconds max polling

  // Handle payment callback query parameters
  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    const orderId = searchParams.get("id") // Primary identification from URL

    const hasSuccess = success !== null

    if (hasSuccess && orderId) {
      setVerificationState("verifying")
      pollingStartTimeRef.current = Date.now()
      verifyPayment(orderId)
    } else if (error && orderId) {
      // Payment failed - user already saw notification on payment processor side
      // Just clean up the URL by removing query params
      router.replace("/")
    }

    // Cleanup polling timeout on unmount
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
      }
    }
  }, [searchParams, router])

  const verifyPayment = async (orderId: string) => {
    // Check if we've exceeded max polling time
    if (pollingStartTimeRef.current) {
      const elapsed = Date.now() - pollingStartTimeRef.current
      if (elapsed > maxPollingTime) {
        setVerificationState("error")
        setErrorMessage('Проверка не удалась. Попробуйте обновить страницу через несколько минут или нажмите "Проверить снова".')
        setShowRetry(true)
        return
      }
    }

    try {
      const response = await fetch(`/api/payment/verify?order_id=${encodeURIComponent(orderId)}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Verification failed")
      }

      const data = await response.json()

      if (data.status === "succeeded") {
        // Payment verified - set access token and redirect to signup
        try {
          const tokenResponse = await fetch("/api/payment/set-access-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId }),
          })

          if (tokenResponse.ok) {
            setVerificationState("success")
            // Remove query params and redirect to signup
            setTimeout(() => {
              router.replace("/signup")
            }, 500)
          } else {
            throw new Error("Failed to set access token")
          }
        } catch (error) {
          console.error("Error setting access token:", error)
          setVerificationState("error")
          setErrorMessage("Ошибка при установке токена доступа")
          setShowRetry(true)
        }
      } else if (data.status === "pending") {
        // Payment still pending - poll again (max 30 seconds)
        pollingTimeoutRef.current = setTimeout(() => {
          verifyPayment(orderId)
        }, 2000) // Poll every 2 seconds
      } else if (data.status === "failed" || data.status === "canceled") {
        // Payment failed or canceled
        setVerificationState("error")
        setErrorMessage("Оплата не прошла. Попробуйте еще раз.")
      } else {
        // Unknown status - retry
        setVerificationState("error")
        setErrorMessage("Неизвестный статус оплаты")
        setShowRetry(true)
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
      setVerificationState("error")
      setErrorMessage('Проверка не удалась. Попробуйте обновить страницу через несколько минут или нажмите "Проверить снова".')
      setShowRetry(true)
    }
  }

  const handleRetry = () => {
    const orderId = searchParams.get("id") || localStorage.getItem("payment_order_id")
    if (orderId) {
      setVerificationState("verifying")
      setErrorMessage(null)
      setShowRetry(false)
      pollingStartTimeRef.current = Date.now()
      verifyPayment(orderId)
    }
  }

  // Show verification overlay
  if (verificationState === "verifying") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="text-center space-y-4 px-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="text-lg font-medium text-foreground">Проверка оплаты...</p>
        </div>
      </div>
    )
  }

  if (verificationState === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="text-center space-y-4 px-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-lg font-medium text-foreground">{errorMessage}</p>
          {showRetry && (
            <Button onClick={handleRetry} className="mt-4">
              Проверить снова
            </Button>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default function HomePage() {
  const { completedSections, currentModule, currentSection, isDevMode } = useProgressStore()
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

  // Force dark theme on mount
  useEffect(() => {
    document.documentElement.classList.add("dark")
    localStorage.setItem("theme", "dark")
  }, [])

  // Fire Metrica goal when at least 50% of pricing section is visible
  useEffect(() => {
    const el = document.getElementById("pricing-section")
    if (!el || typeof window === "undefined") return
    const ym = (window as unknown as { ym?: (id: number, goal: string, name: string) => void }).ym
    if (typeof ym !== "function") return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            ym(106758513, "reachGoal", "pricing_view")
            observer.disconnect()
            return
          }
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleSignOut = async () => {
    // Navigate immediately for instant feedback
    router.push("/")
    // Sign out in the background - don't block navigation
    signOut().catch((error) => {
      console.error("Error signing out:", error)
    })
  }

  // Function to get current lesson title
  const getCurrentLessonTitle = () => {
    if (currentModule === 0 || currentSection === 0) {
      return "Начало обучения"
    }

    const module = modules.find((m) => m.id === currentModule)
    if (!module) {
      return "Модуль не найден"
    }

    const section = module.sections.find((s) => s.section === currentSection)
    if (!section) {
      return "Урок не найден"
    }

    return section.title
  }

  // Check if user has any progress to continue from
  const hasProgress = completedSections.size > 0 || currentModule > 1 || currentSection > 1

  // Calculate overall progress
  const totalSections = 50 // Total sections across all modules
  const progressPercentage = Math.round((completedSections.size / totalSections) * 100)

  // Determine the best destination for "Continue Learning"
  const getContinueDestination = () => {
    // Debug logging
    console.log("Completed sections:", Array.from(completedSections))
    console.log("Total completed:", completedSections.size)

    // Find the first incomplete lesson (same logic as learn page)
    for (const module of modules) {
      for (const section of module.sections) {
        const key = `${module.id}-${section.section}`
        if (!completedSections.has(key)) {
          console.log("Next incomplete lesson:", `${module.id}-${section.section}`)
          return `/learn/${module.id}/${section.section}`
        }
      }
    }

    // If all lessons are completed, go to the learn page
    console.log("All lessons completed, going to /learn")
    return `/learn`
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F7F4", color: "#171717" }}>
      {/* Payment callback handler wrapped in Suspense */}
      <Suspense fallback={null}>
        <PaymentCallbackHandler />
      </Suspense>

      {/* Header with Трансформер text */}
      <header
        className="sticky top-0 z-40 w-full border-b backdrop-blur"
        style={{
          borderColor: "#e6e6e1",
          backgroundColor: "rgba(247,247,244,0.9)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="container mx-auto flex h-14 items-center px-4 justify-between">
          <Link href="/learn" className="hover:opacity-80 transition-opacity">
            <div className="flex items-center space-x-2">
              <Image src="/transformer-logo.svg" alt="Трансформер" width={24} height={24} className="object-contain" />
              <h1 className="text-[19px] font-semibold" style={{ color: "#171717" }}>
                Трансформер
              </h1>
            </div>
          </Link>
          {/* Authentication UI */}
          {!authLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer border" style={{ borderColor: "#e0e0db", backgroundColor: "#f4f4f1" }}>
                      <User className="h-4 w-4" style={{ color: "#5f5f59" }} />
                      <span className="hidden md:inline text-xs truncate max-w-[120px]" style={{ color: "#171717" }}>
                        {user.email}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Выйти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" className="text-inherit">
                  <span
                    className="inline-flex items-center h-9 px-3 rounded-md transition-all duration-200 border"
                    style={{ borderColor: "#d8d8d2", color: "#3f3f3a", backgroundColor: "#f4f4f1" }}
                  >
                    <LogIn className="h-4 w-4 mr-2" style={{ color: "#3f3f3a" }} />
                    <span className="text-xs" style={{ color: "#3f3f3a" }}>Войти</span>
                  </span>
                </Link>
              )}
            </>
          )}
        </div>
      </header>

      {/* Main Content - flex-grow to push footer down */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 min-[375px]:px-6 py-12 min-[768px]:py-20 min-[1024px]:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-6 min-[768px]:space-y-8">
            <span
              className="inline-block px-4 py-2 rounded-lg text-base font-medium border bg-transparent"
              style={{ borderColor: "#d8d8d2", color: "#7a7a74" }}
            >
              ИИ для работы
            </span>
            <h1 className="text-3xl min-[375px]:text-4xl min-[768px]:text-5xl min-[1024px]:text-6xl font-semibold tracking-tight leading-tight" style={{ color: "#171717" }}>
              Начните пользоваться ИИ легко и уверенно
            </h1>
            <p className="text-base min-[375px]:text-lg min-[768px]:text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: "#5f5f59" }}>
            Короткий текстовый курс по основам ИИ. Всё необходимое, чтобы с нуля начать применять ИИ в работе — просто, практично и без перегруза
            </p>

            {/* Hero Image */}
            <div className="flex items-center justify-center py-6 min-[768px]:py-8">
              <div className="relative w-full max-w-[256px] min-[375px]:max-w-[280px] min-[430px]:max-w-[320px] min-[768px]:w-80 min-[768px]:max-w-none aspect-[4/3]">
                <img
                  src="/e325def114bcf010422765381c83c248f307c2719ffc3c56a5b284a53cfc5a79.png"
                  alt="Team collaboration"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  width={320}
                  height={240}
                />
              </div>
            </div>

            {/* Progress Indicator - Only show when user is logged in */}
            {!authLoading && user && hasProgress && (
              <div className="rounded-3xl p-6 min-[768px]:p-7 max-w-lg mx-auto border shadow-[0_8px_24px_rgba(0,0,0,0.04)]" style={{ borderColor: "#e3e3de", backgroundColor: "#fbfbf9" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-medium" style={{ color: "#171717" }}>Ваш прогресс</span>
                  <span className="text-2xl font-bold" style={{ color: "#171717" }}>{progressPercentage}%</span>
                </div>
                <div className="w-full rounded-full h-2 mb-4" style={{ backgroundColor: "#ecece7" }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%`, backgroundColor: "#171717" }}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-base" style={{ color: "#5f5f59" }}>
                    {completedSections.size} из {totalSections} уроков завершено
                  </p>
                  <p className="text-base font-medium" style={{ color: "#171717" }}>
                    Ваш текущий урок: {getCurrentLessonTitle()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-5 pt-6">
              {!authLoading && user ? (
                <Link
                  href={getContinueDestination()}
                  className="inline-flex items-center justify-center min-h-[44px] shadow-sm px-6 min-[768px]:px-8 touch-manipulation rounded-md text-base font-medium"
                  style={{ border: "1px solid #171717", backgroundColor: "#171717", color: "#ffffff" }}
                >
                    Продолжить обучение
                </Link>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center justify-center min-h-[44px] shadow-sm px-6 min-[768px]:px-8 touch-manipulation rounded-md text-base font-medium"
                  style={{ border: "1px solid #171717", backgroundColor: "#171717", color: "#ffffff" }}
                  onClick={() => {
                    if (typeof window !== "undefined" && typeof (window as unknown as { ym?: (id: number, goal: string, name: string) => void }).ym === "function") {
                      (window as unknown as { ym: (id: number, goal: string, name: string) => void }).ym(106758513, "reachGoal", "start_course_hero_click")
                    }
                    const pricingSection = document.getElementById("pricing-section")
                    if (pricingSection) {
                      pricingSection.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                  }}
                >
                  Начать обучение
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 min-[375px]:px-6 py-12 min-[768px]:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="transition-colors touch-manipulation rounded-3xl border" style={{ borderColor: "#e3e3de", backgroundColor: "#fbfbf9" }}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-4" style={{ borderColor: "#e0e0db", backgroundColor: "#f4f4f1" }}>
                    <Sparkles className="h-6 w-6" style={{ color: "#252525" }} />
                  </div>
                  <CardTitle className="text-xl" style={{ color: "#171717" }}>С нуля, без стресса</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed" style={{ color: "#5f5f59" }}>
                    Не нужно ничего знать про ИИ или промпты — начнём с самых простых шагов
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="transition-colors touch-manipulation rounded-3xl border" style={{ borderColor: "#e3e3de", backgroundColor: "#fbfbf9" }}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-4" style={{ borderColor: "#e0e0db", backgroundColor: "#f4f4f1" }}>
                    <Clock className="h-6 w-6" style={{ color: "#252525" }} />
                  </div>
                  <CardTitle className="text-xl" style={{ color: "#171717" }}>В своём ритме</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed" style={{ color: "#5f5f59" }}>
                    Мини-уроки по 3-5 минут. Можно идти постепенно или пройти интенсивом за выходные
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="transition-colors touch-manipulation rounded-3xl border" style={{ borderColor: "#e3e3de", backgroundColor: "#fbfbf9" }}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-4" style={{ borderColor: "#e0e0db", backgroundColor: "#f4f4f1" }}>
                    <Target className="h-6 w-6" style={{ color: "#252525" }} />
                  </div>
                  <CardTitle className="text-xl" style={{ color: "#171717" }}>Практика в лабораторных</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed" style={{ color: "#5f5f59" }}>
                    В конце каждого модуля — лабораторная работа и короткий тест, чтобы закрепить навыки
                  </p>
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="transition-colors touch-manipulation rounded-3xl border" style={{ borderColor: "#e3e3de", backgroundColor: "#fbfbf9" }}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-4" style={{ borderColor: "#e0e0db", backgroundColor: "#f4f4f1" }}>
                    <Briefcase className="h-6 w-6" style={{ color: "#252525" }} />
                  </div>
                  <CardTitle className="text-xl" style={{ color: "#171717" }}>Всё по делу</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed" style={{ color: "#5f5f59" }}>
                  Только то, что действительно нужно в работе: инструменты, сценарии, практика и этика
                  </p>
                </CardContent>
              </Card>

              {/* Feature 5 */}
              <Card className="transition-colors touch-manipulation rounded-3xl border" style={{ borderColor: "#e3e3de", backgroundColor: "#fbfbf9" }}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-4" style={{ borderColor: "#e0e0db", backgroundColor: "#f4f4f1" }}>
                    <Smartphone className="h-6 w-6" style={{ color: "#252525" }} />
                  </div>
                  <CardTitle className="text-xl" style={{ color: "#171717" }}>Всегда под рукой</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed" style={{ color: "#5f5f59" }}>
                  Платформа адаптирована под телефон. Учитесь где удобно — в дороге, в очереди или дома
                  </p>
                </CardContent>
              </Card>

              {/* Feature 6 */}
              <Card className="transition-colors touch-manipulation rounded-3xl border" style={{ borderColor: "#e3e3de", backgroundColor: "#fbfbf9" }}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-4" style={{ borderColor: "#e0e0db", backgroundColor: "#f4f4f1" }}>
                    <Gamepad2 className="h-6 w-6" style={{ color: "#252525" }} />
                  </div>
                  <CardTitle className="text-xl" style={{ color: "#171717" }}>Доступ навсегда</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed" style={{ color: "#5f5f59" }}>
                    Пожизненный доступ и регулярные обновления. Можно возвращаться в любой момент, чтобы освежить знания
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Course Content Section */}
        <section className="container mx-auto px-4 min-[375px]:px-6 py-12 min-[768px]:py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12" style={{ color: "#171717" }}>
              Про что расскажем
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "Мышление и основы ИИ",
                  description: "Поймёте, как устроены современные ИИ-ассистенты:\n• что они умеют и чего не умеют\n• их сильные и слабые стороны\n• цикл работы: «черновик → проверка → правки»\n",
                  icon: Brain
                },
                {
                  title: "Искусство промптинга",
                  description: "Освоите структуру сильных запросов:\n«Роль → Цель → Шаги → Ограничения → Критерий качества»\n• 5 базовых шаблонов\n• многошаговые цепочки запросов",
                  icon: MessageSquare
                },
                {
                  title: "Ошибки и быстрые исправления",
                  description: "Научитесь диагностировать сбои:\n• как уточнять контекст\n• как дробить задачи\n• как возвращать модель в нужное русло",
                  icon: AlertCircle
                },
                {
                  title: "Инструменты и рабочие процессы",
                  description: "Поймёте, почему важнее выстроить процесс, чем выучить один инструмент — и как соединять ИИ в рабочие цепочки.",
                  icon: Wrench
                },
                {
                  title: "Поиск и масштабирование кейсов",
                  description: "• находить задачи по правилу 80/20\n• использовать чек-лист автоматизации\n• измерять эффект: время, ошибки, ценность\n• масштабировать за пределы своей роли",
                  icon: Lightbulb
                },
                {
                  title: "Этика и границы",
                  description: "• гигиена данных\n• конфиденциальность\n• когда ИИ применять не стоит\n• как встраивать человеческую проверку",
                  icon: Shield
                },
                {
                  title: "ИИ-культура и зрелое внедрение",
                  description: "• формировать привычку работы с ИИ\n• фиксировать кейсы\n• делиться промптами\n• вести ИИ-плейбук\n• превращать находки в стандарты команды",
                  icon: TrendingUp
                }
              ].map((module, index) => (
                <CourseModuleCard key={index} module={module} />
              ))}
            </div>
          </div>
        </section>

        {/* Ideal For Section */}
        <section className="container mx-auto px-4 min-[375px]:px-6 py-12 min-[768px]:py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12" style={{ color: "#171717" }}>
              Курс идеально подойдёт, если:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Хотите начать с нуля", description: "Без опыта, терминов и кода — объясняем ИИ на языке смыслов" },
                { title: "ИИ кажется «чёрным ящиком»", description: "Разберётесь, как модель принимает решения и почему ошибается" },
                { title: "Нужен фундамент, а не шпаргалки", description: "Фокус на понимании логики, а не копировании чужих запросов" },
                { title: "Пробовали — но разочаровались", description: "Научитесь брать ответы под контроль и получать сильный результат" },
                { title: "Мало времени", description: "Интенсивный формат без воды — можно пройти за выходные" }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-2xl border transition-colors touch-manipulation" style={{ borderColor: "#e3e3de", backgroundColor: "#fbfbf9" }}>
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#252525" }} />
                  <div>
                    <p className="font-medium leading-relaxed" style={{ color: "#171717" }}>{item.title}</p>
                    <p className="text-sm leading-relaxed mt-1" style={{ color: "#5f5f59" }}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section with Pricing */}
        <section id="pricing-section" className="container mx-auto px-4 min-[375px]:px-6 py-12 min-[768px]:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8 min-[768px]:space-y-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: "#171717" }}>
                Станьте уверенным пользователем ИИ
              </h2>
            </div>

            <div className="max-w-lg mx-auto">
              <div className="rounded-3xl p-8 border shadow-[0_8px_24px_rgba(0,0,0,0.04)]" style={{ borderColor: "#e3e3de", backgroundColor: "#fbfbf9" }}>
                <div className="text-center space-y-8">
                  {/* Header */}
                  <div className="space-y-2">
                    <span
                      className="inline-block px-4 py-2 rounded-lg text-base font-medium border bg-transparent"
                      style={{ borderColor: "#d8d8d2", color: "#7a7a74" }}
                    >
                      ИИ для работы
                    </span>
                    <h3 className="text-3xl font-semibold tracking-tight" style={{ color: "#171717" }}>
                    Доступ ко всему курсу
                    </h3>
                    <p className="text-base" style={{ color: "#5f5f59" }}>
                    Навсегда, с обновлениями
                    </p>
                  </div>

                  {/* Pricing Display */}
                  <div className="space-y-5">
                    <div className="flex items-baseline justify-center gap-4">
                      <span className="text-5xl font-semibold tracking-tight" style={{ color: "#171717" }}>3 290 ₽</span>
                      <span className="text-lg line-through" style={{ color: "#7a7a74" }}>11 000 ₽</span>
                    </div>

                    {/* Discount Badge */}
                    <div className="inline-flex items-center px-3 py-1.5 rounded-md border" style={{ borderColor: "#e0e0db", backgroundColor: "#f4f4f1" }}>
                      <span className="text-sm font-medium tracking-wide uppercase" style={{ color: "#5f5f59" }}>Скидка 70%</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px" style={{ backgroundColor: "#e3e3de" }}></div>

                  {/* Features List */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#252525" }}></div>
                      <p className="text-base" style={{ color: "#171717" }}>38 коротких уроков</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#252525" }}></div>
                      <p className="text-base" style={{ color: "#171717" }}>3 практические лабораторные</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#252525" }}></div>
                      <p className="text-base" style={{ color: "#171717" }}>4 теста для закрепления</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#252525" }}></div>
                      <p className="text-base" style={{ color: "#171717" }}>Пожизненный доступ и обновления</p>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full min-h-[44px] shadow-sm px-6 min-[768px]:px-8 text-base font-medium touch-manipulation rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ border: "1px solid #171717", backgroundColor: "#171717", color: "#ffffff" }}
                      onClick={async () => {
                        if (typeof window !== "undefined" && typeof (window as unknown as { ym?: (id: number, goal: string, name: string) => void }).ym === "function") {
                          (window as unknown as { ym: (id: number, goal: string, name: string) => void }).ym(106758513, "reachGoal", "start_course_click")
                        }
                        setIsPaymentLoading(true)
                        try {
                          // Call payment init API
                          const response = await fetch("/api/payment/init", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                          })

                          if (!response.ok) {
                            throw new Error("Failed to initialize payment")
                          }

                          const data = await response.json()
                          const { orderId, amount, signature, info, paymentUrl } = data

                          // Store order_id in localStorage for retry capability
                          localStorage.setItem("payment_order_id", orderId)

                          // Create form and submit to payment gateway
                          const form = document.createElement("form")
                          form.method = "POST"
                          form.action = paymentUrl
                          form.style.display = "none"

                          // Add form fields
                          const fields = [
                            { name: "order_id", value: orderId },
                            { name: "amount", value: String(amount) },
                            { name: "signature", value: signature },
                            ...info.flatMap((item: any, index: number) => [
                              { name: `info[${index}][name]`, value: item.name },
                              { name: `info[${index}][quantity]`, value: String(item.quantity) },
                              { name: `info[${index}][amount]`, value: String(item.amount) },
                            ]),
                          ]

                          fields.forEach(({ name, value }) => {
                            const input = document.createElement("input")
                            input.type = "hidden"
                            input.name = name
                            input.value = value
                            form.appendChild(input)
                          })

                          document.body.appendChild(form)
                          form.submit()
                        } catch (error) {
                          console.error("Error initiating payment:", error)
                          alert("Ошибка при инициализации оплаты. Попробуйте еще раз.")
                          setIsPaymentLoading(false)
                        }
                      }}
                      disabled={isPaymentLoading}
                    >
                      {isPaymentLoading ? "Подготовка оплаты..." : "Попробовать бесплатно"}
                    </button>
                    <div className="mt-3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with OpenAI Brand Reference - Now at the very bottom */}
      <footer className="teams-footer mt-auto py-6 min-[768px]:pt-6 min-[768px]:pb-8 border-t" style={{ borderColor: "#e6e6e1", paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
        <div className="container mx-auto px-4 min-[375px]:px-6">
          {/* Mobile: Single column with consistent spacing */}
          <div className="footer-mobile-container">
            <p className="footer-mobile-item text-xs footer-disclaimer-text" style={{ marginBottom: "0.5rem", color: "#5f5f59" }}>Русских М.С.</p>
            <p className="footer-mobile-item text-xs footer-disclaimer-text" style={{ marginBottom: "0.5rem", whiteSpace: "nowrap", color: "#5f5f59" }}>
              <span className="footer-disclaimer-text" style={{ marginRight: "0.25rem", color: "#5f5f59" }}>ИНН</span>770475475401
            </p>
            <a
              href="mailto:hi@transfrmr.ru"
              className="footer-mobile-item text-xs transition-colors touch-manipulation block footer-disclaimer-text"
              style={{ marginBottom: "0.5rem", color: "#5f5f59" }}
            >
              hi@transfrmr.ru
            </a>
            <Link
              href="/oferta"
              className="footer-mobile-item text-xs transition-colors touch-manipulation block footer-disclaimer-text"
              style={{ marginBottom: "0.5rem", color: "#5f5f59" }}
            >
              Оферта
            </Link>
            <Link
              href="/privacy-policy"
              className="footer-mobile-item text-xs transition-colors touch-manipulation block footer-disclaimer-text"
              style={{ marginBottom: "0.5rem", color: "#5f5f59" }}
            >
              Политика конфиденциальности
            </Link>
            <p className="footer-mobile-item text-xs footer-disclaimer-text" style={{ marginBottom: "0", color: "#5f5f59" }}>
              Трансформер - услуги по предоставлению доступа к информационным материалам. 18+
            </p>
          </div>

          {/* Desktop: Two columns side by side */}
          <div className="footer-desktop-container">
            {/* Contact Information - Left */}
            <div className="flex flex-col space-y-1.5">
              <p className="text-sm leading-relaxed footer-disclaimer-text" style={{ color: "#5f5f59" }}>Русских М.С.</p>
              <p className="text-sm leading-relaxed footer-disclaimer-text" style={{ color: "#5f5f59" }}>ИНН 770475475401</p>
              <a
                href="mailto:hi@transfrmr.ru"
                className="text-sm transition-colors touch-manipulation leading-relaxed inline-block footer-disclaimer-text"
                style={{ color: "#5f5f59" }}
              >
                hi@transfrmr.ru
              </a>
            </div>

            {/* Legal Links - Right */}
            <div className="flex flex-col space-y-1.5 items-end text-right">
              <Link
                href="/oferta"
                className="text-sm transition-colors touch-manipulation leading-relaxed inline-block footer-disclaimer-text"
                style={{ color: "#5f5f59" }}
              >
                Оферта
              </Link>
              <Link
                href="/privacy-policy"
                className="text-sm transition-colors touch-manipulation leading-relaxed inline-block footer-disclaimer-text"
                style={{ color: "#5f5f59" }}
              >
                Политика конфиденциальности
              </Link>
              <p className="text-sm leading-relaxed text-right footer-disclaimer-text" style={{ color: "#5f5f59" }}>
                Трансформер - услуги по предоставлению доступа к информационным материалам. 18+
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieBanner />
    </div>
  )
}

