import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  LineChart, 
  List, 
  Terminal, 
  Bell,
  Search,
  Settings
} from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

const navItems = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/stocks', label: 'Stocks', icon: LineChart },
  { href: '/watchlist', label: 'Watchlist', icon: List },
  { href: '/terminal', label: 'Terminal', icon: Terminal },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar - Fixed Position */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0f0f0f] border-r border-white/[0.08] z-50 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/[0.08]">
          <Link href="/overview" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Deep Terminal</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
            >
              <item.icon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Upgrade Banner */}
        <div className="p-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
            <p className="text-sm font-medium text-white mb-2">Upgrade to Pro</p>
            <p className="text-xs text-gray-400 mb-3">
              Get real-time data and unlimited AI analysis
            </p>
            <Link
              href="/pricing"
              className="block w-full py-2 text-center text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content - Scrollable with margin-left for sidebar */}
      <div className="ml-64">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-40">
          <DashboardHeader user={user} />
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
