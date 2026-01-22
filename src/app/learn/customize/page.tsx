"use client"

import Link from "next/link"
import { useProgressStore } from "@/lib/progress"
import { modules } from "@/lib/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/lesson/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Play, Palette, RotateCcw, Save } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
  success: string
  warning: string
  error: string
  progress: string
}

const defaultColors: ColorScheme = {
  primary: '#3D85F4',
  secondary: '#6B7280',
  accent: '#FDC109',
  background: '#0A0A0A',
  foreground: '#FFFFFF',
  muted: '#6B7280',
  border: '#374151',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  progress: '#0d9488'
}

const colorPresets: { name: string; colors: ColorScheme }[] = [
  {
    name: 'Default',
    colors: defaultColors
  },
  {
    name: 'Ocean',
    colors: {
      primary: '#0EA5E9',
      secondary: '#64748B',
      accent: '#06B6D4',
      background: '#0F172A',
      foreground: '#F8FAFC',
      muted: '#64748B',
      border: '#334155',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      progress: '#06B6D4'
    }
  },
  {
    name: 'Forest',
    colors: {
      primary: '#059669',
      secondary: '#6B7280',
      accent: '#10B981',
      background: '#064E3B',
      foreground: '#F0FDF4',
      muted: '#6B7280',
      border: '#065F46',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      progress: '#10B981'
    }
  },
  {
    name: 'Sunset',
    colors: {
      primary: '#F97316',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#7C2D12',
      foreground: '#FFF7ED',
      muted: '#6B7280',
      border: '#9A3412',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      progress: '#F59E0B'
    }
  },
  {
    name: 'Purple',
    colors: {
      primary: '#8B5CF6',
      secondary: '#6B7280',
      accent: '#A855F7',
      background: '#581C87',
      foreground: '#FAF5FF',
      muted: '#6B7280',
      border: '#7C3AED',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      progress: '#A855F7'
    }
  }
]

export default function ColorCustomizePage() {
  const { currentModule, currentSection, completedSections } = useProgressStore()
  const [colors, setColors] = useState<ColorScheme>(defaultColors)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  
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

  const updateColor = (key: keyof ColorScheme, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
  }

  const applyPreset = (preset: ColorScheme) => {
    setColors(preset)
  }

  const resetToDefault = () => {
    setColors(defaultColors)
  }

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  // Apply colors to CSS custom properties
  useEffect(() => {
    const root = document.documentElement
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
  }, [colors])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Color Customization Panel */}
          <Card className="border-2 border-dashed border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Цветовая настройка</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset Buttons */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Готовые схемы</Label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset.colors)}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Inputs */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="text-xs capitalize">
                      {key}
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id={key}
                        type="color"
                        value={value}
                        onChange={(e) => updateColor(key as keyof ColorScheme, e.target.value)}
                        className="w-12 h-8 p-1 border rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={value}
                        onChange={(e) => updateColor(key as keyof ColorScheme, e.target.value)}
                        className="text-xs font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToDefault}
                    className="text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Сбросить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePreviewMode}
                    className={`text-xs ${isPreviewMode ? 'bg-accent text-accent-foreground' : ''}`}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {isPreviewMode ? 'Выйти из предпросмотра' : 'Предпросмотр'}
                  </Button>
                </div>
                <Button size="sm" className="text-xs">
                  <Save className="h-3 w-3 mr-1" />
                  Сохранить схему
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section - Only show when in preview mode */}
          {isPreviewMode && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Предпросмотр с выбранными цветами</h2>
              
              {/* Banner for new learners */}
              {isNewLearner && firstLesson && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Play className="h-5 w-5" />
                      <span>Начать обучение</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold">{firstLesson.title}</h3>
                      <p className="text-muted-foreground">{firstLesson.summary}</p>
                    </div>
                    <Button asChild>
                      <Link href={`/learn/1/1`}>
                        Начать урок
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Продолжить обучение - only show if user has progress and is not a new learner */}
              {nextLesson && !isNewLearner && (
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Link href={`/learn/${nextLesson.module.id}/${nextLesson.section.section}`} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer" style={{ backgroundColor: colors.primary }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accent} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}>
                          <Play className="h-4 w-4 text-white ml-0.5" fill="currentColor" />
                        </Link>
                        <div>
                          <div className="font-medium text-foreground">Продолжить обучение</div>
                          <div className="text-sm text-muted-foreground">{nextLesson.section.title}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="text-center">
                          <div className="font-medium text-foreground">Модуль {nextLesson.module.id}</div>
                          <div>Урок {nextLesson.section.section}</div>
                        </div>
                        <div className="w-px h-8 bg-border"></div>
                        <Button asChild size="sm" style={{ backgroundColor: colors.success, color: 'white' }}>
                          <Link href={`/learn/${nextLesson.module.id}/${nextLesson.section.section}`}>
                            Продолжить
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Modules Overview */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Модули</h2>
                
                <div className="grid gap-6">
                  {modules.map((module) => {
                    const progress = getModuleProgress(module.id)
                    const completedCount = module.sections.filter(section => 
                      completedSections.has(`${module.id}-${section.section}`)
                    ).length
                    
                    return (
                      <Card key={module.id}>
                        <CardHeader>
                          <div className="flex justify-between">
                            <div className="flex-1 min-w-0 text-left">
                              <CardTitle className="text-xl text-left">{module.title}</CardTitle>
                              <p className="text-muted-foreground mt-1 text-left">{module.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4 self-start">
                               <div className="text-2xl font-bold" style={{ color: completedCount === module.sections.length ? colors.foreground : colors.accent }}>
                                {completedCount}/{module.sections.length}
                              </div>
                              <div className="text-sm text-muted-foreground">уроков</div>
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
                            {module.sections.length > 0 && (
                              <Button asChild variant="outline">
                                <Link href={`/learn/${module.id}/${module.sections[0].section}`}>
                                  Начать модуль
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
