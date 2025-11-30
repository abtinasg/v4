'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  List, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Shield,
  Activity,
  Database,
  Zap,
  FileText,
  Download,
  Coins,
  Gauge,
  Bot
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AdminContext } from '@/lib/hooks/use-admin'

const sidebarItems = [
  { 
    title: 'Dashboard', 
    href: '/admin', 
    icon: LayoutDashboard,
    description: 'Overview & Statistics' 
  },
  { 
    title: 'Users', 
    href: '/admin/users', 
    icon: Users,
    description: 'User Management' 
  },
  { 
    title: 'Credits', 
    href: '/admin/credits', 
    icon: Coins,
    description: 'Credit Control' 
  },
  { 
    title: 'Rate Limits', 
    href: '/admin/rate-limits', 
    icon: Gauge,
    description: 'API Rate Limits' 
  },
  { 
    title: 'AI Dev Tools', 
    href: '/admin/ai-dev', 
    icon: Bot,
    description: 'Prompts & Access' 
  },
  { 
    title: 'Watchlists', 
    href: '/admin/watchlists', 
    icon: List,
    description: 'All Watchlists' 
  },
  { 
    title: 'Alerts', 
    href: '/admin/alerts', 
    icon: Bell,
    description: 'Stock Alerts' 
  },
  { 
    title: 'Analytics', 
    href: '/admin/analytics', 
    icon: Activity,
    description: 'Advanced Analytics' 
  },
  { 
    title: 'Activity Logs', 
    href: '/admin/activity', 
    icon: FileText,
    description: 'User Activity Feed' 
  },
  { 
    title: 'System Health', 
    href: '/admin/health', 
    icon: Zap,
    description: 'Service Status' 
  },
  { 
    title: 'Database', 
    href: '/admin/database', 
    icon: Database,
    description: 'Database Info' 
  },
  { 
    title: 'Settings', 
    href: '/admin/settings', 
    icon: Settings,
    description: 'System Settings' 
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<{ username: string; loggedInAt: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth')
      const data = await res.json()

      if (!data.authenticated) {
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
        setSession(null)
      } else {
        setSession({
          username: data.username,
          loggedInAt: data.loggedInAt,
        })
        if (pathname === '/admin/login') {
          router.push('/admin')
        }
      }
    } catch (error) {
      if (pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
      setSession(null)
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  // Login page - no layout
  if (pathname === '/admin/login') {
    return children
  }

  // Not authenticated
  if (!session) {
    return null
  }

  return (
    <AdminContext.Provider value={{ session, logout }}>
      <div className="min-h-screen bg-slate-900 flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-800/50 border-r border-slate-700/50 backdrop-blur-xl transform transition-transform duration-300 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-white">Admin Panel</h1>
                    <p className="text-xs text-slate-400">Deep Terminal</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                        : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 transition-transform group-hover:scale-110",
                      isActive && "text-emerald-400"
                    )} />
                    <div className="flex-1">
                      <span className="font-medium">{item.title}</span>
                      <p className="text-xs opacity-60">{item.description}</p>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="px-4 py-3 rounded-xl bg-slate-800/50 mb-4">
                <p className="text-xs text-slate-400">Logged in as</p>
                <p className="font-medium text-white">{session.username}</p>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Top bar */}
          <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-4 flex items-center justify-between lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm text-slate-400">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminContext.Provider>
  )
}
