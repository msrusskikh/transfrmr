"use client"

import React, { useState, useEffect } from 'react'
import { Zap, Calendar, User, MessageSquare, ArrowLeft, Globe, Mail, MailOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/lesson/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { getLesson, getModule } from '@/lib/content'
import { useAuth } from '@/contexts/AuthContext'
import { isAdminEmail } from '@/lib/admin'

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
  status?: 'New' | 'Fixed'
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageFilter, setPageFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'fixed'>('all')
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Check admin access and redirect if unauthorized
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdminEmail(user.email)) {
        router.push('/')
      }
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Only fetch feedback if user is authenticated and is admin
    if (!authLoading && user && isAdminEmail(user.email)) {
      fetchFeedback()
    }
  }, [authLoading, user])

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback')
      if (!response.ok) throw new Error('Failed to fetch feedback')
      const data = await response.json()
      // Ensure all feedback has a status (default to 'New' if missing)
      const feedbackWithStatus = data.map((item: FeedbackData) => ({
        ...item,
        status: item.status || 'New'
      }))
      setFeedback(feedbackWithStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: 'New' | 'Fixed') => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      // Update local state
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      )
    } catch (err) {
      console.error('Error updating status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update status')
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

  const filteredFeedback = feedback.filter(f => {
    // Filter by page if pageFilter is set
    if (pageFilter && f.context.pathname !== pageFilter) {
      return false
    }
    // Filter by status
    if (statusFilter === 'new') {
      return f.status !== 'Fixed'
    }
    if (statusFilter === 'fixed') {
      return f.status === 'Fixed'
    }
    // statusFilter === 'all'
    return true
  })

  // Show loading state while checking auth or if not authorized
  if (authLoading || loading || !user || !isAdminEmail(user.email)) {
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
          <h1 className="text-3xl font-bold text-foreground">
            Обратная связь
          </h1>
        </div>

        {/* Stats */}
        {feedback.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                statusFilter === 'all' ? 'ring-1 ring-border border-border' : ''
              }`}
              onClick={() => setStatusFilter('all')}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Total reports
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {feedback.length}
                </p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                statusFilter === 'new' ? 'ring-1 ring-border border-border' : ''
              }`}
              onClick={() => setStatusFilter('new')}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MailOpen className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    New
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {feedback.filter(f => f.status !== 'Fixed').length}
                </p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                statusFilter === 'fixed' ? 'ring-1 ring-border border-border' : ''
              }`}
              onClick={() => setStatusFilter('fixed')}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" style={{ color: '#E6CC93' }} />
                  <span className="text-sm font-medium text-muted-foreground">
                    Fixed
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {feedback.filter(f => f.status === 'Fixed').length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Page Filter */}
        {uniquePages.length > 0 && (
          <div className="mb-6">
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

        {/* Feedback List */}
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {pageFilter || statusFilter !== 'all' 
                  ? 'Нет репортов, соответствующих фильтрам' 
                  : 'Пока нет отзывов'}
              </h3>
              <p className="text-muted-foreground">
                {pageFilter || statusFilter !== 'all'
                  ? 'Попробуйте изменить фильтры или сбросить их.'
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
                            {!item.userEmail && (
                              <p className="text-sm text-muted-foreground">
                                ID: {item.id.slice(0, 8)}...
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.status === 'Fixed' ? (
                            <Badge
                              variant="default"
                              style={{ backgroundColor: '#B19D73', color: '#000' }}
                              className="dark:bg-[#E6CC93]/80 dark:text-[#000]"
                            >
                              Fixed
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            >
                              New
                            </Badge>
                          )}
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
                          <Badge 
                            variant="outline" 
                            className="font-medium cursor-pointer transition-colors [&:not(:hover)]:border-border [&:not(:hover)]:text-muted-foreground hover:border-border/50 hover:text-muted-foreground/70"
                            onClick={() => router.push(item.context.pathname)}
                          >
                            {pageName}
                          </Badge>
                        </div>

                        {/* Feedback Message */}
                        <div>
                          <p className="text-foreground leading-relaxed bg-muted/30 rounded-lg p-4">
                            {item.message}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        {item.status !== 'Fixed' && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => updateStatus(item.id, 'Fixed')}
                              style={{ backgroundColor: '#E6CC93', color: '#000', borderColor: '#E6CC93' }}
                              className="hover:opacity-90"
                            >
                              Fixed
                            </Button>
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
