'use client'

import { UserButton } from '@clerk/nextjs'
import { Search, Bell, LayoutDashboard, Terminal } from 'lucide-react'
import { CreditBadge } from '@/components/credits'
import { CreditModal } from '@/components/credits'

export function DashboardHeader() {
  return (
    <header className="h-[72px] relative">
      {/* Glass background with refined blur */}
      <div className="absolute inset-0 bg-[#0a0c10]/70 backdrop-blur-[8px] border-b border-white/[0.06]" />
      
      {/* Subtle top highlight for depth */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      
      {/* Content */}
      <div className="relative h-full px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          <h2 className="text-[15px] font-medium text-white/90 tracking-[-0.01em] leading-[1.4]">Dashboard</h2>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Credit Badge with Modal */}
          <CreditModal 
            trigger={
              <button className="flex items-center gap-2 h-10 px-4 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.10] border border-emerald-500/[0.12] hover:border-emerald-500/[0.20] rounded-xl transition-all duration-200">
                <CreditBadge showIcon={true} size="sm" className="border-0 bg-transparent p-0" />
              </button>
            }
          />
          
          {/* Search Button */}
          <button 
            className="p-2.5 rounded-xl hover:bg-white/[0.04] text-white/40 hover:text-white/70 transition-all duration-200"
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
          
          {/* Notifications Button */}
          <button 
            className="relative p-2.5 rounded-xl hover:bg-white/[0.04] text-white/40 hover:text-white/70 transition-all duration-200"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0a0c10]"></span>
          </button>

          {/* User Button with custom styling */}
          <div className="ml-2 pl-4 border-l border-white/[0.06]">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9 ring-2 ring-white/[0.08] ring-offset-2 ring-offset-[#0a0c10]',
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
        </div>
      </div>
    </header>
  )
}
