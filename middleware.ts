import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getAuthCookieFromRequest } from '@/lib/auth/cookies'

const protectedRoutes = ['/learn']
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookieHeader = request.headers.get('cookie')
  const token = getAuthCookieFromRequest(cookieHeader)

  // Check if route is protected or auth route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Verify token if present
  let isValidToken = false
  if (token && process.env.JWT_SECRET) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      await jwtVerify(token, secret)
      isValidToken = true
    } catch {
      isValidToken = false
    }
  }

  // Redirect logic
  if (isProtectedRoute && !isValidToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL('/learn', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
