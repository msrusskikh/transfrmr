'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

const fontOptions = [
  {
    id: 'inter',
    name: 'Inter',
    className: 'font-inter',
    description: 'Современный, высокочитаемый шрифт для интерфейсов',
    cyrillicSupport: 'Отличная поддержка кириллицы'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    className: 'font-roboto',
    description: 'Классический шрифт Google с превосходной читаемостью',
    cyrillicSupport: 'Полная поддержка кириллицы'
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    className: 'font-open-sans',
    description: 'Чистый и дружелюбный шрифт для веб-приложений',
    cyrillicSupport: 'Хорошая поддержка кириллицы'
  },
  {
    id: 'source-sans-pro',
    name: 'Source Sans Pro',
    className: 'font-source-sans-pro',
    description: 'Элегантный шрифт Adobe с отличной типографикой',
    cyrillicSupport: 'Отличная поддержка кириллицы'
  },
  {
    id: 'noto-sans',
    name: 'Noto Sans',
    className: 'font-noto-sans',
    description: 'Универсальный шрифт Google для всех языков',
    cyrillicSupport: 'Идеальная поддержка кириллицы'
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    description: 'Современный шрифт с уникальным характером',
    cyrillicSupport: 'Хорошая поддержка кириллицы'
  },
  {
    id: 'pt-sans',
    name: 'PT Sans',
    description: 'Шрифт ПараТайп, специально созданный для кириллицы',
    cyrillicSupport: 'Идеальная поддержка кириллицы'
  },
  {
    id: 'fira-sans',
    name: 'Fira Sans',
    description: 'Шрифт Mozilla с отличной читаемостью на экранах',
    cyrillicSupport: 'Хорошая поддержка кириллицы'
  },
  {
    id: 'work-sans',
    name: 'Work Sans',
    description: 'Современный геометрический шрифт',
    cyrillicSupport: 'Базовая поддержка кириллицы'
  },
  {
    id: 'ibm-plex-sans',
    name: 'IBM Plex Sans',
    description: 'Корпоративный шрифт IBM с чистым дизайном',
    cyrillicSupport: 'Хорошая поддержка кириллицы'
  }
]

const sampleText = "Трансформер - это революционная платформа обучения с искусственным интеллектом, которая адаптируется к каждому студенту."

export default function FontsPage() {
  const [selectedFont, setSelectedFont] = useState('inter')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-foreground">Выбор шрифта</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-semibold text-foreground leading-tight">
              Выберите идеальный шрифт
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Каждый шрифт оптимизирован для кириллицы и следует принципам дизайна OpenAI
            </p>
          </div>

          {/* Font Preview Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-medium text-foreground text-center">
              Предварительный просмотр
            </h2>
            
            <div className="bg-card rounded-xl border border-border/50 p-8 shadow-sm">
              <div className="text-center space-y-6">
                <h3 className={`text-3xl font-medium text-foreground leading-tight ${
                  selectedFont === 'inter' ? 'font-inter' :
                  selectedFont === 'roboto' ? 'font-roboto' :
                  selectedFont === 'open-sans' ? 'font-open-sans' :
                  selectedFont === 'source-sans-pro' ? 'font-source-sans-pro' :
                  selectedFont === 'noto-sans' ? 'font-noto-sans' :
                  selectedFont === 'ubuntu' ? 'font-ubuntu' :
                  selectedFont === 'pt-sans' ? 'font-pt-sans' :
                  selectedFont === 'fira-sans' ? 'font-fira-sans' :
                  selectedFont === 'work-sans' ? 'font-work-sans' :
                  selectedFont === 'ibm-plex-sans' ? 'font-ibm-plex-sans' : 'font-inter'
                }`}>
                  Трансформер
                </h3>
                <p className={`text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto ${
                  selectedFont === 'inter' ? 'font-inter' :
                  selectedFont === 'roboto' ? 'font-roboto' :
                  selectedFont === 'open-sans' ? 'font-open-sans' :
                  selectedFont === 'source-sans-pro' ? 'font-source-sans-pro' :
                  selectedFont === 'noto-sans' ? 'font-noto-sans' :
                  selectedFont === 'ubuntu' ? 'font-ubuntu' :
                  selectedFont === 'pt-sans' ? 'font-pt-sans' :
                  selectedFont === 'fira-sans' ? 'font-fira-sans' :
                  selectedFont === 'work-sans' ? 'font-work-sans' :
                  selectedFont === 'ibm-plex-sans' ? 'font-ibm-plex-sans' : 'font-inter'
                }`}>
                  {sampleText}
                </p>
              </div>
            </div>
          </div>

          {/* Font Selection Grid */}
          <div className="space-y-8">
            <h2 className="text-2xl font-medium text-foreground text-center">
              Доступные шрифты
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {fontOptions.map((font) => (
                <div
                  key={font.id}
                  className={`bg-card rounded-xl border border-border/50 p-6 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${
                    selectedFont === font.id ? 'ring-2 ring-primary ring-offset-2' : 'hover:border-border'
                  }`}
                  onClick={() => setSelectedFont(font.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-medium text-foreground">
                      {font.name}
                    </h3>
                    {selectedFont === font.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {font.description}
                    </p>
                    <p className="text-xs text-muted-foreground/70 font-medium">
                      {font.cyrillicSupport}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8">
          </div>
        </div>
      </div>
    </div>
  )
}
