'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SwipeableCardsProps<T> {
  items: T[]
  renderCard: (item: T, index: number) => React.ReactNode
  onSwipeLeft?: (item: T) => void
  onSwipeRight?: (item: T) => void
  className?: string
}

export function SwipeableCards<T>({ 
  items, 
  renderCard, 
  onSwipeLeft, 
  onSwipeRight,
  className 
}: SwipeableCardsProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    const newIndex = currentIndex + newDirection
    if (newIndex >= 0 && newIndex < items.length) {
      setDirection(newDirection)
      setCurrentIndex(newIndex)
      
      if (newDirection > 0 && onSwipeLeft) {
        onSwipeLeft(items[currentIndex])
      } else if (newDirection < 0 && onSwipeRight) {
        onSwipeRight(items[currentIndex])
      }
    }
  }

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x)
    
    if (swipe < -swipeConfidenceThreshold) {
      paginate(1)
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1)
    }
  }

  return (
    <div className={className}>
      {/* Card Container */}
      <div className="relative h-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            {renderCard(items[currentIndex], currentIndex)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-cyan-400 w-6' 
                : 'bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows (optional, shows on touch devices too) */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          onClick={() => paginate(-1)}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={() => paginate(1)}
          disabled={currentIndex === items.length - 1}
          className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
