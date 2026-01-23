"use client"

import { useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { QuizMCQ } from "@/lib/types"
import { useProgressStore } from "@/lib/progress"

interface QuizMCQProps {
  quiz: QuizMCQ
  module: number
  section: number
  quizIndex: number
  onComplete?: () => void
}

export function QuizMCQ({ quiz, module, section, quizIndex, onComplete }: QuizMCQProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const { recordQuizAnswer } = useProgressStore()

  const handleAnswerSelect = (choice: string) => {
    if (isAnswered) return
    
    setSelectedAnswer(choice)
    const correct = choice === quiz.answer
    setIsCorrect(correct)
    setIsAnswered(true)
    
    // Record the quiz answer
    recordQuizAnswer(module, section, quizIndex, correct)
    
    if (correct && onComplete) {
      onComplete()
    }
  }

  const getChoiceStyle = (choice: string) => {
    if (!isAnswered) {
      return "hover:bg-accent hover:text-accent-foreground"
    }
    
    if (choice === quiz.answer) {
      return "bg-green-100 text-green-900 border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700"
    }
    
    if (choice === selectedAnswer && !isCorrect) {
      return "bg-red-100 text-red-900 border-red-300 dark:bg-red-900 dark:text-red-100 dark:border-red-700"
    }
    
    return "opacity-50"
  }

  return (
    <div className="space-y-4 p-7 border border-border/30 rounded-xl bg-card/50">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Вопрос</h3>
        <p className="text-sm text-muted-foreground">{quiz.question}</p>
      </div>
      
      <div className="space-y-2">
        {quiz.choices.map((choice, index) => (
          <Button
            key={index}
            variant="outline"
            className={cn(
              "w-full justify-start h-auto min-h-[44px] p-4 text-left whitespace-normal",
              getChoiceStyle(choice)
            )}
            onClick={() => handleAnswerSelect(choice)}
            disabled={isAnswered}
          >
            <div className="flex items-start gap-3 w-full">
              {isAnswered && choice === quiz.answer && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" stroke="#22c55e" strokeWidth="2" fill="none"/>
                </svg>
              )}
              {isAnswered && choice === selectedAnswer && choice !== quiz.answer && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" stroke="#ef4444" strokeWidth="2" fill="none"/>
                  <path d="m9 9 6 6" stroke="#ef4444" strokeWidth="2" fill="none"/>
                </svg>
              )}
              <span className="font-mono text-sm text-muted-foreground w-6 flex-shrink-0">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 break-words">{choice}</span>
            </div>
          </Button>
        ))}
      </div>
      
      {isAnswered && (
        <div className={cn(
          "p-3 rounded-md text-sm",
          isCorrect 
            ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100" 
            : "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100"
        )}>
          {isCorrect ? (
            <div className="flex items-center space-x-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" stroke="#22c55e" strokeWidth="2" fill="none"/>
              </svg>
              <span>Правильно! 🎉</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" stroke="#ef4444" strokeWidth="2" fill="none"/>
                <path d="m9 9 6 6" stroke="#ef4444" strokeWidth="2" fill="none"/>
              </svg>
              <span>Неправильно 😔 Правильный ответ: {quiz.answer}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
