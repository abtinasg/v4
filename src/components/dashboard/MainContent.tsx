'use client'

import { useSidebar } from './Sidebar'
import { cn } from '@/lib/utils'

interface MainContentProps {
  children: React.ReactNode
}

export function MainContent({ children }: MainContentProps) {
  const { isCollapsed } = useSidebar()
  
  return (
    <div 
      className={cn(
        'transition-all duration-300 flex flex-col min-h-screen',
        // On mobile: no margin (sidebar is overlay)
        // On desktop: margin based on collapsed state
        isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'
      )}
    >
      {children}
    </div>
  )
}
