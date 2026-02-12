"use client"

import { Search, Lock, Unlock, MessageSquare, Menu, X, LogOut, LogIn, User, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCommandMenu } from "@/lib/command-menu"
import { useProgressStore } from "@/lib/progress"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { isAdminEmail } from "@/lib/admin"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TopBarProps {
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export function TopBar({ onMobileMenuToggle, isMobileMenuOpen }: TopBarProps) {
  const { open } = useCommandMenu()
  const { isDevMode, toggleDevMode } = useProgressStore()
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isLearnPage = pathname?.startsWith('/learn') ?? false

  const handleCommandMenuOpen = () => {
    try {
      open()
    } catch (error) {
      console.warn('Failed to open command menu:', error)
    }
  }

  const handleSignOut = async () => {
    // Navigate immediately for instant feedback
    router.push('/')
    // Sign out in the background - don't block navigation
    signOut().catch((error) => {
      console.error('Error signing out:', error)
    })
  }

  const handleMobileLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    // Use router.push for more reliable navigation
    router.push('/learn')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2 flex-1 md:flex-none">
          {/* Mobile menu button - only visible on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="h-9 w-9 hover:bg-accent/50 transition-all duration-200 md:hidden flex-shrink-0"
            title={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
            <span className="sr-only hidden md:inline">{isMobileMenuOpen ? "Close menu" : "Open menu"}</span>
          </Button>
          
          {/* Desktop: clickable link */}
          <Link href="/learn" className="hidden md:flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.svg" 
              alt="Трансформер" 
              width={24} 
              height={24}
              className="object-contain"
            />
            <h1 className="text-lg font-semibold cursor-pointer text-foreground relative inline-block">
              Трансформер
              {isLearnPage && (
                <span className="absolute top-1 -right-6 text-[10px] font-normal text-white leading-none">Beta</span>
              )}
            </h1>
          </Link>
        </div>
        
        {/* Mobile: centered, clickable, 25% smaller */}
        <Link 
          href="/learn"
          onClick={handleMobileLogoClick}
          className="absolute left-1/2 top-1/2 flex md:hidden items-center touch-manipulation mobile-logo-link"
          style={{ 
            transform: 'translate(-50%, -50%) scale(0.9)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            willChange: 'transform',
            transformOrigin: 'center center',
            transition: 'none'
          }}
        >
          <Image 
            src="/logo.svg" 
            alt="Трансформер" 
            width={24} 
            height={24}
            className="object-contain mr-2 flex-shrink-0"
            priority
          />
          <h1 className="text-lg font-semibold text-foreground cursor-pointer relative inline-block whitespace-nowrap">
            Трансформер
            {isLearnPage && (
              <span className="absolute top-1 -right-6 text-[10px] font-normal text-white leading-none">Beta</span>
            )}
          </h1>
        </Link>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCommandMenuOpen}
            className="h-9 w-9 hover:bg-accent/50 transition-all duration-200"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only hidden md:inline">Open command menu</span>
          </Button>
          
          {/* Admin-only buttons - hidden on mobile */}
          {!authLoading && user && isAdminEmail(user.email) && (
            <>
              {/* Reviews Link */}
              <Link href="/admin/reviews" className="hidden md:block">
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
              
              {/* Feedback Link */}
              <Link href="/admin/feedback" className="hidden md:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-accent/50 transition-all duration-200"
                  title="View feedback"
                >
                  <Zap className="h-4 w-4" />
                  <span className="sr-only hidden md:inline">View feedback</span>
                </Button>
              </Link>
            </>
          )}
          
          {/* Authentication UI */}
          {!authLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="hidden md:inline text-xs text-foreground truncate max-w-[120px]">
                        {user.email}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Выйти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
          
          {/* Developer Mode Toggle - Admin only - hidden on mobile */}
          {!authLoading && user && isAdminEmail(user.email) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Dev mode toggle clicked, current state:', isDevMode)
                toggleDevMode()
              }}
              className={`hidden md:flex h-9 px-3 transition-all duration-200 ${
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
          )}
          
          {/* <ThemeToggle /> */}
        </div>
      </div>
    </header>
  )
}
