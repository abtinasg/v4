'use client'

import { UserButton } from '@clerk/nextjs'
import { Search, Bell, LayoutDashboard, Terminal } from 'lucide-react'

export function DashboardHeader() {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search Button */}
        <button 
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
        
        {/* Notifications Button */}
        <button 
          className="p-2 rounded-md hover:bg-accent transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Button with custom styling */}
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'w-9 h-9',
              userButtonPopoverCard: 'shadow-lg',
              userButtonPopoverActionButton: 'hover:bg-accent',
            }
          }}
        >
          <UserButton.MenuItems>
            <UserButton.Link
              label="Dashboard"
              labelIcon={<LayoutDashboard className="w-4 h-4" />}
              href="/dashboard"
            />
            <UserButton.Link
              label="Upgrade"
              labelIcon={<Terminal className="w-4 h-4" />}
              href="/pricing"
            />
            <UserButton.Action label="signOut" />
          </UserButton.MenuItems>
        </UserButton>
      </div>
    </header>
  )
}
