"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import { useProgressStore } from "@/lib/progress"
import { modules } from "@/lib/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/lesson/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, ArrowRight, Clock, Lock, Unlock } from "lucide-react"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { useEffect, useState } from "react"

interface ModulePageProps {
  params: Promise<{
    module: string
  }>
}

export default function ModulePage({ params }: ModulePageProps) {
  const [moduleStr, setModuleStr] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const { completedSections, isDevMode } = useProgressStore()

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params
        setModuleStr(resolvedParams.module)
        setIsLoading(false)
      } catch (error) {
        console.error("Error resolving params:", error)
        setIsLoading(false)
      }
    }
    
    resolveParams()
  }, [params])

  if (isLoading) {
    return <div>Loading...</div>
  }
  const moduleId = parseInt(moduleStr)
  const module = modules.find(m => m.id === moduleId)
  
  if (!module) {
    notFound()
  }

  // Calculate actual progress for this module
  const completedCount = module.sections.filter(section => 
    completedSections.has(`${moduleId}-${section.section}`)
  ).length
  
  const progressPercentage = module.sections.length > 0 ? (completedCount / module.sections.length) * 100 : 0
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Breadcrumbs />
        
        {/* Module Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{module.title}</CardTitle>
            <p className="text-lg text-muted-foreground">{module.description}</p>
            {isDevMode && (
              <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <Unlock className="h-4 w-4" />
                <span>Developer Mode: All lessons accessible</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-end">
              <div className="text-sm text-muted-foreground">
                {module.sections.length} уроков • ~{module.sections.reduce((acc, s) => acc + s.duration, 0)} мин
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Прогресс</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              {completedCount === module.sections.length && module.sections.length > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  🎉 Модуль завершен! Отличная работа!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sections List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Уроки</h2>
          
          <div className="space-y-3">
            {module.sections.map((section) => {
              const isCompleted = completedSections.has(`${moduleId}-${section.section}`)
              const isFirst = section.section === 1
              const hasAccessToPrevious = section.section > 1 && completedSections.has(`${moduleId}-${section.section - 1}`)
              const isAccessible = isDevMode || isFirst || isCompleted || hasAccessToPrevious
              
              // Determine status icon - always show an icon with explicit sizing and visibility
              const getStatusIcon = () => {
                if (isCompleted) {
                  return (
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full" style={{ color: '#0d9488' }}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                  )
                } else if (isAccessible) {
                  return (
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )
                } else {
                  return (
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )
                }
              }
              
              return (
                <Card key={section.section} className={!isAccessible ? "opacity-60" : ""}>
                  {isAccessible ? (
                    <Link href={`/learn/${moduleId}/${section.section}`} className="block">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 min-w-0">
                            {getStatusIcon()}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold truncate hover:text-primary transition-colors cursor-pointer">
                                  {section.title}
                                </h3>
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground flex-shrink-0">
                                  <Clock className="h-4 w-4" />
                                  <span>{section.duration} мин</span>
                                </div>
                              </div>
                              <p className="text-muted-foreground mt-1 line-clamp-2">{section.summary}</p>
                            </div>
                          </div>
                          
                          {/* Desktop buttons - hidden on mobile */}
                          <div className="hidden md:block">
                            <Button 
                              variant={isCompleted ? "outline" : "default"}
                              onClick={(e) => e.preventDefault()}
                            >
                              {isCompleted ? "Повторить" : "Начать"}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  ) : (
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 min-w-0">
                          {getStatusIcon()}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold text-muted-foreground truncate">
                                {section.title}
                              </h3>
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground flex-shrink-0">
                                <Clock className="h-4 w-4" />
                                <span>{section.duration} мин</span>
                              </div>
                            </div>
                            <p className="text-muted-foreground mt-1 line-clamp-2">{section.summary}</p>
                            {!isDevMode && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                🔒 Завершите предыдущий урок для доступа
                              </p>
                            )}
                            {isDevMode && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                🔓 Developer Mode: Lesson accessible
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop locked button - hidden on mobile */}
                        <div className="hidden md:block">
                          <Button disabled variant="outline" className="opacity-50">
                            <Lock className="mr-2 h-4 w-4" />
                            Заблокировано
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
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
