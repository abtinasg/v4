import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { queries } from '@/lib/db/queries'
import { Sidebar, SidebarProvider } from '@/components/dashboard/Sidebar'
import { MainContent } from '@/components/dashboard/MainContent'
import { Topbar } from '@/components/dashboard/Topbar'
import { AIChatWrapper } from '@/components/ai'

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
  
  // If user doesn't exist in DB, they'll be created by the webhook
  // For now, we'll just show their Clerk data
  const displayName = user ? 
    user.email : 
    (clerkUser.emailAddresses[0]?.emailAddress || 'User')

  const subscriptionTier = user?.subscriptionTier || 'free'

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
        {/* Sidebar - Fixed on desktop, overlay on mobile */}
        <Sidebar subscriptionTier={subscriptionTier} />

        {/* Main Content - with dynamic margin for sidebar on desktop, full width on mobile */}
        <MainContent>
          {/* Header - Sticky */}
          <div className="sticky top-0 z-40">
            <Topbar subscriptionTier={subscriptionTier} />
          </div>

          {/* Page Content */}
          <main className="flex-1 p-3 sm:p-4 lg:p-6">
            {children}
          </main>
        </MainContent>

        {/* Floating AI Chat - Available on all dashboard pages */}
        <AIChatWrapper position="right" />
      </div>
    </SidebarProvider>
  )
}
