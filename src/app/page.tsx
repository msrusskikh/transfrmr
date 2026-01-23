"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/lesson/card"
import { useProgressStore } from "@/lib/progress"
import { modules } from "@/lib/content"
import { useEffect, useState, Suspense } from "react"
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

// Course Module Card Component
function CourseModuleCard({ module }: { module: { title: string; description: string; icon: React.ComponentType<{ className?: string }> } }) {
  const [isOpen, setIsOpen] = useState(false)
  const Icon = module.icon

  return (
    <Card className="border-border/30 bg-card/30 hover:bg-card/50 active:bg-card/60 transition-colors cursor-pointer touch-manipulation min-h-[44px]" onClick={() => setIsOpen(!isOpen)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{module.title}</CardTitle>
              {isOpen && (
                <p className="text-muted-foreground leading-relaxed text-base mt-2">
                  {module.description}
                </p>
              )}
            </div>
          </div>
          <ChevronDown 
            className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </div>
      </CardHeader>
    </Card>
  )
}

// Payment callback handler component (needs Suspense boundary for useSearchParams)
function PaymentCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle payment callback query parameters
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const orderId = searchParams.get('id')

    if (success && orderId) {
      // Payment successful - set access token and redirect to signup
      const setAccessToken = async () => {
        try {
          const response = await fetch('/api/payment/set-access-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }),
          })

          if (response.ok) {
            // Remove query params and redirect to signup
            router.replace('/signup')
          } else {
            console.error('Failed to set access token')
            router.replace('/')
          }
        } catch (error) {
          console.error('Error setting access token:', error)
          router.replace('/')
        }
      }

      setAccessToken()
    } else if (error && orderId) {
      // Payment failed - user already saw notification on payment processor side
      // Just clean up the URL by removing query params
      router.replace('/')
    }
  }, [searchParams, router])

  return null
}

export default function HomePage() {
  const { completedSections, currentModule, currentSection, isDevMode } = useProgressStore()
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // Force dark theme on mount
  useEffect(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }, [])
  
  const handleSignOut = async () => {
    // Navigate immediately for instant feedback
    router.push('/')
    // Sign out in the background - don't block navigation
    signOut().catch((error) => {
      console.error('Error signing out:', error)
    })
  }
  
  // Function to get current lesson title
  const getCurrentLessonTitle = () => {
    if (currentModule === 0 || currentSection === 0) {
      return "Начало обучения"
    }
    
    const module = modules.find(m => m.id === currentModule)
    if (!module) {
      return "Модуль не найден"
    }
    
    const section = module.sections.find(s => s.section === currentSection)
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
    console.log('Completed sections:', Array.from(completedSections))
    console.log('Total completed:', completedSections.size)
    
    // Find the first incomplete lesson (same logic as learn page)
    for (const module of modules) {
      for (const section of module.sections) {
        const key = `${module.id}-${section.section}`
        if (!completedSections.has(key)) {
          console.log('Next incomplete lesson:', `${module.id}-${section.section}`)
          return `/learn/${module.id}/${section.section}`
        }
      }
    }
    
    // If all lessons are completed, go to the learn page
    console.log('All lessons completed, going to /learn')
    return `/learn`
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Payment callback handler wrapped in Suspense */}
      <Suspense fallback={null}>
        <PaymentCallbackHandler />
      </Suspense>
      
      {/* Header with Трансформер text */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container flex h-14 items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <Image 
              src="/logo.svg" 
              alt="Трансформер" 
              width={24} 
              height={24}
              className="object-contain"
            />
            <h1 className="text-lg font-semibold text-foreground">Трансформер</h1>
          </div>
          {/* Authentication UI */}
          {!authLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 px-3 py-2 min-h-[44px] rounded-md bg-muted/30 hover:bg-muted/50 active:bg-muted/60 transition-colors cursor-pointer touch-manipulation">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="hidden min-[768px]:inline text-sm min-[1024px]:text-base text-foreground truncate max-w-[120px]">
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
                <Button asChild variant="outline" className="min-h-[44px] px-4 py-2 touch-manipulation">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    <span className="text-base">Войти</span>
                  </Link>
                </Button>
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
            <h1 className="text-3xl min-[375px]:text-4xl min-[768px]:text-5xl min-[1024px]:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Начните пользоваться ИИ легко и уверенно
            </h1>
            <p className="text-base min-[375px]:text-lg min-[768px]:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Трансформер — это игровой курс по основам ИИ. Всё необходимое, чтобы с нуля начать применять ИИ в работе — просто, практично и без перегруза.
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
              <div className="bg-card/50 rounded-xl p-6 min-[768px]:p-7 max-w-lg mx-auto border border-border/30 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-medium text-foreground">Ваш прогресс</span>
                  <span className="text-2xl font-bold text-foreground">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-2 mb-4">
                  <div 
                    className="h-2 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercentage}%`, backgroundColor: '#0d9488' }}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-base text-muted-foreground">
                    {completedSections.size} из {totalSections} уроков завершено
                  </p>
                  <p className="text-base font-medium text-foreground">
                    Ваш текущий урок: {getCurrentLessonTitle()}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-5 pt-6">
              {!authLoading && user ? (
                <Button asChild size="lg" className="min-h-[44px] shadow-sm px-6 min-[768px]:px-8 touch-manipulation">
                  <Link href={getContinueDestination()}>
                    Продолжить обучение
                  </Link>
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="min-h-[44px] shadow-sm px-6 min-[768px]:px-8 touch-manipulation"
                  onClick={() => {
                    const pricingSection = document.getElementById('pricing-section')
                    if (pricingSection) {
                      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                >
                  Начать обучение
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 min-[375px]:px-6 py-12 min-[768px]:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="border-border/30 bg-card/30 hover:bg-card/50 active:bg-card/60 transition-colors touch-manipulation">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">С нуля, без стресса</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Не нужно ничего знать про ИИ или «промпты» — начнём с самых простых шагов.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border-border/30 bg-card/30 hover:bg-card/50 active:bg-card/60 transition-colors touch-manipulation">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Учитесь в своём ритме</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Уроки по 5–15 минут. Можно пройти за обед или между делами.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border-border/30 bg-card/30 hover:bg-card/50 active:bg-card/60 transition-colors touch-manipulation">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Максимум практики</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Интерактивные задания, мини-лабы и шпаргалки закрепят знания и дадут уверенность.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="border-border/30 bg-card/30 hover:bg-card/50 active:bg-card/60 transition-colors touch-manipulation">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Gamepad2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Учёба как игра</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Прогресс, уровни, челленджи. Лёгкость и азарт вместо скуки.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 5 */}
              <Card className="border-border/30 bg-card/30 hover:bg-card/50 active:bg-card/60 transition-colors touch-manipulation">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Всё по делу</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Только то, что реально нужно для работы: инструменты, сценарии, практика, этика.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 6 */}
              <Card className="border-border/30 bg-card/30 hover:bg-card/50 active:bg-card/60 transition-colors touch-manipulation">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Всегда под рукой</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Курс адаптирован под телефон. Учитесь где угодно — в метро, в очереди, дома на диване.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Course Content Section */}
        <section className="container mx-auto px-4 min-[375px]:px-6 py-12 min-[768px]:py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              Про что расскажем на курсе
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "Как работает современный ИИ",
                  description: "Простое объяснение без формул и заумных терминов. Поймёте, что ИИ может и чего от него ждать не стоит.",
                  icon: Brain
                },
                {
                  title: "Как правильно задавать вопросы",
                  description: "Мини-гайд по «промптам» — на понятных примерах.",
                  icon: MessageSquare
                },
                {
                  title: "Инструменты для работы",
                  description: "Разберём ChatGPT, Claude, Midjourney и другие помощники.",
                  icon: Wrench
                },
                {
                  title: "Реальные рабочие сценарии",
                  description: "Маркетинг, тексты, аналитика, исследования, презентации. Всё на практических кейсах.",
                  icon: Lightbulb
                },
                {
                  title: "Как решать ошибки и «тупики»",
                  description: "Что делать, если ИИ отвечает не то, и как быстро вернуться к делу.",
                  icon: AlertCircle
                },
                {
                  title: "Этика и границы",
                  description: "Как использовать ИИ безопасно и ответственно.",
                  icon: Shield
                },
                {
                  title: "Как оставаться в курсе",
                  description: "Простой фреймворк: как отслеживать новинки и не утонуть в потоке информации.",
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              Курс идеально подойдёт, если:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Вы полный новичок и пользовались ChatGPT максимум пару раз",
                "Любите, когда учёба похожа на игру, а не на лекцию",
                "Хотите ускорить рабочие задачи и повысить продуктивность",
                "Времени мало, а разобраться хочется качественно",
                "Предпочитаете рабочие сценарии вместо скучной теории",
                "Хотите попробовать ИИ, но боитесь запутаться"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-card/20 border border-border/20 hover:bg-card/30 active:bg-card/40 transition-colors touch-manipulation">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section with Pricing */}
        <section id="pricing-section" className="container mx-auto px-4 min-[375px]:px-6 py-12 min-[768px]:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8 min-[768px]:space-y-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Готовы стать уверенным пользователем ИИ?
              </h2>
            </div>
            
            <div className="max-w-lg mx-auto">
              <div className="bg-card/50 rounded-xl p-8 border border-border/30 shadow-sm">
                <div className="text-center space-y-8">
                  {/* Header */}
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold tracking-tight text-foreground">
                      Стоимость курса
                    </h3>
                    <p className="text-muted-foreground text-base">
                      Полный доступ ко всем материалам
                    </p>
                  </div>

                  {/* Pricing Display */}
                  <div className="space-y-5">
                    <div className="flex items-baseline justify-center gap-4">
                      <span className="text-5xl font-bold tracking-tight text-foreground">3 290 ₽</span>
                      <span className="text-lg text-muted-foreground line-through">11 000 ₽</span>
                    </div>
                    
                    {/* Discount Badge */}
                    <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-muted/30 border border-border/40">
                      <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Экономия 70%</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-border/50"></div>

                  {/* Features List */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <p className="text-base text-foreground">50+ интерактивных уроков</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <p className="text-base text-foreground">Практические задания и кейсы</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <p className="text-base text-foreground">Пожизненный доступ к материалам</p>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <div className="pt-2">
                    <Button 
                      size="lg" 
                      className="w-full min-h-[44px] bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-sm px-6 min-[768px]:px-8 text-base font-medium touch-manipulation"
                      onClick={() => {
                        // TODO: Add purchase logic here
                        alert('Функция покупки будет добавлена позже')
                      }}
                    >
                      Купить курс
                    </Button>
                    <p className="text-sm text-muted-foreground/70 mt-3">
                      Безопасная оплата • Мгновенный доступ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with OpenAI Brand Reference - Now at the very bottom */}
      <footer className="mt-auto py-6 min-[768px]:py-8 border-t border-border/30" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
        <div className="container mx-auto px-4 min-[375px]:px-6">
          {/* Mobile: Single column with consistent spacing */}
          <div className="footer-mobile-container">
            <p className="footer-mobile-item text-sm text-foreground" style={{ marginBottom: '0.5rem' }}>Русских М.С.</p>
            <p className="footer-mobile-item text-sm text-muted-foreground" style={{ marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>
              <span style={{ marginRight: '0.25rem' }}>ИНН</span>770475475401
            </p>
            <a 
              href="mailto:hi@transfrmr.ai" 
              className="footer-mobile-item text-sm text-primary hover:text-primary/80 active:text-primary/70 transition-colors touch-manipulation block"
              style={{ marginBottom: '0.5rem' }}
            >
              hi@transfrmr.ai
            </a>
            <Link 
              href="/oferta" 
              className="footer-mobile-item text-sm text-muted-foreground hover:text-foreground active:text-foreground/80 transition-colors touch-manipulation block"
              style={{ marginBottom: '0.5rem' }}
            >
              Оферта
            </Link>
            <Link 
              href="/privacy-policy" 
              className="footer-mobile-item text-sm text-muted-foreground hover:text-foreground active:text-foreground/80 transition-colors touch-manipulation block"
              style={{ marginBottom: '0' }}
            >
              Политика конфиденциальности
            </Link>
          </div>

          {/* Desktop: Two columns side by side */}
          <div className="footer-desktop-container">
            {/* Contact Information - Left */}
            <div className="flex flex-col space-y-1.5">
              <p className="text-base text-foreground leading-relaxed">Русских М.С.</p>
              <p className="text-base text-muted-foreground leading-relaxed">ИНН 770475475401</p>
              <a 
                href="mailto:hi@transfrmr.ai" 
                className="text-base text-primary hover:text-primary/80 active:text-primary/70 transition-colors touch-manipulation leading-relaxed inline-block"
              >
                hi@transfrmr.ai
              </a>
            </div>

            {/* Legal Links - Right */}
            <div className="flex flex-col space-y-1.5 items-end text-right">
              <Link 
                href="/oferta" 
                className="text-base text-muted-foreground hover:text-foreground active:text-foreground/80 transition-colors touch-manipulation leading-relaxed inline-block"
              >
                Оферта
              </Link>
              <Link 
                href="/privacy-policy" 
                className="text-base text-muted-foreground hover:text-foreground active:text-foreground/80 transition-colors touch-manipulation leading-relaxed inline-block"
              >
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

