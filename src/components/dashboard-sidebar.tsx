'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LineChart, List, Terminal, Newspaper, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

// Credit-based system - no subscription tier needed
export function DashboardSidebar() {
  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/deep-logo.svg" alt="Deep" width={32} height={32} className="h-8 w-8" />
          <h1 className="text-2xl font-bold text-gradient">Deep</h1>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        <NavLink href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />}>
          Overview
        </NavLink>
        <NavLink href="/dashboard/stock-analysis" icon={<LineChart className="w-5 h-5" />}>
          Stock Analysis
        </NavLink>
        <NavLink href="/dashboard/portfolio" icon={<Briefcase className="w-5 h-5" />}>
          Portfolio
        </NavLink>
        <NavLink href="/dashboard/watchlist" icon={<List className="w-5 h-5" />}>
          Watchlist
        </NavLink>
        <NavLink href="/dashboard/news" icon={<Newspaper className="w-5 h-5" />}>
          Market News
        </NavLink>
        <NavLink href="/dashboard/terminal-pro" icon={<Terminal className="w-5 h-5" />}>
          Terminal Pro
        </NavLink>
      </nav>

      <div className="p-4 border-t">
        <Link 
          href="/pricing"
          className="block w-full px-4 py-2 text-sm text-center bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Buy Credits
        </Link>
      </div>
    </aside>
  )
}

function NavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string
  icon: React.ReactNode
  children: React.ReactNode 
}) {
  const pathname = usePathname()
  const isActive = pathname === href
  
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors group",
        isActive 
          ? "bg-accent text-foreground" 
          : "hover:bg-accent"
      )}
    >
      <span className={cn(
        "transition-colors",
        isActive 
          ? "text-foreground" 
          : "text-muted-foreground group-hover:text-foreground"
      )}>
        {icon}
      </span>
      <span className="text-sm font-medium">{children}</span>
    </Link>
  )
}
