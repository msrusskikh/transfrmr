"use client"

import { Search, Lock, Unlock, MessageSquare, Menu, X, LogOut, LogIn, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCommandMenu } from "@/lib/command-menu"
import { useProgressStore } from "@/lib/progress"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

interface TopBarProps {
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export function TopBar({ onMobileMenuToggle, isMobileMenuOpen }: TopBarProps) {
  const { open } = useCommandMenu()
  const { isDevMode, toggleDevMode } = useProgressStore()
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()

  const handleCommandMenuOpen = () => {
    try {
      open()
    } catch (error) {
      console.warn('Failed to open command menu:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          {/* Mobile menu button - only visible on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="h-9 w-9 hover:bg-accent/50 transition-all duration-200 md:hidden"
            title={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
            <span className="sr-only hidden md:inline">{isMobileMenuOpen ? "Close menu" : "Open menu"}</span>
          </Button>
          
          <Link href="/learn" className="hover:opacity-80 transition-opacity">
            <h1 className="text-lg font-semibold cursor-pointer text-foreground">Трансформер</h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCommandMenuOpen}
            className="h-9 w-9 hover:bg-accent/50 transition-all duration-200"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only hidden md:inline">Open command menu</span>
          </Button>
          
          
          {/* Reviews Link */}
          <Link href="/admin/reviews">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-accent/50 transition-all duration-200"
              title="View reviews"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="sr-only hidden md:inline">View reviews</span>
            </Button>
          </Link>
          
          {/* Authentication UI */}
          {!authLoading && (
            <>
              {user ? (
                <>
                  <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-muted/30">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-foreground truncate max-w-[120px]">
                      {user.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="h-9 px-3 hover:bg-accent/50 transition-all duration-200"
                    title="Выйти"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline text-xs">Выйти</span>
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 hover:bg-accent/50 transition-all duration-200"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    <span className="text-xs">Войти</span>
                  </Button>
                </Link>
              )}
            </>
          )}
          
          {/* Developer Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('Dev mode toggle clicked, current state:', isDevMode)
              toggleDevMode()
            }}
            className={`h-9 px-3 transition-all duration-200 ${
              isDevMode 
                ? 'bg-green-600 hover:bg-green-700 shadow-sm text-white border-green-600' 
                : 'hover:bg-accent/50'
            }`}
            title={isDevMode ? "Disable Developer Mode" : "Enable Developer Mode"}
          >
            {isDevMode ? (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                <span className="text-xs">Dev Mode</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                <span className="text-xs">Dev Mode</span>
              </>
            )}
          </Button>
          
          {/* <ThemeToggle /> */}
        </div>
      </div>
    </header>
  )
}
