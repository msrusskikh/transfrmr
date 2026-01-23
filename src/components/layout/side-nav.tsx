"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useProgressStore } from "@/lib/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { modules } from "@/lib/content"
import { FeedbackDialog } from "@/components/FeedbackDialog"

interface ModuleItemProps {
  module: typeof modules[0]
  isExpanded: boolean
  onToggle: () => void
  onMobileMenuClose?: () => void
}

function ModuleItem({ module, isExpanded, onToggle, onMobileMenuClose }: ModuleItemProps) {
  const pathname = usePathname()
  const { completedSections, isDevMode } = useProgressStore()
  
  const completedCount = module.sections.filter(section => 
    completedSections.has(`${module.id}-${section.section}`)
  ).length
  
  const progress = (completedCount / module.sections.length) * 100

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-full justify-between p-3 h-auto transition-all duration-200",
          "hover:bg-accent/50"
        )}
        onClick={onToggle}
      >
        <div className="flex items-start space-x-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
          )}
          <div className="flex items-center space-x-2">
            <span className="font-medium break-words leading-tight mt-0.5 text-foreground">{module.title}</span>
          </div>
        </div>
      </Button>
      
      {/* Progress indicator */}
      <div className="ml-6 mt-2">
        <div className="w-full bg-muted/30 rounded-full h-1.5">
                      <div 
              className="h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, backgroundColor: '#0d9488' }}
            />
        </div>
      </div>
      
      {isExpanded && (
        <div className="ml-6 space-y-1 md:ml-6">
          {module.sections.map((section) => {
            const isCompleted = completedSections.has(`${module.id}-${section.section}`)
            const isActive = pathname === `/learn/${module.id}/${section.section}`
            
            // Check if user has access to this lesson (same logic as in lesson page)
            const isFirstSection = section.section === 1
            const hasAccessToPrevious = section.section > 1 && completedSections.has(`${module.id}-${section.section - 1}`)
            const hasAccess = isDevMode || isFirstSection || isCompleted || hasAccessToPrevious
            
            return (
              <Link
                key={section.section}
                href={`/learn/${module.id}/${section.section}`}
                title={!hasAccess && !isDevMode ? "Complete previous lesson to unlock" : undefined}
                onClick={onMobileMenuClose}
                className={cn(
                  "flex items-start space-x-2 rounded-md px-3 py-2 transition-all duration-200 group",
                  // Apply dimming when not accessible and not in dev mode
                  !hasAccess && !isDevMode && "opacity-50 pointer-events-none",
                  // Apply hover effects only when accessible
                  hasAccess && "hover:text-foreground",
                  isActive && "bg-accent text-foreground"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0 transition-colors mt-1",
                  isCompleted 
                    ? "bg-foreground border-foreground border" 
                    : hasAccess 
                      ? "bg-background border border-muted-foreground/60 group-hover:border-foreground/60" 
                      : "bg-background border border-muted-foreground/30"
                )}></div>
                <span className="relative overflow-hidden max-w-[180px] flex-1">
                  <span className={cn(
                    "text-xs font-medium leading-tight block",
                    hasAccess ? "text-foreground" : "text-foreground/50"
                  )}>{section.title}</span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface SideNavProps {
  isMobileMenuOpen?: boolean
  onMobileMenuClose?: () => void
}

export function SideNav({ isMobileMenuOpen, onMobileMenuClose }: SideNavProps) {
  const pathname = usePathname()
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  
  // Extract current module from pathname
  const getCurrentModuleFromPath = () => {
    const match = pathname.match(/^\/learn\/(\d+)/)
    return match ? parseInt(match[1]) : null
  }
  
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  
  // Collapse all modules when on /learn main page
  useEffect(() => {
    const currentModule = getCurrentModuleFromPath()
    
    if (!currentModule) {
      // If we're on /learn (main page), collapse all modules
      setExpandedModules(new Set())
    }
  }, [pathname])
  
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

  const handleFeedbackClick = () => {
    setIsFeedbackDialogOpen(true)
    // Optionally close mobile menu when opening feedback
    if (onMobileMenuClose) {
      onMobileMenuClose()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileMenuClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        flex w-72 flex-col border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80
        fixed md:relative z-50 md:z-auto
        h-[calc(100vh-3.5rem)] md:h-full
        top-14 md:top-0
        transform transition-transform duration-300 ease-in-out
        max-w-full overflow-x-hidden mobile-sidebar
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-border/50 flex-shrink-0">
          <h2 className="text-lg font-semibold text-foreground pl-[7px]">Содержание</h2>
        </div>
        
        <ScrollArea className="flex-1 min-h-0 px-4">
          <div className="space-y-4 py-4">
            {modules.map((module) => (
              <ModuleItem
                key={module.id}
                module={module}
                isExpanded={expandedModules.has(module.id)}
                onToggle={() => toggleModule(module.id)}
                onMobileMenuClose={onMobileMenuClose}
              />
            ))}
          </div>
        </ScrollArea>
        
        {/* Feedback Button */}
        <div className="p-4 border-t border-border/50 flex-shrink-0 flex justify-center">
          <Button
            onClick={handleFeedbackClick}
            variant="outline"
            size="sm"
            className="h-9 px-3 transition-all duration-200 hover:bg-accent/50"
          >
            <span className="text-xs">Есть проблема или идея?</span>
          </Button>
        </div>
      </div>
      <FeedbackDialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen} />
    </>
  )
}

