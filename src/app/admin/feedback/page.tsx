"use client"

import React, { useState, useEffect } from 'react'
import { Zap, Calendar, User, MessageSquare, ArrowLeft, Globe, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/lesson/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { getLesson, getModule } from '@/lib/content'

interface FeedbackData {
  id: string
  message: string
  context: {
    url: string
    pathname: string
    timestamp: string
  }
  userEmail?: string
  timestamp: string
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageFilter, setPageFilter] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback')
      if (!response.ok) throw new Error('Failed to fetch feedback')
      const data = await response.json()
      setFeedback(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get page/lesson name from pathname (same logic as FeedbackDialog)
  const getPageName = (pathname: string) => {
    if (!pathname) return pathname
    
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
        return lesson?.title || pathname
      } else if (pathParts.length === 2) {
        // Module page: /learn/[module]
        const moduleId = parseInt(pathParts[1])
        const module = getModule(moduleId)
        return module?.title || pathname
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

  // Get unique pages for filtering
  const uniquePages = Array.from(
    new Set(feedback.map(f => f.context.pathname))
  ).sort()

  const filteredFeedback = pageFilter
    ? feedback.filter(f => f.context.pathname === pageFilter)
    : feedback

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center text-red-600 dark:text-red-400">
              <p>Ошибка загрузки отзывов: {error}</p>
              <button 
                onClick={fetchFeedback}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground bg-card dark:bg-muted/50 border border-border/30 shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Назад</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6CC93]/20">
              <Zap className="h-5 w-5 text-[#E6CC93]" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Обратная связь
            </h1>
          </div>
        </div>

        {/* Stats */}
        {feedback.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Всего отзывов
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {feedback.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Уникальных страниц
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {uniquePages.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    С email
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {feedback.filter(f => f.userEmail).length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Page Filter */}
        {uniquePages.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Фильтр по странице:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={pageFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setPageFilter(null)}
                className="text-xs"
              >
                Все страницы
              </Button>
              {uniquePages.map((pathname) => {
                const pageName = getPageName(pathname)
                const isActive = pageFilter === pathname
                const count = feedback.filter(f => f.context.pathname === pathname).length
                return (
                  <Button
                    key={pathname}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPageFilter(isActive ? null : pathname)}
                    className="text-xs"
                  >
                    {pageName}
                    <Badge 
                      variant="secondary" 
                      className="ml-2 bg-muted text-muted-foreground"
                    >
                      {count}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Filter Status */}
        {pageFilter && (
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-foreground">
                Показаны отзывы со страницы: {getPageName(pageFilter)}
              </span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {filteredFeedback.length} из {feedback.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPageFilter(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              Сбросить фильтр
            </Button>
          </div>
        )}

        {/* Feedback List */}
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {pageFilter ? 'Нет отзывов с этой страницы' : 'Пока нет отзывов'}
              </h3>
              <p className="text-muted-foreground">
                {pageFilter 
                  ? 'Попробуйте выбрать другую страницу или сбросить фильтр.'
                  : 'Отзывы появятся здесь, как только пользователи начнут их оставлять.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredFeedback
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((item) => {
                const pageName = getPageName(item.context.pathname)
                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#E6CC93]/20 rounded-full flex items-center justify-center">
                            <Zap className="h-5 w-5 text-[#E6CC93]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {item.userEmail || 'Анонимный пользователь'}
                            </h3>
                            {item.userEmail && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {item.userEmail}
                              </p>
                            )}
                            {!item.userEmail && (
                              <p className="text-sm text-muted-foreground">
                                ID: {item.id.slice(0, 8)}...
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(item.timestamp)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Page/Lesson Info */}
                        <div className="flex items-center space-x-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Страница:</span>
                          <Badge variant="outline" className="font-medium">
                            {pageName}
                          </Badge>
                          {item.context.pathname !== pageName && (
                            <span className="text-xs text-muted-foreground">
                              ({item.context.pathname})
                            </span>
                          )}
                        </div>

                        {/* Feedback Message */}
                        <div>
                          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Сообщение:
                          </h4>
                          <p className="text-foreground leading-relaxed bg-muted/30 rounded-lg p-4">
                            {item.message}
                          </p>
                        </div>

                        {/* URL (if different from pathname) */}
                        {item.context.url && item.context.url !== item.context.pathname && (
                          <div className="text-xs text-muted-foreground break-all">
                            URL: {item.context.url}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
