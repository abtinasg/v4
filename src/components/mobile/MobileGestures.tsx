'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface GestureConfig {
  // Swipe back to go back in history
  enableSwipeBack?: boolean
  // Pull down to refresh
  enablePullToRefresh?: boolean
  // Double tap to zoom (for charts)
  enableDoubleTapZoom?: boolean
  // Long press for context menu
  enableLongPress?: boolean
}

interface TouchState {
  startX: number
  startY: number
  startTime: number
  lastTap: number
}

export function useMobileGestures(config: GestureConfig = {}) {
  const {
    enableSwipeBack = true,
    enableDoubleTapZoom = false,
    enableLongPress = true,
  } = config

  const router = useRouter()
  const [isLongPressing, setIsLongPressing] = useState(false)
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastTap: 0,
  })
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchState.current = {
      ...touchState.current,
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    }

    // Long press detection
    if (enableLongPress) {
      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true)
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
      }, 500)
    }
  }, [enableLongPress])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Cancel long press if moved
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setIsLongPressing(false)

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchState.current.startX
    const deltaY = touch.clientY - touchState.current.startY
    const deltaTime = Date.now() - touchState.current.startTime

    // Swipe back detection (swipe from left edge)
    if (enableSwipeBack && 
        touchState.current.startX < 30 && 
        deltaX > 100 && 
        Math.abs(deltaY) < 50 &&
        deltaTime < 300) {
      router.back()
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30)
      }
      return
    }

    // Double tap detection
    if (enableDoubleTapZoom) {
      const now = Date.now()
      const timeDiff = now - touchState.current.lastTap
      
      if (timeDiff < 300 && timeDiff > 0) {
        // Double tap detected
        const event = new CustomEvent('doubletap', {
          detail: { x: touch.clientX, y: touch.clientY }
        })
        document.dispatchEvent(event)
      }
      
      touchState.current.lastTap = now
    }
  }, [enableSwipeBack, enableDoubleTapZoom, router])

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    isLongPressing,
  }
}

// Hook for detecting mobile device
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Hook for safe area insets (notch, home indicator)
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement)
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10),
      })
    }

    // Add CSS custom properties for safe area
    document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)')
    document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)')
    document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)')
    document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)')

    updateSafeArea()
  }, [])

  return safeArea
}
