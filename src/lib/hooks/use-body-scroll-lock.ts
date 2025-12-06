'use client'

import { useEffect, useRef } from 'react'

// Counter to track how many components are locking the body scroll
let lockCount = 0

/**
 * Hook to manage body scroll locking.
 * Uses a counter-based approach to handle multiple overlays/modals.
 * The body scroll will only be unlocked when all locks are released.
 */
export function useBodyScrollLock(isLocked: boolean) {
  const wasLockedRef = useRef(false)

  useEffect(() => {
    if (isLocked && !wasLockedRef.current) {
      // Lock
      lockCount++
      wasLockedRef.current = true
      document.body.style.overflow = 'hidden'
    } else if (!isLocked && wasLockedRef.current) {
      // Unlock
      lockCount--
      wasLockedRef.current = false
      if (lockCount === 0) {
        document.body.style.overflow = ''
      }
    }

    // Cleanup on unmount
    return () => {
      if (wasLockedRef.current) {
        lockCount--
        wasLockedRef.current = false
        if (lockCount === 0) {
          document.body.style.overflow = ''
        }
      }
    }
  }, [isLocked])
}
