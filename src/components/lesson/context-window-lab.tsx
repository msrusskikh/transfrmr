'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Circle, ArrowRight, Clock, AlertTriangle, Lightbulb, Zap } from 'lucide-react'

interface ConversationExchange {
  id: number
  human: string
  ai: string
  isContradiction?: boolean
}

interface ContextItem {
  id: number
  text: string
  category: string
  isSelected: boolean
}

interface Phase {
  id: number
  title: string
  description: string
  duration: string
}

const phases: Phase[] = [
  {
    id: 1,
    title: "Настройка сценария",
    description: "Познакомьтесь с ситуацией и задачей",
    duration: "1 мин"
  },
  {
    id: 2,
    title: "История разговора",
            description: "Найдите, где ИИ начал противоречить себе",
    duration: "2 мин"
  },
  {
    id: 3,
    title: "Контекстные элементы для выбора",
    description: "Выберите 3 самых важных элемента",
    duration: "3 мин"
  },
  {
    id: 4,
    title: "Шаблоны обновления контекста",
    description: "Создайте промпт для восстановления памяти",
    duration: "3 мин"
  },
  {
    id: 5,
    title: "Тестовые вопросы и ожидаемые улучшения",
    description: "Проверьте результат и извлеките уроки",
    duration: "2 мин"
  }
]

const conversationHistory: ConversationExchange[] = [
  {
    id: 1,
    human: "Мне нужно спланировать запуск CloudSync Pro. Наш бюджет — $150K, дата запуска — 15 марта, целевой рынок — средние производственные компании. Основная команда включает Сару (маркетинг), Майка (разработка) и Лизу (продажи).",
    ai: "Отлично! Я помогу вам спланировать запуск CloudSync Pro. С вашим бюджетом в $150K и дедлайном 15 марта, нацеливаясь на средние производственные компании, мы можем создать комплексную стратегию. Начнем с ключевых вех..."
  },
  {
    id: 2,
    human: "Генеральный директор сказал — никаких выставок в этом квартале из-за бюджетных ограничений от расширения офиса.",
    ai: "Понятно. Мы сосредоточимся на digital-маркетинге и прямых продажах вместо выставок, оставаясь в рамках вашего бюджета $150K для запуска CloudSync Pro 15 марта."
  },
  {
    id: 3,
    human: "Сара упомянула, что наш главный конкурент только что запустил похожий продукт за $299/месяц. Нам нужно осторожно позиционироваться.",
    ai: "Важная конкурентная информация. Нам следует рассмотреть стратегию ценообразования и точки дифференциации для CloudSync Pro, чтобы эффективно конкурировать с конкурентом по $299/месяц."
  },
  {
    id: 4,
    human: "Какие маркетинговые каналы нам приоритизировать с нашим бюджетом?",
    ai: "Для запуска CloudSync Pro, нацеленного на средние производственные компании, я рекомендую: LinkedIn-рекламу ($40K), контент-маркетинг ($25K), серию вебинаров ($15K) и email-кампании ($10K). Это держит нас в рамках бюджета $150K."
  },
  {
    id: 5,
    human: "Майк говорит, что бета-тестирование показало: наш главный дифференциатор — функция синхронизации в реальном времени, у конкурентов этого нет.",
    ai: "Превосходно! Функция синхронизации в реальном времени должна стать краеугольным камнем наших коммуникаций. Эта уникальная возможность поможет CloudSync Pro выделиться на переполненном рынке."
  },
  {
    id: 6,
    human: "Нам нужно координироваться с юридическим отделом, потому что есть новые требования соответствия для инструментов интеграции данных.",
    ai: "Хорошая мысль. Я добавлю юридический ревью в таймлайн. Юридическое соответствие критично для корпоративных продуктов интеграции данных."
  },
  {
    id: 7,
    human: "Как выглядит наш таймлайн для создания контента?",
    ai: "Для создания контента я предлагаю начать немедленно, чтобы уложиться в дедлайн. У нас должны быть готовы блог-посты, кейсы и продуктовые демо за 4 недели до запуска."
  },
  {
    id: 8,
    human: "Отдел продаж хочет знать нашу стратегию ценообразования. Что порекомендуешь?",
    ai: "Для стратегии ценообразования я рекомендую позиционироваться немного ниже конкурента — $279/месяц, чтобы захватить долю рынка, подчеркивая ваши превосходные функции."
  },
  {
    id: 9,
    human: "На самом деле, давай изучим премиум-стратегию ценообразования. Как это будет выглядеть?",
    ai: "Для премиум-позиционирования рассмотрите $349/месяц. Это позиционирует вас как high-value опцию и может увеличить воспринимаемое качество и эксклюзивность."
  },
  {
    id: 10,
    human: "Команде разработки нужно знать — стоит ли планировать большое launch-событие?",
    ai: "Абсолютно! Launch-событие создаст новостную волну и продемонстрирует возможности вашего продукта. Я предлагаю виртуальное событие для управления расходами и охвата более широкой аудитории."
  },
  {
    id: 11,
    human: "Как насчет участия в выставках для максимальной видимости?",
    ai: "Отличная идея! Выставки превосходны для B2B-продуктов. Я рекомендую забронировать стендоее пространство на ManufacturingTech Expo в феврале — это идеальный тайминг перед вашим запуском."
  },
  // [ТОЧКА ПРОТИВОРЕЧИЯ - AI ЗАБЫВАЕТ ОГРАНИЧЕНИЕ "НИКАКИХ ВЫСТАВОК"]
  {
    id: 12,
    human: "Сколько бюджета выделить на выставки?",
    ai: "Я бы предложил $60K на выставки. Это значительные инвестиции, но критично для запусков B2B-продуктов."
  }
]

const contextItems: ContextItem[] = [
  {
    id: 1,
    text: "Бюджетное ограничение: Общий бюджет запуска $150K ",
    category: "constraint",
    isSelected: false
  },
  {
    id: 2,
    text: "Дата запуска: Дедлайн 15 марта ",
    category: "timeline",
    isSelected: false
  },
  {
    id: 3,
    text: "Целевой рынок: Средние производственные компании ",
    category: "market",
    isSelected: false
  },
  {
    id: 4,
    text: "Члены команды: Сара (маркетинг), Майк (разработка), Лиза (продажи) ",
    category: "team",
    isSelected: false
  },
  {
    id: 5,
    text: "Директива генерального: никаких выставок в этом квартале ",
    category: "constraint",
    isSelected: false
  },
  {
    id: 6,
    text: "Конкурентная разведка: Ценообразование главного конкурента $299/месяц ",
    category: "competition",
    isSelected: false
  },
  {
    id: 7,
    text: "Ключевой дифференциатор: Функция синхронизации в реальном времени",
    category: "differentiator",
    isSelected: false
  },
  {
    id: 8,
    text: "Требование соответствия: Новые юридические требования для инструментов интеграции данных ",
    category: "compliance",
    isSelected: false
  }
]

const correctAnswers = [5, 1, 7] // CEO directive, budget constraint, key differentiator

interface ContextWindowLabProps {
  onComplete?: () => void
}

export default function ContextWindowLab({ onComplete }: ContextWindowLabProps) {
  const [currentPhase, setCurrentPhase] = useState(1)
  const [selectedContextItems, setSelectedContextItems] = useState<number[]>([])
  const [contextRefreshPrompt, setContextRefreshPrompt] = useState('')
  const [apiResponse, setApiResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const lessonPlayerRef = useRef<HTMLDivElement>(null)


  const [selectedQuestion, setSelectedQuestion] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)

  const handleContextItemToggle = (itemId: number) => {
    if (selectedContextItems.includes(itemId)) {
      setSelectedContextItems(selectedContextItems.filter(id => id !== itemId))
    } else if (selectedContextItems.length < 3) {
      setSelectedContextItems([...selectedContextItems, itemId])
    }
  }

  const scrollToTop = () => {
    if (lessonPlayerRef.current) {
      lessonPlayerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handlePhaseComplete = () => {
    if (currentPhase < 5) {
      setCurrentPhase(currentPhase + 1)
      // Scroll to top when moving to next phase
      setTimeout(() => scrollToTop(), 100)
    }
  }

  const handlePhaseNavigation = (targetPhase: number) => {
    // Only allow going back, no skipping ahead
    if (targetPhase < currentPhase) {
      setCurrentPhase(targetPhase)
      // Scroll to top when navigating to previous phase
      setTimeout(() => scrollToTop(), 100)
    }
  }



  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement
    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 5 // 5px tolerance
    setShowScrollIndicator(!isAtBottom)
  }

  // Load/persist local state for better UX
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPrompt = localStorage.getItem('ck_lab_prompt')
      const savedQuestion = localStorage.getItem('ck_lab_question')
      const savedTemplate = localStorage.getItem('ck_lab_template')
      if (savedPrompt) setContextRefreshPrompt(savedPrompt)
      if (savedQuestion) setSelectedQuestion(savedQuestion)
      if (savedTemplate) setSelectedTemplate(parseInt(savedTemplate))
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ck_lab_prompt', contextRefreshPrompt)
      localStorage.setItem('ck_lab_question', selectedQuestion)
      if (selectedTemplate) localStorage.setItem('ck_lab_template', selectedTemplate.toString())
    }
  }, [contextRefreshPrompt, selectedQuestion, selectedTemplate])

  // Reset scroll indicator when phase changes
  useEffect(() => {
    setShowScrollIndicator(true)
  }, [currentPhase])

  const handlePromptSubmit = async () => {
    if (!contextRefreshPrompt.trim() || !selectedQuestion.trim()) return
    
    setIsLoading(true)
    setApiResponse('')
    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contextPrompt: contextRefreshPrompt, 
          testQuestion: selectedQuestion, 
          model: 'gpt-4o-mini' 
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.details || 'API error')
      }
      const data = await res.json()
      const responseContent = data?.content || ''
      
      // Validate and clean the response
      if (responseContent && typeof responseContent === 'string') {
        setApiResponse(responseContent.trim())
      handlePhaseComplete()
        
        // Scroll to top of lesson player when moving to final phase
        setTimeout(() => scrollToTop(), 200)
      } else {
        throw new Error('Invalid response format from API')
      }
    } catch (e) {
      console.error('API call error:', e)
      const errorMessage = e instanceof Error && e.message.includes('Invalid response format') 
        ? 'Получен неверный формат ответа от API. Попробуйте ещё раз.'
        : 'Ошибка вызова API. Проверьте ключ и попробуйте ещё раз.'
      setApiResponse(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const renderPhase1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Добро пожаловать в самый важный продуктовый запуск этого года в TechFlow Inc!</h2>
        <p className="text-lg text-muted-foreground">
          Вы — проджект-менеджер CloudSync Pro, новой корпоративной платформы для интеграции данных. За последний час вы планировали запуск с вашим ИИ-ассистентом, но что-то пошло не так...
        </p>
      </div>
      
  

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Описание сценария:</h3>
          <p className="text-muted-foreground mb-4">
            ИИ начал отлично, помогая вам планировать таймлайн, бюджет и назначения в команде. Но по мере того, как разговор становился длиннее, он начал противоречить более ранним решениям и 'забывать' ключевые ограничения.
          </p>
          <p className="text-muted-foreground">
            Это классический случай ограничений контекстного окна — давайте это исправим!
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderPhase2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">История разговора</h2>
        <p className="text-muted-foreground">
          Просмотрите историю разговора и найдите, где ИИ начал противоречить себе
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">История разговора:</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto relative" onScroll={handleScroll}>
            {conversationHistory.map((exchange) => (
              <div key={exchange.id} className="space-y-3 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300 flex-shrink-0">
                    {exchange.id}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Вы:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{exchange.human}</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">ИИ:</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{exchange.ai}</p>
                    </div>
                    {/* Contradiction warning for exchanges 11-12 - positioned below AI bubble */}
                    {(exchange.id === 11 || exchange.id === 12) && (
                      <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm ml-11">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">ПРОТИВОРЕЧИЕ</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Scroll indicator */}
            {showScrollIndicator && (
              <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-100 via-white/80 dark:via-gray-100/80 to-transparent h-8 flex items-center justify-center pointer-events-none">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground/70">
                  <div className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                Что произошло?
              </h3>
              <p className="text-amber-800 dark:text-amber-200">
                В обменах 11-12 ИИ полностью забыл директиву генерального директора о запрете выставок и предложил 
                выделить еще $60K на выставки, что превышает общий бюджет в $150K!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPhase3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Какую информацию спасаем?</h2>
        <p className="text-muted-foreground">
          Выберите три ключевых элемента из списка ниже, о которых точно нужно напомнить ИИ
        </p>
      </div>


      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contextItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleContextItemToggle(item.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedContextItems.includes(item.id)
                    ? correctAnswers.includes(item.id)
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20' // Correct choice
                      : 'border-red-500 bg-red-50 dark:bg-red-950/20' // Incorrect choice
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {selectedContextItems.includes(item.id) ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={correctAnswers.includes(item.id) ? "#22c55e" : "#ef4444"} strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" stroke={correctAnswers.includes(item.id) ? "#22c55e" : "#ef4444"} strokeWidth="2" fill="none"/>
                      </svg>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Выбрано: {selectedContextItems.length}/3
            </p>
          </div>
        </CardContent>
      </Card>


    </div>
  )

  const renderPhase4 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Шаблоны спасения контекста</h2>
        <p className="text-muted-foreground">
          Выберите один из шаблонов восстановления контекста, добавьте тестовый вопрос и отправьте этот промпт ChatGPT, чтобы оценить результат
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Варианты шаблонов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              💡 Нажмите на шаблон, чтобы выбрать его и автоматически заполнить поле промпта
            </div>
            <div className="space-y-3">
              <div 
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 relative ${
                  selectedTemplate === 1 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent hover:border-primary/30'
                }`}
                onClick={() => {
                  setContextRefreshPrompt(`Обновление контекста: Планирование запуска CloudSync Pro

КЛЮЧЕВЫЕ ОГРАНИЧЕНИЯ:
- Бюджет: $150K
- Запуск: 15 марта
- Директива генерального директора: НИКАКИХ ВЫСТАВОК в этом квартале
- ЦА: Средние производственные компании

УСТАНОВЛЕННЫЕ РЕШЕНИЯ:
- Синхронизация в реальном времени — наш уникальный дифференциатор
- Фокус на digital-маркетинге (LinkedIn, контент, вебинары)
- Команда: Сара (маркетинг), Майк (разработка), Лиза (продажи)

ТЕКУЩИЙ ВОПРОС: [ваш вопрос]`)
                  setSelectedTemplate(1)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    
                    <p className="text-xs text-muted-foreground">
                      Обновление контекста с ключевыми элементами
                    </p>
                  </div>
                  {selectedTemplate === 1 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" className="flex-shrink-0 ml-2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"/>
                    </svg>
                  )}
                </div>
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground mt-2 bg-white dark:bg-gray-900 p-2 rounded">
{`Обновление контекста: Планирование запуска CloudSync Pro

КЛЮЧЕВЫЕ ОГРАНИЧЕНИЯ:
- Бюджет: $150K всего
- Запуск: 15 марта
- Директива генерального директора: НИКАКИХ выставок в этом квартале
- Цель: Средние производственные компании

УСТАНОВЛЕННЫЕ РЕШЕНИЯ:
- Синхронизация в реальном времени — наш уникальный дифференциатор
- Фокус на digital-маркетинге (LinkedIn, контент, вебинары)
- Команда: Сара (маркетинг), Майк (разработка), Лиза (продажи)

ТЕКУЩИЙ ВОПРОС: [ваш вопрос]`}</pre>
              </div>
              <div 
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 relative ${
                  selectedTemplate === 2 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent hover:border-primary/30'
                }`}
                onClick={() => {
                  setContextRefreshPrompt(`Быстрый сброс контекста:

• Общий бюджет: $150K (не $60K+ только на события)
• НИКАКИХ ВЫСТАВОК — директива генерального директора из-за расходов на расширение офиса
• Дата запуска: 15 марта для CloudSync Pro
• Наш дифференциатор: Синхронизация в реальном времени (у конкурентов этого нет)
• Целевой рынок: Средние производственные компании

Теперь, с учетом этого контекста: [ваш вопрос]`)
                  setSelectedTemplate(2)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    
                    <p className="text-xs text-muted-foreground">
                      Быстрый сброс контекста с ключевыми элементами
                    </p>
                  </div>
                  {selectedTemplate === 2 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" className="flex-shrink-0 ml-2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"/>
                    </svg>
                  )}
                </div>
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground mt-2 bg-white dark:bg-gray-900 p-2 rounded">
{`Быстрый сброс контекста:

• Общий бюджет: $150K (не $60K+ только на события)
• НИКАКИХ ВЫСТАВОК — директива генерального директора из-за расходов на расширение офиса
• Дата запуска: 15 марта
• Наш дифференциатор: Синхронизация в реальном времени (у конкурентов этого нет)
• Целевой рынок: Средние производственные компании

Теперь, с учетом этого контекста: [ваш вопрос]`}</pre>
              </div>
              <div 
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 relative ${
                  selectedTemplate === 3 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent hover:border-primary/30'
                }`}
                onClick={() => {
                  setContextRefreshPrompt(`Предыдущий контекст: Мы запускаем CloudSync Pro (интеграция данных) 15 марта с бюджетом $150K, нацеливаясь на средние производственные компании. Генеральный директор конкретно запретил выставки в этом квартале из-за расходов на расширение офиса. Наш главный дифференциатор — возможность синхронизации в реальном времени.

Учитывая эти ограничения: [ваш вопрос]`)
                  setSelectedTemplate(3)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    
                    <p className="text-xs text-muted-foreground">
                      Пояснение контекста с ключевыми элементами
                    </p>
                  </div>
                  {selectedTemplate === 3 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" className="flex-shrink-0 ml-2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"/>
                    </svg>
                  )}
                </div>
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground mt-2 bg-white dark:bg-gray-900 p-2 rounded">
{`Предыдущий контекст: Мы запускаем CloudSync Pro (интеграция данных) 15 марта с бюджетом $150K, нацеливаясь на средние производственные компании. Генеральный директор конкретно запретил выставки в этом квартале из-за расходов на расширение офиса. Наш главный дифференциатор — возможность синхронизации в реальном времени.

Учитывая эти ограничения: [ваш вопрос]`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ваш промпт</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTemplate && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Выбран шаблон {selectedTemplate}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedTemplate === 1 ? 'Обновление контекста с ключевыми элементами' :
                       selectedTemplate === 2 ? 'Быстрый сброс контекста с ключевыми элементами' :
                       'Пояснение контекста с ключевыми элементами'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-3 block">Добавьте тестовый вопрос</label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setSelectedQuestion("Какие маркетинговые активности нам приоритизировать для максимального результата?")}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedQuestion === "Какие маркетинговые активности нам приоритизировать для максимального результата?"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {selectedQuestion === "Какие маркетинговые активности нам приоритизировать для максимального результата?" ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="m9 12 2 2 4-4" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"/>
                        </svg>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Какие маркетинговые активности нам приоритизировать для максимального результата?</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedQuestion("Как нам распределить оставшийся маркетинговый бюджет?")}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedQuestion === "Как нам распределить оставшийся маркетинговый бюджет?"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {selectedQuestion === "Как нам распределить оставшийся маркетинговый бюджет?" ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="m9 12 2 2 4-4" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"/>
                        </svg>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Как нам распределить оставшийся маркетинговый бюджет?</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedQuestion("Какое резюме нашей go-to-market стратегии?")}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedQuestion === "Какое резюме нашей go-to-market стратегии?"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {selectedQuestion === "Какое резюме нашей go-to-market стратегии?" ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="m9 12 2 2 4-4" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"/>
                        </svg>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Какое резюме нашей go-to-market стратегии?</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <Textarea
              placeholder="Введите ваш промпт для обновления контекста..."
              value={contextRefreshPrompt}
              onChange={(e) => setContextRefreshPrompt(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="space-y-3">
            <Button 
              onClick={handlePromptSubmit}
              disabled={!contextRefreshPrompt.trim() || !selectedQuestion.trim() || isLoading}
              className="w-full"
            >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Отправка...
                  </>
                ) : (
                  <>
                    Отправить промпт
              <Zap className="ml-2 h-4 w-4" />
                  </>
                )}
            </Button>
              

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderPhase5 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Тестовые вопросы и ожидаемые улучшения</h2>
        <p className="text-muted-foreground">
          Посмотрите, как ваш промпт улучшил ответы ИИ
        </p>
      </div>

      <div className="space-y-6">
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-lg text-red-900 dark:text-red-100">
              До обновления контекста:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800 dark:text-red-200">
              ИИ может предлагать выставки, игнорировать бюджетные ограничения или пропускать ключевые дифференциаторы.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-lg text-green-900 dark:text-green-100">
              После обновления контекста:
              
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apiResponse ? (
              <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <div className={`p-6 rounded-lg border shadow-sm transition-all duration-200 ${
                  apiResponse.includes('Ошибка') || apiResponse.includes('неверный формат')
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                    : 'bg-white dark:bg-gray-900 border-green-200 dark:border-green-800'
                }`}>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${
                      apiResponse.includes('Ошибка') || apiResponse.includes('неверный формат')
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }`}></div>
                    <span className={`text-xs font-medium uppercase tracking-wide ${
                      apiResponse.includes('Ошибка') || apiResponse.includes('неверный формат')
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-green-700 dark:text-green-300'
                    }`}>
                      {apiResponse.includes('Ошибка') || apiResponse.includes('неверный формат') ? 'Ошибка' : 'Ответ ИИ'}
                    </span>
                  </div>
                  <div className={`text-sm leading-relaxed prose prose-sm max-w-none max-h-96 overflow-y-auto scrollbar-thin relative ${
                    apiResponse.includes('Ошибка') || apiResponse.includes('неверный формат')
                      ? 'text-red-800 dark:text-red-200 scrollbar-thumb-red-300 scrollbar-track-red-100 dark:scrollbar-thumb-red-600 dark:scrollbar-track-red-900/20'
                      : 'text-green-800 dark:text-green-200 scrollbar-thumb-green-300 scrollbar-track-green-100 dark:scrollbar-thumb-green-600 dark:scrollbar-track-green-900/20'
                  }`}
                  onScroll={(e) => {
                    const target = e.target as HTMLDivElement
                    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 5
                    const scrollIndicator = target.querySelector('.scroll-indicator')
                    if (scrollIndicator) {
                      scrollIndicator.classList.toggle('opacity-0', isAtBottom)
                    }
                  }}>
                    {apiResponse.includes('Ошибка') || apiResponse.includes('неверный формат') ? (
                      <div className="space-y-3">
                        <p>{apiResponse}</p>
                        <Button 
                          onClick={() => setApiResponse('')}
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          Очистить ошибку
                        </Button>
                      </div>
                    ) : (
                      apiResponse.split('\n').map((line, index) => {
                        const trimmedLine = line.trim()
                        if (!trimmedLine) return <div key={index} className="mb-1">&nbsp;</div>
                        
                        // Enhanced markdown detection
                        const isHeading1 = /^#\s/.test(trimmedLine)
                        const isHeading2 = /^##\s/.test(trimmedLine)
                        const isHeading3 = /^###\s/.test(trimmedLine)
                        const isHeading = isHeading1 || isHeading2 || isHeading3
                        const isNumberedList = /^\d+\.\s/.test(trimmedLine)
                        const isBulletList = /^[\•\-\*]\s/.test(trimmedLine)
                        const isSubBullet = /^\s+[\•\-\*]\s/.test(trimmedLine)
                        const isBold = /\*\*(.*?)\*\*/.test(trimmedLine)
                        const isItalic = /\*(.*?)\*/.test(trimmedLine)
                        const isCode = /`(.*?)`/.test(trimmedLine)
                        
                        // Determine styling and content
                        let className = 'mb-2'
                        let content: string | JSX.Element | (string | JSX.Element)[] = trimmedLine
                        
                        if (isHeading1) {
                          className = 'text-xl font-bold text-green-900 dark:text-green-100 mb-4 mt-6 first:mt-0'
                          content = trimmedLine.replace(/^#\s/, '')
                        } else if (isHeading2) {
                          className = 'text-lg font-bold text-green-900 dark:text-green-100 mb-3 mt-5'
                          content = trimmedLine.replace(/^##\s/, '')
                        } else if (isHeading3) {
                          className = 'text-base font-bold text-green-900 dark:text-green-100 mb-3 mt-4'
                          content = trimmedLine.replace(/^###\s/, '')
                        } else if (isNumberedList) {
                          className = 'ml-6 mb-2 flex items-start'
                          content = (
                            <>
                              <span className="text-green-600 dark:text-green-400 font-medium mr-2 flex-shrink-0">
                                {trimmedLine.match(/^\d+\./)?.[0]}
                              </span>
                              <span>{trimmedLine.replace(/^\d+\.\s/, '')}</span>
                            </>
                          )
                        } else if (isBulletList) {
                          className = 'ml-6 mb-2 flex items-start'
                          content = (
                            <>
                              <span className="text-green-600 dark:text-green-400 mr-2 flex-shrink-0">•</span>
                              <span>{trimmedLine.replace(/^[\•\-\*]\s/, '')}</span>
                            </>
                          )
                        } else if (isSubBullet) {
                          className = 'ml-12 mb-2 flex items-start'
                          content = (
                            <>
                              <span className="text-green-600 dark:text-green-400 mr-2 flex-shrink-0">◦</span>
                              <span>{trimmedLine.replace(/^\s+[\•\-\*]\s/, '')}</span>
                            </>
                          )
                        }
                        
                        // Process inline markdown formatting
                        const processInlineMarkdown = (text: string) => {
                          const parts = []
                          let currentIndex = 0
                          
                          // Process **bold** text
                          const boldRegex = /\*\*(.*?)\*\*/g
                          let boldMatch
                          while ((boldMatch = boldRegex.exec(text)) !== null) {
                            if (boldMatch.index > currentIndex) {
                              parts.push(text.slice(currentIndex, boldMatch.index))
                            }
                            parts.push(
                              <strong key={`bold-${currentIndex}`} className="font-bold">
                                {boldMatch[1]}
                              </strong>
                            )
                            currentIndex = boldMatch.index + boldMatch[0].length
                          }
                          
                          // Process *italic* text
                          const italicRegex = /\*(.*?)\*/g
                          let italicMatch
                          while ((italicMatch = italicRegex.exec(text)) !== null) {
                            if (italicMatch.index > currentIndex) {
                              parts.push(text.slice(currentIndex, italicMatch.index))
                            }
                            parts.push(
                              <em key={`italic-${currentIndex}`} className="italic">
                                {italicMatch[1]}
                              </em>
                            )
                            currentIndex = italicMatch.index + italicMatch[0].length
                          }
                          
                          // Process `code` text
                          const codeRegex = /`(.*?)`/g
                          let codeMatch
                          while ((codeMatch = codeRegex.exec(text)) !== null) {
                            if (codeMatch.index > currentIndex) {
                              parts.push(text.slice(currentIndex, codeMatch.index))
                            }
                            parts.push(
                              <code key={`code-${currentIndex}`} className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                                {codeMatch[1]}
                              </code>
                            )
                            currentIndex = codeMatch.index + codeMatch[0].length
                          }
                          
                          // Add remaining text
                          if (currentIndex < text.length) {
                            parts.push(text.slice(currentIndex))
                          }
                          
                          return parts.length > 0 ? parts : text
                        }
                        
                        // Apply inline markdown processing to string content
                        if (typeof content === 'string') {
                          content = processInlineMarkdown(content)
                        }
                        
                        return (
                          <div key={index} className={className}>
                            {content}
                          </div>
                        )
                      })
                    )}
                    
                    {/* Scroll indicator */}
                    <div className="scroll-indicator sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent h-8 flex items-center justify-center pointer-events-none transition-opacity duration-200">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground/70">
                        <div className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  {isLoading ? (
                    <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Lightbulb className="w-8 h-8 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                  {isLoading ? 'Обработка запроса...' : 'Ожидание ответа от ИИ...'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  ИИ должен уважать ограничение "никаких выставок", работать в рамках бюджета $150K, подчеркивать дифференциатор синхронизации в реальном времени и предлагать подходящие digital-альтернативы.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
            🎯 Показатели успеха и выводы
          </h3>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-gray-900 dark:bg-gray-100 rounded-full mt-2 flex-shrink-0"></div>
              <span>ИИ избегает упоминания выставок</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-gray-900 dark:bg-gray-100 rounded-full mt-2 flex-shrink-0"></div>
              <span>Бюджетные рекомендации остаются в рамках $150K</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-gray-900 dark:bg-gray-100 rounded-full mt-2 flex-shrink-0"></div>
              <span>Дифференциатор синхронизации в реальном времени выделяется</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-gray-900 dark:bg-gray-100 rounded-full mt-2 flex-shrink-0"></div>
              <span>Предложения соответствуют фокусу на digital-маркетинге</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Примените к вашей работе:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">🐘 Ешьте слона по частям</h4>
              <p className="text-sm text-muted-foreground">
              Разбивайте большие задачи на составные и проводите по ним отдельные сессии, задавая ИИ общий контекст в каждом диалоге
              </p>
            </div>
        
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">🎯 Правило трёх предложений</h4>
              <p className="text-sm text-muted-foreground">
              Если не можете объяснить текущий контекст в 3 предложениях, упростите или разбейте задачу на части
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">⏰ Таймер распада контекста</h4>
              <p className="text-sm text-muted-foreground">
              После 30+ обменов считайте, что ИИ забыл ваш первоначальный бриф — время для обновления
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">💾 Контекстные шаблоны</h4>
              <p className="text-sm text-muted-foreground">
              Создавайте сохранённые заготовки типа: "Краткий контекст: Мы разрабатываем X для Y, текущий блокер - Z"
              </p>
            </div>
        
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 1: return renderPhase1()
      case 2: return renderPhase2()
      case 3: return renderPhase3()
      case 4: return renderPhase4()
      case 5: return renderPhase5()
      default: return renderPhase1()
    }
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl" ref={lessonPlayerRef}>
      <div className="space-y-8">
        {/* Header - Removed duplicate display */}

        {/* Progress Bar - Removed as requested */}
        {/* <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Прогресс</span>
                <span>{currentPhase}/5</span>
              </div>
              <Progress value={(currentPhase / 5) * 100} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                {phases.map((phase) => (
                  <div 
                    key={phase.id} 
                    className={`text-center cursor-pointer transition-all duration-200 ${
                      phase.id <= currentPhase 
                        ? 'opacity-100' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => phase.id <= currentPhase && handlePhaseNavigation(phase.id)}
                  >
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                      phase.id <= currentPhase
                        ? phase.id < currentPhase
                          ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                          : 'bg-primary text-primary-foreground'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {phase.id < currentPhase ? <CheckCircle className="w-4 h-4" /> : phase.id}
                    </div>
                    <p className="font-medium">{phase.title}</p>
                    <p className="text-xs">{phase.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Current Phase Content */}
        {renderCurrentPhase()}

        {/* Navigation */}
        {currentPhase < 5 && (
          <div className="flex justify-center space-x-4">
            {currentPhase > 1 && (
              <Button 
                onClick={() => handlePhaseNavigation(currentPhase - 1)}
                variant="outline"
                className="px-8"
              >
                Назад
                <ArrowRight className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            )}
            <Button 
              onClick={handlePhaseComplete}
              className="px-8"
            >
              Следующий этап
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Lab Completion */}
        {currentPhase === 5 && (
          <div className="text-center space-y-4">
            <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 p-6">
                              <div className="flex items-center justify-center space-x-3 mb-4">
                  
                  <h3 className="text-xl font-semibold text-green-900 dark:text-green-100">
                    🎉 &nbsp;&nbsp;Лабораторная работа завершена!&nbsp;&nbsp; 🎉
                  </h3>
                </div>
              <p className="text-green-800 dark:text-green-200">
                Поздравляем! Вы успешно освоили управление окном контекста ИИ.
              </p>
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={() => handlePhaseNavigation(currentPhase - 1)}
                variant="outline"
                className="px-8"
              >
                Назад
                <ArrowRight className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {/* Completion Modal - Removed since we're not using it anymore */}
        {/*
        {showCompletionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-8 max-w-md mx-4 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 mx-auto flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Поздравляем!
                </h3>
                                  <p className="text-muted-foreground">
                    Вы успешно завершили лабораторную работу по управлению окном контекста ИИ
                  </p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Научились диагностировать потерю контекста</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Освоили техники восстановления памяти ИИ</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Получили практический опыт работы с API</span>
                </div>
              </div>
              <Button 
                onClick={() => setShowCompletionModal(false)}
                className="w-full"
              >
                Продолжить обучение
              </Button>
            </div>
          </div>
        )}
        */}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500/70 rounded-full"></div>
            <span>Powered by OpenAI</span>
          </div>
        </div>
      </div>
    </div>
  )
}
