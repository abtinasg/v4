import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Admin access secret - add ?access=YOUR_SECRET to access admin panel
const ADMIN_ACCESS_SECRET = process.env.ADMIN_ACCESS_SECRET || 'super-secret-admin-access-2024'
const ADMIN_ACCESS_COOKIE = 'admin_access_granted'

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/overview(.*)',
  '/watchlist(.*)',
  '/terminal(.*)',
  '/alerts(.*)',
  '/settings(.*)',
  '/onboarding(.*)',
])

// Routes that require onboarding to be completed
const requiresOnboarding = createRouteMatcher([
  '/dashboard(.*)',
  '/overview(.*)',
  '/watchlist(.*)',
  '/terminal(.*)',
  '/alerts(.*)',
  '/settings(.*)',
])

// Redirect routes - shortcuts to dashboard pages
const redirectRoutes: Record<string, string> = {
  '/stock-analysis': '/dashboard/stock-analysis',
  '/terminal-pro': '/dashboard/terminal-pro',
  '/ai-assistant': '/dashboard/ai-assistant',
  '/watchlist': '/dashboard/watchlist',
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl

  // ============ ADMIN PANEL PROTECTION ============
  // Block all access to /admin routes unless user has the secret access token
  if (pathname.startsWith('/admin')) {
    const accessToken = request.nextUrl.searchParams.get('access')
    const hasAccessCookie = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value === 'true'
    
    // If user provides correct access token, set cookie and redirect to clean URL
    if (accessToken === ADMIN_ACCESS_SECRET) {
      const cleanUrl = new URL(pathname, request.url)
      cleanUrl.searchParams.delete('access')
      const response = NextResponse.redirect(cleanUrl)
      response.cookies.set(ADMIN_ACCESS_COOKIE, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      })
      return response
    }
    
    // If no valid access cookie, return 404 (hide admin panel existence)
    if (!hasAccessCookie) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }
  }

  // Handle stock-analysis dynamic routes (e.g., /stock-analysis/AAPL -> /dashboard/stock-analysis/AAPL)
  if (pathname.startsWith('/stock-analysis/')) {
    const symbol = pathname.replace('/stock-analysis/', '')
    return NextResponse.redirect(new URL(`/dashboard/stock-analysis/${symbol}`, request.url))
  }

  // Handle static redirects
  for (const [from, to] of Object.entries(redirectRoutes)) {
    if (pathname === from) {
      return NextResponse.redirect(new URL(to, request.url))
    }
  }

  // Protect routes that require authentication
  if (isProtectedRoute(request)) {
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }

    // Check if user needs onboarding (only for routes that require it)
    // Skip this check for onboarding page itself and API routes
    if (requiresOnboarding(request) && !pathname.startsWith('/api/')) {
      // Check if user has onboarding_completed cookie
      const onboardingCookie = request.cookies.get('onboarding_completed')
      
      // If cookie exists and matches current user, allow access
      if (onboardingCookie?.value === userId) {
        return NextResponse.next()
      }

      // No cookie - let the page handle the check client-side
      return NextResponse.next()
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (icons, manifest, sw, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|offline\\.html|icons|splash|screenshots|logo\\.jpeg|.*\\.png$|.*\\.ico$).*)',
  ],
}
