"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useProgressStore } from "@/lib/progress"
import { modules, getLesson, lessonContentMap } from "@/lib/content"
import { LessonPlayer } from "@/components/lesson/lesson-player"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, CheckCircle, Lock } from "lucide-react"
import { useEffect, useState } from "react"
import CourseCompletionPopup from "@/components/lesson/CourseCompletionPopup"

export default function LessonPage() {
  const router = useRouter()
  const params = useParams<{ module: string; section: string }>()
  const moduleStr = params?.module || ""
  const sectionStr = params?.section || ""
  const { completedSections, currentModule, currentSection, isDevMode, startSession, endSession, getTotalTimeSpent, getQuizScore, markSectionComplete } = useProgressStore()
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  // Parse IDs early - use 0 as fallback for invalid values
  const moduleId = moduleStr ? parseInt(moduleStr) : 0
  const sectionId = sectionStr ? parseInt(sectionStr) : 0

  // Time tracking - moved before early returns
  useEffect(() => {
    if (moduleId > 0 && sectionId > 0) {
      startSession()
      
      // Handle page unload
      const handleBeforeUnload = () => {
        endSession()
      }
      
      window.addEventListener('beforeunload', handleBeforeUnload)
      
      // Cleanup on unmount
      return () => {
        endSession()
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [moduleId, sectionId, startSession, endSession])

  // Access check and navigation - moved before early returns
  const moduleData = modules.find(m => m.id === moduleId)
  const isFirstSection = sectionId === 1
  const isCompleted = completedSections.has(`${moduleId}-${sectionId}`)
  const hasAccessToPrevious = sectionId > 1 && completedSections.has(`${moduleId}-${sectionId - 1}`)
  const hasAccess = isDevMode || isFirstSection || isCompleted || hasAccessToPrevious

  useEffect(() => {
    if (moduleId > 0 && sectionId > 0 && moduleData && !hasAccess && !isDevMode) {
      const firstIncomplete = moduleData.sections.find(section => {
        if (section.section === 1) return true
        return completedSections.has(`${moduleId}-${section.section - 1}`)
      })
      if (firstIncomplete) {
        router.replace(`/learn/${moduleId}/${firstIncomplete.section}`)
      } else {
        router.replace(`/learn/${moduleId}/1`)
      }
    }
  }, [hasAccess, isDevMode, moduleData, completedSections, moduleId, sectionId, router])

  // Handle next button click - mark current lesson as complete
  const handleNextClick = () => {
    if (moduleId > 0 && sectionId > 0) {
      markSectionComplete(moduleId, sectionId)
    }
  }

  if (!moduleStr || !sectionStr) {
    return <div>Loading...</div>
  }
  
  const lesson = getLesson(moduleId, sectionId)
  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Страница не найдена</h2>
        <p className="text-muted-foreground text-center max-w-md">Запрашиваемая страница не существует или была перемещена.</p>
        <Button asChild>
          <Link href="/">Вернуться на главную</Link>
        </Button>
      </div>
    )
  }
  
  const module = moduleData
  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Страница не найдена</h2>
        <p className="text-muted-foreground text-center max-w-md">Запрашиваемая страница не существует или была перемещена.</p>
        <Button asChild>
          <Link href="/">Вернуться на главную</Link>
        </Button>
      </div>
    )
  }
  
  const currentIndex = module.sections.findIndex(s => s.section === sectionId)
  const prevSection = currentIndex > 0 ? module.sections[currentIndex - 1] : null
  const nextSection = currentIndex < module.sections.length - 1 ? module.sections[currentIndex + 1] : null
  
  // Check if this is the last lesson of the current module
  const isLastLessonOfModule = currentIndex === module.sections.length - 1
  const nextModule = modules.find(m => m.id === moduleId + 1)
  
  // Get custom content for this lesson, or fall back to sample content
  // For lab lessons, we don't need content from lessonContentMap
  let content = ''
  if (!lesson.isLab) {
    const contentKey = `${lesson.module}-${lesson.section}`
    console.log('Loading lesson content for:', contentKey)
    console.log('Available keys:', Object.keys(lessonContentMap))
    const customContent = lessonContentMap[contentKey]
    console.log('Custom content found:', !!customContent)
    
    content = customContent || `
      <h2>Welcome to ${lesson.title}</h2>
      <p>This is a sample lesson content. In a real application, this would be loaded from MDX files with rich formatting, code examples, and interactive elements.</p>
      
      <h3>Key Concepts</h3>
      <ul>
        <li>Understanding the fundamentals</li>
        <li>Practical application</li>
        <li>Best practices</li>
      </ul>
      
      <h3>Example Code</h3>
      <p>Here's a simple example to get you started:</p>
      <pre><code>function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Learner"));</code></pre>
      
      <h3>Next Steps</h3>
      <p>After completing this lesson, you'll be ready to move on to more advanced topics. Make sure to complete the quiz below to reinforce your understanding.</p>
    `
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 pt-4 pb-8 md:py-8">
        <div className="max-w-lesson mx-auto">
          {/* Lesson Content */}
          <div className="mt-2 md:mt-4">
            <LessonPlayer lesson={lesson} content={content} module={moduleId} section={sectionId} />
          </div>
          
          {/* Navigation Controls */}
          <div className="mt-12 pt-8 border-t border-border/30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                {prevSection && (
                  <Button asChild variant="outline" className="navigation-button min-w-[120px] max-w-xs">
                    <Link href={`/learn/${moduleId}/${prevSection.section}`} className="flex items-center">
                      <ArrowLeft className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        <span className="hidden md:inline">Назад: {prevSection.title}</span>
                        <span className="md:hidden">Назад</span>
                      </span>
                    </Link>
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-4 min-w-0 flex-1 justify-end">
                {nextSection && (
                  <Button asChild variant="default" className="navigation-button min-w-[120px] max-w-xs bg-teal-600 hover:bg-teal-700 text-white hover:scale-100" onClick={handleNextClick}>
                    <Link href={`/learn/${moduleId}/${nextSection.section}`} className="flex items-center text-white">
                      <span className="truncate text-white">
                        <span className="hidden md:inline text-white">Далее: {nextSection.title}</span>
                        <span className="md:hidden text-white">Далее</span>
                      </span>
                      <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0 text-white" />
                    </Link>
                  </Button>
                )}
                
                {/* Next Module Button - Show only on last lesson of current module */}
                {isLastLessonOfModule && nextModule && (
                  <Button asChild variant="default" className="navigation-button min-w-[120px] max-w-xs bg-teal-600 hover:bg-teal-700 text-white hover:scale-100" onClick={handleNextClick}>
                    <Link href={`/learn/${nextModule.id}/1`} className="flex items-center text-white">
                      <span className="truncate text-white">К следующему модулю</span>
                      <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0 text-white" />
                    </Link>
                  </Button>
                )}
                
                {/* Course Completion Button - Show only on last lesson of last module */}
                {isLastLessonOfModule && !nextModule && (
                  <Button 
                    variant="default" 
                    className="navigation-button min-w-[120px] max-w-xs bg-teal-600 hover:bg-teal-700 text-white hover:scale-100"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleNextClick()
                      setShowCompletionModal(true)
                    }}
                  >
                    <span className="truncate text-white">Завершить курс</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Completion Modal */}
      <CourseCompletionPopup 
        isOpen={showCompletionModal} 
        onClose={() => setShowCompletionModal(false)} 
        courseData={{
          lessons: completedSections.size,
          timeSpent: getTotalTimeSpent(),
          score: `${getQuizScore()}%`
        }}
        onDownloadCertificate={() => {
          console.log('Downloading certificate...');
          // TODO: Implement certificate download
        }}
        onViewNextCourse={() => {
          // Navigate to learn page
          router.push('/learn');
        }}
      />
    </div>
  )
}
