import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { queries } from '@/lib/db/queries'
import { Sidebar, SidebarProvider } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'

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
      <div className="min-h-screen bg-[#0a0a0c]">
        {/* Sidebar - Fixed */}
        <Sidebar subscriptionTier={subscriptionTier} />

        {/* Main Content - with dynamic margin for sidebar */}
        <div className="ml-[280px] transition-all duration-300 flex flex-col min-h-screen">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-40">
            <Topbar subscriptionTier={subscriptionTier} />
          </div>

          {/* Page Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
