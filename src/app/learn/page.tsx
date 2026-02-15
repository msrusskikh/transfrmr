

"use client"

import Link from "next/link"
import { useProgressStore } from "@/lib/progress"
import { modules } from "@/lib/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/lesson/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Play, ChevronDown, ChevronUp, Circle } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import WelcomePopup from "@/components/lesson/WelcomePopup"

const WELCOME_POPUP_KEY = "welcome-popup-dismissed"

export default function LearnPage() {
  const { currentModule, currentSection, completedSections, isDevMode } = useProgressStore()
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)

  // Check if welcome popup should be shown on mount
  // Show popup only if:
  // 1. User hasn't dismissed it before (localStorage check)
  // 2. AND user hasn't completed any lessons (completedSections.size === 0)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenWelcome = localStorage.getItem(WELCOME_POPUP_KEY)
      const hasCompletedLessons = completedSections.size > 0
      
      // Only show if user hasn't seen it AND hasn't completed any lessons
      if (!hasSeenWelcome && !hasCompletedLessons) {
        setShowWelcomePopup(true)
      } else {
        setShowWelcomePopup(false)
      }
    }
  }, [completedSections.size])

  const handleWelcomePopupClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WELCOME_POPUP_KEY, "true")
    }
    setShowWelcomePopup(false)
  }

  // Also hide popup if user completes a lesson while it's open
  useEffect(() => {
    if (completedSections.size > 0 && showWelcomePopup) {
      setShowWelcomePopup(false)
      // Mark as dismissed so it doesn't show again
      if (typeof window !== 'undefined') {
        localStorage.setItem(WELCOME_POPUP_KEY, "true")
      }
    }
  }, [completedSections.size, showWelcomePopup])
  
  const currentModuleData = modules.find(m => m.id === currentModule)
  const currentSectionData = currentModuleData?.sections.find(s => s.section === currentSection)
  
  // Check if user is a new learner (no progress)
  const isNewLearner = completedSections.size === 0
  
  // Get first lesson data for new learners
  const firstLesson = modules[0]?.sections[0]
  
  // Find the next incomplete lesson
  const getNextIncompleteLesson = () => {
    for (const module of modules) {
      for (const section of module.sections) {
        const key = `${module.id}-${section.section}`
        if (!completedSections.has(key)) {
          return { module, section }
        }
      }
    }
    return null // All lessons completed
  }
  
  const nextLesson = getNextIncompleteLesson()
  
  const getModuleProgress = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return 0
    
    const completed = module.sections.filter(section => 
      completedSections.has(`${moduleId}-${section.section}`)
    ).length
    
    return (completed / module.sections.length) * 100
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <WelcomePopup isOpen={showWelcomePopup} onClose={handleWelcomePopupClose} />
      <div className="container mx-auto px-4 min-[375px]:px-6 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Banner for new learners */}
        {isNewLearner && firstLesson && (
          <Card className="bg-card/100 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 md:p-4">
              <Link 
                href={`/learn/1/1`}
                className="md:hidden flex items-center gap-3 touch-manipulation"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors" style={{ backgroundColor: '#845EEE' }}>
                  <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-normal text-base text-foreground line-clamp-2">{firstLesson.title}</div>
                </div>
              </Link>
              {/* Desktop layout */}
              <Link 
                href={`/learn/1/1`}
                className="hidden md:flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ backgroundColor: '#845EEE' }}
                >
                  <Play className="h-4 w-4 text-white ml-0.5" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-normal text-base text-foreground line-clamp-2">{firstLesson.title}</div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground flex-shrink-0 pr-2">
                  <div className="text-right">
                    <div className="font-medium text-foreground">Модуль 1</div>
                    <div>Урок 1</div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Продолжить обучение - only show if user has progress and is not a new learner */}
        {nextLesson && !isNewLearner && (
          <Card className="bg-card/100 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 md:p-4">
              <Link 
                href={`/learn/${nextLesson.module.id}/${nextLesson.section.section}`}
                className="md:hidden flex items-center gap-3 touch-manipulation"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors" style={{ backgroundColor: '#845EEE' }}>
                  <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-normal text-base text-foreground line-clamp-2">{nextLesson.section.title}</div>
                </div>
              </Link>
              {/* Desktop layout */}
              <Link 
                href={`/learn/${nextLesson.module.id}/${nextLesson.section.section}`}
                className="hidden md:flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ backgroundColor: '#845EEE' }}
                >
                  <Play className="h-4 w-4 text-white ml-0.5" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-normal text-base text-foreground line-clamp-2">{nextLesson.section.title}</div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground flex-shrink-0 pr-2">
                  <div className="text-right">
                    <div className="font-medium text-foreground">Модуль {nextLesson.module.id}</div>
                    <div>Урок {nextLesson.section.section}</div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Modules Overview */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Модули</h2>
          
          <div className="grid gap-6">
            {modules.map((module) => {
              const progress = getModuleProgress(module.id)
              const isExpanded = expandedModules.has(module.id)
              
              return (
                <Card key={module.id} className="cursor-pointer" onClick={() => toggleModule(module.id)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 text-left">
                        <CardTitle className="text-xl text-left">{module.title}</CardTitle>
                        <p className="text-muted-foreground mt-1 text-left">{module.description}</p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <div className="w-8 h-8 rounded-md border border-border/50 bg-background/50 flex items-center justify-center hover:bg-accent/50 transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Прогресс</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {module.sections.length} уроков • ~{module.sections.reduce((acc, s) => acc + s.duration, 0)} мин
                      </div>
                    </div>

                    {/* Lessons Dropdown */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-border/50">
                        <div className="space-y-1">
                          {module.sections.map((section) => {
                            const isCompleted = completedSections.has(`${module.id}-${section.section}`)
                            const isFirstSection = section.section === 1
                            const hasAccessToPrevious = section.section > 1 && completedSections.has(`${module.id}-${section.section - 1}`)
                            const hasAccess = isDevMode || isFirstSection || isCompleted || hasAccessToPrevious
                            
                            return (
                              <Link
                                key={section.section}
                                href={`/learn/${module.id}/${section.section}`}
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                  "flex items-center gap-3 py-2 transition-all duration-200 group",
                                  !hasAccess && !isDevMode && "opacity-50 pointer-events-none",
                                  hasAccess && "hover:text-foreground"
                                )}
                              >
                                {/* Circular indicator */}
                                <div className={cn(
                                  "w-2 h-2 rounded-full flex-shrink-0 transition-colors mt-0.5",
                                  isCompleted 
                                    ? "bg-foreground border-foreground border" 
                                    : hasAccess 
                                      ? "bg-background border border-muted-foreground/60 group-hover:border-foreground/60" 
                                      : "bg-background border border-muted-foreground/30"
                                )}></div>
                                
                                {/* Lesson title */}
                                <span className={cn(
                                  "text-sm leading-relaxed flex-1",
                                  hasAccess ? "text-foreground/80 group-hover:text-foreground" : "text-muted-foreground"
                                )}>
                                  {section.title}
                                </span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
