"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Command, ArrowRight } from "lucide-react"
import { useCommandMenu } from "@/lib/command-menu"
import { searchLessons, modules } from "@/lib/content"
import { useProgressStore } from "@/lib/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CommandMenu() {
  const { isOpen, close } = useCommandMenu()
  const router = useRouter()
  const { setCurrentLesson, completedSections, isDevMode } = useProgressStore()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ReturnType<typeof searchLessons>>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const resultsContainerRef = React.useRef<HTMLDivElement>(null)

  const scrollToSelected = () => {
    if (resultsContainerRef.current) {
      const selectedElement = resultsContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }
    }
  }

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchLessons(query)
      setResults(searchResults)
      setSelectedIndex(0)
    } else {
      setResults([])
    }
  }, [query])

  useEffect(() => {
    scrollToSelected()
  }, [selectedIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => 
            prev < results.length - 1 ? prev + 1 : 0
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => 
            prev > 0 ? prev - 1 : results.length - 1
          )
          break
        case "Enter":
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          close()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, results, selectedIndex, close])

  const handleSelectResult = (result: typeof results[0]) => {
    // Check if user has access to this lesson (bypass if dev mode is enabled)
    const module = modules.find(m => m.id === result.module);
    if (!module) return;
    
    const isFirstSection = result.section === 1;
    const isCompleted = completedSections.has(`${result.module}-${result.section}`);
    const hasAccessToPrevious = result.section > 1 && completedSections.has(`${result.module}-${result.section - 1}`);
    const hasAccess = isDevMode || isFirstSection || isCompleted || hasAccessToPrevious;
    
    if (hasAccess) {
      setCurrentLesson(result.module, result.section);
      router.push(`/learn/${result.module}/${result.section}`);
      close();
      setQuery("");
    } else {
      // Find the first accessible lesson in this module
      const firstAccessible = module.sections.find(section => {
        if (section.section === 1) return true;
        return completedSections.has(`${result.module}-${section.section - 1}`);
      });
      
      if (firstAccessible) {
        setCurrentLesson(result.module, firstAccessible.section);
        router.push(`/learn/${result.module}/${firstAccessible.section}`);
        close();
        setQuery("");
      }
    }
  }

  const handleClose = () => {
    close()
    setQuery("")
    setResults([])
    setSelectedIndex(0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] p-0 dark:bg-card/95 dark:backdrop-blur-xl dark:border-border/50 dark:shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b dark:border-border/30">
          <DialogTitle className="flex items-center space-x-2 dark:text-foreground">
            <Command className="h-5 w-5 dark:text-foreground" />
            <span>Поиск по урокам</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
            <Input
              placeholder="Поиск уроков..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 dark:bg-input/50 dark:border-border/50 dark:focus:border-ring/50 dark:focus:ring-ring/20"
              autoFocus
            />
          </div>
          
          {query && (
            <div 
              ref={resultsContainerRef}
              className="mt-4 max-h-80 overflow-y-auto dark:space-y-0.5 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent dark:scrollbar-thumb-muted-foreground/20"
            >
              {results.length > 0 ? (
                <div className="space-y-1 dark:space-y-0.5">
                  {results.map((result, index) => (
                  <Button
                    key={`${result.module}-${result.section}`}
                    data-index={index}
                    variant="ghost"
                    style={{ outline: 'none', boxShadow: 'none' }}
                    className={cn(
                      "w-full justify-between h-auto p-3 min-w-0 group transition-colors duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0 outline-none ring-0 ring-offset-0",
                      index === selectedIndex 
                        ? "bg-accent dark:bg-accent/80" 
                        : "hover:bg-accent/40 dark:hover:bg-accent/40 dark:rounded-md"
                    )}
                    onClick={() => handleSelectResult(result)}
                  >
                    <div className="flex-1 text-left min-w-0 overflow-hidden pr-4">
                      <div className="font-medium max-w-[280px] relative overflow-hidden dark:text-foreground">
                        <div className="truncate">{result.title}</div>
                        <div className={cn(
                          "absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l to-transparent pointer-events-none transition-opacity duration-200",
                          index === selectedIndex 
                            ? "from-[hsl(var(--accent))] dark:from-accent/60 opacity-100"
                            : "from-[hsl(var(--background))] dark:from-card/95 group-hover:opacity-0"
                        )}></div>
                        <div className={cn(
                          "absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[hsl(var(--accent))] to-transparent pointer-events-none transition-opacity duration-200 dark:from-accent/40",
                          index === selectedIndex 
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        )}></div>
                      </div>
                      <div className="text-sm text-muted-foreground max-w-[280px] break-words overflow-hidden relative dark:text-muted-foreground/80">
                        <div className="line-clamp-2">{result.summary}</div>
                        <div className={cn(
                          "absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l to-transparent pointer-events-none transition-opacity duration-200",
                          index === selectedIndex 
                            ? "from-[hsl(var(--accent))] dark:from-accent/60 opacity-100"
                            : "from-[hsl(var(--background))] dark:from-card/95 group-hover:opacity-0"
                        )}></div>
                        <div className={cn(
                          "absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[hsl(var(--accent))] to-transparent pointer-events-none transition-opacity duration-200 dark:from-accent/40",
                          index === selectedIndex 
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        )}></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground flex-shrink-0 min-w-[80px] justify-end dark:text-muted-foreground/70">
                      <span className="font-medium whitespace-nowrap">Модуль {result.module}</span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 dark:text-muted-foreground/60" />
                    </div>
                  </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground dark:text-muted-foreground/70">
                  Уроки не найдены для "{query}"
                </div>
              )}
            </div>
          )}
          
          {!query && (
            <div className="mt-8 text-center text-muted-foreground dark:text-muted-foreground/70">
              <p className="text-sm dark:text-foreground/60">Введите текст для поиска по урокам</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

