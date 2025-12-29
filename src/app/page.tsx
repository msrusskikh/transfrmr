"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/lesson/card"
import { useProgressStore } from "@/lib/progress"
import { modules } from "@/lib/content"
import { useEffect } from "react"

export default function HomePage() {
  const { completedSections, currentModule, currentSection, isDevMode } = useProgressStore()
  // Force dark theme on mount
  useEffect(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }, [])
  
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
      {/* Header with Трансформер text */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-foreground">Трансформер</h1>
          </div>
          
        </div>
      </header>

      {/* Main Content - flex-grow to push footer down */}
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-28">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <h1 className="text-6xl font-bold tracking-tight text-foreground leading-tight">
              Интерактивный курс
              <br />
              <span className="text-primary">AI Fundamentals</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Освойте фундаментальные принципы работы с ИИ за 2 часа. Увеличьте эффективность работы и освободите время для важного
            </p>
            
            {/* Progress Indicator */}
            {hasProgress && (
              <div className="bg-card/50 rounded-xl p-7 max-w-lg mx-auto border border-border/30 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-foreground">Ваш прогресс</span>
                  <span className="text-2xl font-bold text-foreground">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-2 mb-4">
                  <div 
                    className="h-2 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercentage}%`, backgroundColor: '#0d9488' }}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {completedSections.size} из {totalSections} уроков завершено
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    Ваш текущий урок: {getCurrentLessonTitle()}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-5 pt-6">
              <Button asChild size="lg" className="hover:scale-105 transition-transform duration-200 shadow-sm px-8">
                <Link href="/learn">
                  Начать обучение
                </Link>
              </Button>
              {hasProgress && (
                <Button asChild variant="outline" size="lg" className="hover:scale-105 transition-transform duration-200 hover:bg-accent/50 px-8">
                  <Link href={getContinueDestination()}>
                    Продолжить обучение
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-lg mx-auto">
            <div className="bg-card/50 rounded-xl p-8 border border-border/30 shadow-sm">
              <div className="text-center space-y-8">
                {/* Header */}
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    Стоимость курса
                  </h2>
                  <p className="text-muted-foreground text-sm">
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
                  <div className="inline-flex items-center px-3 py-1 rounded-md bg-muted/30 border border-border/40">
                    <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Экономия 70%</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-border/50"></div>

                {/* Features List */}
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-foreground">50+ интерактивных уроков</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-foreground">Практические задания и кейсы</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-foreground">Пожизненный доступ к материалам</p>
                  </div>
                </div>

                {/* Purchase Button */}
                <div className="pt-2">
                  <Button 
                    size="lg" 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white hover:scale-105 transition-transform duration-200 shadow-sm px-8 text-base font-medium"
                    onClick={() => {
                      // TODO: Add purchase logic here
                      alert('Функция покупки будет добавлена позже')
                    }}
                  >
                    Купить курс
                  </Button>
                  <p className="text-xs text-muted-foreground/70 mt-3">
                    Безопасная оплата • Мгновенный доступ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with OpenAI Brand Reference - Now at the very bottom */}
      <footer className="mt-auto py-8 border-t border-border/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col space-y-6">
            {/* Main Footer Content - Left and Right */}
            <div className="flex items-start justify-between">
              {/* Contact Information - Left */}
              <div className="text-left space-y-1">
                <p className="text-sm text-foreground">Русских М.С.</p>
                <p className="text-sm text-muted-foreground">ИНН 770475475401</p>
                <a 
                  href="mailto:hi@transfrmr.ai" 
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  hi@transfrmr.ai
                </a>
              </div>

              {/* Legal Links - Right */}
              <div className="text-right space-y-1">
                <Link 
                  href="/oferta" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                >
                  Оферта
                </Link>
                <Link 
                  href="/privacy-policy" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                >
                  Политика конфиденциальности
                </Link>
              </div>
            </div>

            {/* OpenAI Brand Reference */}
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground/60 font-mono tracking-wide">
              <div className="w-1.5 h-1.5 bg-green-500/70 rounded-full"></div>
              <span>Powered by OpenAI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

