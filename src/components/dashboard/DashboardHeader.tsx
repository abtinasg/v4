'use client'

import { UserButton } from '@clerk/nextjs'
import { Search, Bell, Command } from 'lucide-react'
import { useState } from 'react'

interface DashboardHeaderProps {
  user: {
    firstName?: string | null
    lastName?: string | null
    emailAddresses: Array<{ emailAddress: string }>
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  const displayName = user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/[0.08] text-gray-400 hover:bg-white/10 hover:border-white/[0.15] transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search stocks, news, commands...</span>
            <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-xs">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">Welcome, {displayName}</p>
            </div>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9',
                  userButtonPopoverCard: 'bg-[#12141a] border border-white/[0.08] shadow-2xl shadow-black/40 rounded-2xl',
                  userButtonPopoverActionButton: 'hover:bg-white/[0.06] text-white/80 rounded-xl',
                  userButtonPopoverActionButtonText: 'text-white/80 font-normal',
                  userButtonPopoverActionButtonIcon: 'text-white/50',
                  userButtonPopoverFooter: 'hidden',
                  userPreviewMainIdentifier: 'text-white font-medium',
                  userPreviewSecondaryIdentifier: 'text-white/60',
                  userPreview: 'border-b border-white/[0.06] pb-3 mb-1',
                  userPreviewAvatarBox: 'w-11 h-11',
                  userPreviewTextContainer: 'gap-0.5',
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Search Modal Placeholder */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks, news, or type a command..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
                autoFocus
              />
              <kbd className="px-2 py-1 rounded bg-white/10 text-xs text-gray-400">ESC</kbd>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-2">Quick Actions</p>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left">
                  <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                    <Search className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Search stocks</p>
                    <p className="text-xs text-gray-500">Find any stock by symbol or name</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
