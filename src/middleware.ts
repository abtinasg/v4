import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

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
      return Response.redirect(signInUrl)
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

      // No cookie = redirect to onboarding
      // The onboarding page will check if user actually needs it via client-side API call
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
