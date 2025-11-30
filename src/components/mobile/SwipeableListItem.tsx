'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { X, Star, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwipeAction {
  icon: React.ReactNode
  color: string
  bgColor: string
  onAction: () => void
}

interface SwipeableListItemProps {
  children: React.ReactNode
  leftAction?: SwipeAction
  rightAction?: SwipeAction
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
  className?: string
}

export function SwipeableListItem({
  children,
  leftAction,
  rightAction,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  className,
}: SwipeableListItemProps) {
  const [isOpen, setIsOpen] = useState<'left' | 'right' | null>(null)
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Transform for action icons
  const leftActionOpacity = useTransform(x, [0, threshold / 2, threshold], [0, 0.5, 1])
  const leftActionScale = useTransform(x, [0, threshold], [0.5, 1])
  const rightActionOpacity = useTransform(x, [-threshold, -threshold / 2, 0], [1, 0.5, 0])
  const rightActionScale = useTransform(x, [-threshold, 0], [1, 0.5])

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset > threshold || velocity > 500) {
      // Swiped right
      if (leftAction) {
        setIsOpen('left')
        leftAction.onAction()
        // Haptic feedback
        if ('vibrate' in navigator) navigator.vibrate(30)
      }
      if (onSwipeRight) onSwipeRight()
    } else if (offset < -threshold || velocity < -500) {
      // Swiped left
      if (rightAction) {
        setIsOpen('right')
        rightAction.onAction()
        if ('vibrate' in navigator) navigator.vibrate(30)
      }
      if (onSwipeLeft) onSwipeLeft()
    }
  }

  // Reset when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Left action background */}
      {leftAction && (
        <motion.div 
          className="absolute inset-y-0 left-0 flex items-center justify-start pl-4"
          style={{ 
            backgroundColor: leftAction.bgColor,
            opacity: leftActionOpacity,
          }}
        >
          <motion.div style={{ scale: leftActionScale }}>
            {leftAction.icon}
          </motion.div>
        </motion.div>
      )}

      {/* Right action background */}
      {rightAction && (
        <motion.div 
          className="absolute inset-y-0 right-0 flex items-center justify-end pr-4"
          style={{ 
            backgroundColor: rightAction.bgColor,
            opacity: rightActionOpacity,
          }}
        >
          <motion.div style={{ scale: rightActionScale }}>
            {rightAction.icon}
          </motion.div>
        </motion.div>
      )}

      {/* Main content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: rightAction ? -threshold : 0, right: leftAction ? threshold : 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={{ x: isOpen === 'left' ? threshold : isOpen === 'right' ? -threshold : 0 }}
        className="relative bg-[#0a0d12] cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  )
}

// Example usage component for watchlist
interface WatchlistItemProps {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  onRemove: () => void
  onStar: () => void
  isStarred?: boolean
}

export function SwipeableWatchlistItem({
  symbol,
  name,
  price,
  change,
  changePercent,
  onRemove,
  onStar,
  isStarred = false,
}: WatchlistItemProps) {
  const isPositive = change >= 0

  return (
    <SwipeableListItem
      leftAction={{
        icon: <Star className={cn("w-6 h-6", isStarred ? "fill-yellow-400 text-yellow-400" : "text-white")} />,
        color: 'white',
        bgColor: 'rgba(234, 179, 8, 0.8)',
        onAction: onStar,
      }}
      rightAction={{
        icon: <Trash2 className="w-6 h-6 text-white" />,
        color: 'white',
        bgColor: 'rgba(239, 68, 68, 0.8)',
        onAction: onRemove,
      }}
      className="border-b border-white/[0.06]"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{symbol}</span>
            {isStarred && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
          </div>
          <span className="text-xs text-gray-500 line-clamp-1">{name}</span>
        </div>
        <div className="text-right">
          <div className="font-medium text-white">${price.toFixed(2)}</div>
          <div className={cn(
            "text-xs font-medium",
            isPositive ? "text-green-400" : "text-red-400"
          )}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>
    </SwipeableListItem>
  )
}
