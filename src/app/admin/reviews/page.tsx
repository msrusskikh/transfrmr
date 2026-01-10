"use client"

import React, { useState, useEffect } from 'react'
import { Star, Calendar, User, MessageSquare, Heart, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/lesson/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { isAdminEmail } from '@/lib/admin'

interface ReviewData {
  id: string
  rating: number
  review: string
  timestamp: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
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
    // Only fetch reviews if user is authenticated and is admin
    if (!authLoading && user && isAdminEmail(user.email)) {
      fetchReviews()
    }
  }, [authLoading, user])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews')
      if (!response.ok) throw new Error('Failed to fetch reviews')
      const data = await response.json()
      setReviews(data)
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

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const ratingDistribution = getRatingDistribution()

  const toggleRatingFilter = (rating: number) => {
    setRatingFilter(ratingFilter === rating ? null : rating)
  }

  const filteredReviews = ratingFilter 
    ? reviews.filter(review => review.rating === ratingFilter)
    : reviews

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
                onClick={fetchReviews}
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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Отзывы о курсе
          </h1>
        </div>

        {/* Stats */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Средняя оценка
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {averageRating}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Всего отзывов
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {reviews.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Распределение
                  </span>
                </div>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const isActive = ratingFilter === stars
                    const count = ratingDistribution[stars as keyof typeof ratingDistribution]
                    return (
                      <div 
                        key={stars} 
                        className={`flex items-center justify-between cursor-pointer rounded-md p-1 transition-colors ${
                          isActive 
                            ? 'bg-blue-100 dark:bg-blue-900/20' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleRatingFilter(stars)}
                      >
                        <div className="flex items-center space-x-1">
                          <span className={`text-xs ${isActive ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-muted-foreground'}`}>
                            {stars}
                          </span>
                          <Star className={`h-2.5 w-2.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-400'} fill-current`} />
                        </div>
                        <div className="flex items-center space-x-1.5 flex-1 mx-2">
                          <div className="flex-1 bg-muted rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                isActive ? 'bg-blue-600 dark:bg-blue-400' : 'bg-yellow-400'
                              }`}
                              style={{ 
                                width: reviews.length > 0 
                                  ? `${(count / reviews.length) * 100}%` 
                                  : '0%' 
                              }}
                            />
                          </div>
                          <span className={`text-xs font-medium min-w-[16px] text-right ${
                            isActive ? 'text-blue-700 dark:text-blue-300' : 'text-foreground'
                          }`}>
                            {count}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Status */}
        {ratingFilter && (
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-foreground">
                Показаны отзывы с оценкой {ratingFilter} звезд
              </span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {filteredReviews.length} из {reviews.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRatingFilter(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              Сбросить фильтр
            </Button>
          </div>
        )}

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {ratingFilter ? 'Нет отзывов с такой оценкой' : 'Пока нет отзывов'}
              </h3>
              <p className="text-muted-foreground">
                {ratingFilter 
                  ? 'Попробуйте выбрать другую оценку или сбросить фильтр.'
                  : 'Отзывы появятся здесь, как только пользователи начнут их оставлять.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredReviews
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Анонимный пользователь
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ID: {review.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(review.timestamp)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Rating Stars */}
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Review Text */}
                      <div>
                        <h4 className="font-medium text-foreground mb-2">
                          Отзыв:
                        </h4>
                        <p className="text-foreground leading-relaxed">
                          {review.review}
                        </p>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
