'use client'

import { Monitor } from 'lucide-react'

export function DesktopOnlyNotice() {
  return (
    <div className="lg:hidden min-h-screen flex items-center justify-center p-6 bg-[#04060A]">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <Monitor className="h-12 w-12 text-cyan-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">
          Desktop Only
        </h1>
        
        <p className="text-gray-400 mb-6 leading-relaxed">
          Terminal Pro is optimized for desktop screens. Please access this feature on a larger device for the best experience.
        </p>
        
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <p className="text-sm text-gray-500">
            💡 Minimum screen width: <span className="text-white font-medium">1024px</span>
          </p>
        </div>
      </div>
    </div>
  )
}
