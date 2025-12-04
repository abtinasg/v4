'use client'

import { useEffect, useState } from 'react'
import { X, Share, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const iOS = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(iOS)

    // Check if already installed (running in standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('ios-install-prompt-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

    // Show prompt if:
    // 1. Device is iOS
    // 2. Not already installed
    // 3. Haven't dismissed in last 7 days (or never dismissed)
    if (iOS && !standalone && daysSinceDismissed > 7) {
      // Delay showing prompt by 3 seconds to not be intrusive
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('ios-install-prompt-dismissed', Date.now().toString())
  }

  if (!isIOS || isStandalone || !showPrompt) {
    return null
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-md"
        >
          <div className="relative rounded-2xl bg-[#0d1117]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl overflow-hidden">
            {/* Gradient accent */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            
            <div className="p-4">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>

              {/* Content */}
              <div className="flex items-start gap-3 pr-8">
                {/* App icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">D</span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Install Deep
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed mb-3">
                    Add to your home screen for a better experience and quick access
                  </p>

                  {/* Instructions */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                      <span className="text-white/80">Tap</span>
                      <Share className="h-3.5 w-3.5 text-cyan-400" strokeWidth={2.5} />
                    </div>
                    <span className="text-white/40">then</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                      <Plus className="h-3.5 w-3.5 text-cyan-400" strokeWidth={2.5} />
                      <span className="text-white/80">Add to Home Screen</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom action */}
            <div className="px-4 py-3 bg-white/[0.02] border-t border-white/[0.06]">
              <button
                onClick={handleDismiss}
                className="w-full text-xs text-white/50 hover:text-white/80 transition-colors font-medium"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
