'use client'

import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function FullDataButton() {
  const pathname = usePathname()
  
  // URL for desktop version with force desktop mode
  const desktopUrl = `${pathname}?mode=desktop`
  
  return (
    <div className="lg:hidden fixed bottom-4 right-4 z-50">
      <Link
        href={desktopUrl}
        className="flex items-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-full shadow-lg transition-all duration-200 active:scale-95"
      >
        <ExternalLink className="h-4 w-4" />
        <span>Full Data</span>
      </Link>
    </div>
  )
}
