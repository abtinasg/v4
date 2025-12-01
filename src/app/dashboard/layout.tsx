import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { queries, riskProfileQueries } from '@/lib/db/queries'
import { Sidebar, SidebarProvider } from '@/components/dashboard/Sidebar'
import { MainContent } from '@/components/dashboard/MainContent'
import { Topbar } from '@/components/dashboard/Topbar'
import { AIChatWrapper } from '@/components/ai'
import { BottomNavigation, MobileHeader } from '@/components/mobile'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the current user from Clerk
  const clerkUser = await currentUser()
  
  // Redirect to sign-in if not authenticated
  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Get or create user in database
  let user = await queries.user.getByClerkId(clerkUser.id)

  // Check onboarding status
  const cookieStore = await cookies()
  const onboardingCookie = cookieStore.get('onboarding_completed')
  
  // If no cookie OR cookie doesn't match current user, check DB
  if (!onboardingCookie || onboardingCookie.value !== clerkUser.id) {
    // Check if user exists and has completed onboarding
    if (user) {
      const hasCompletedOnboarding = await riskProfileQueries.hasCompletedOnboarding(user.id)
      if (!hasCompletedOnboarding) {
        redirect('/onboarding')
      }
      // User has completed onboarding but cookie is missing/wrong - cookie will be set on next onboarding API call
    } else {
      // New user without record - needs onboarding
      redirect('/onboarding')
    }
  }
  
  // If user doesn't exist in DB, they'll be created by the webhook
  // For now, we'll just show their Clerk data
  const displayName = user ? 
    user.email : 
    (clerkUser.emailAddresses[0]?.emailAddress || 'User')

  return (
    <SidebarProvider>
      {/* Cinematic Background */}
      <div className="fixed inset-0 bg-[#030508]">
        {/* Radial gradients for cinematic effect */}
        <div className="absolute inset-0 bg-radial-mixed" />
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative min-h-screen">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Header - Only on mobile */}
        <MobileHeader />

        {/* Main Content - Full width on mobile, adjusted for sidebar on desktop */}
        <MainContent>
          {/* Desktop Header - Hidden on mobile */}
          <div className="sticky top-0 z-40 hidden md:block">
            <Topbar />
          </div>

          {/* Page Content - extra padding bottom on mobile for bottom nav */}
          <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6 pb-20 md:pb-6">
            {children}
          </main>
        </MainContent>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />

        {/* Floating AI Chat - Hidden on mobile (use AI tab instead) */}
        <div className="hidden md:block">
          <AIChatWrapper position="right" />
        </div>
      </div>
    </SidebarProvider>
  )
}
