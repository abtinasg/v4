'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Sun, 
  Moon, 
  Sunrise,
  Sunset,
  Calendar,
  Bell,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

type MarketSession = 'pre-market' | 'regular' | 'after-hours' | 'closed'

interface MarketStatusBannerProps {
  className?: string
}

// US Market Hours (Eastern Time)
const MARKET_HOURS = {
  preMarket: { start: 4, end: 9.5 }, // 4:00 AM - 9:30 AM ET
  regular: { start: 9.5, end: 16 },   // 9:30 AM - 4:00 PM ET
  afterHours: { start: 16, end: 20 }, // 4:00 PM - 8:00 PM ET
}

// US Market Holidays 2024-2025
const MARKET_HOLIDAYS = [
  '2024-01-01', // New Year's Day
  '2024-01-15', // MLK Day
  '2024-02-19', // Presidents Day
  '2024-03-29', // Good Friday
  '2024-05-27', // Memorial Day
  '2024-06-19', // Juneteenth
  '2024-07-04', // Independence Day
  '2024-09-02', // Labor Day
  '2024-11-28', // Thanksgiving
  '2024-12-25', // Christmas
  '2025-01-01', // New Year's Day
  '2025-01-20', // MLK Day
  '2025-02-17', // Presidents Day
  '2025-04-18', // Good Friday
  '2025-05-26', // Memorial Day
  '2025-06-19', // Juneteenth
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-11-27', // Thanksgiving
  '2025-12-25', // Christmas
]

function getETTime(): Date {
  // Get current time in ET
  const now = new Date()
  const etString = now.toLocaleString('en-US', { timeZone: 'America/New_York' })
  return new Date(etString)
}

function isHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0]
  return MARKET_HOLIDAYS.includes(dateStr)
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

function getMarketSession(etTime: Date): MarketSession {
  if (isWeekend(etTime) || isHoliday(etTime)) {
    return 'closed'
  }

  const hours = etTime.getHours() + etTime.getMinutes() / 60

  if (hours >= MARKET_HOURS.preMarket.start && hours < MARKET_HOURS.preMarket.end) {
    return 'pre-market'
  }
  if (hours >= MARKET_HOURS.regular.start && hours < MARKET_HOURS.regular.end) {
    return 'regular'
  }
  if (hours >= MARKET_HOURS.afterHours.start && hours < MARKET_HOURS.afterHours.end) {
    return 'after-hours'
  }

  return 'closed'
}

function getNextMarketEvent(etTime: Date, session: MarketSession): { event: string; time: Date } {
  const today = new Date(etTime)
  today.setHours(0, 0, 0, 0)

  // Find next trading day
  const findNextTradingDay = (startDate: Date): Date => {
    let nextDay = new Date(startDate)
    nextDay.setDate(nextDay.getDate() + 1)
    while (isWeekend(nextDay) || isHoliday(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1)
    }
    return nextDay
  }

  if (session === 'closed') {
    // If it's a holiday or weekend
    if (isWeekend(etTime) || isHoliday(etTime)) {
      const nextTradingDay = findNextTradingDay(today)
      nextTradingDay.setHours(4, 0, 0, 0) // Pre-market opens at 4 AM
      return { event: 'Pre-market opens', time: nextTradingDay }
    }
    
    // If it's before pre-market on a trading day
    const hours = etTime.getHours() + etTime.getMinutes() / 60
    if (hours < MARKET_HOURS.preMarket.start) {
      const preMarketOpen = new Date(today)
      preMarketOpen.setHours(4, 0, 0, 0)
      return { event: 'Pre-market opens', time: preMarketOpen }
    }
    
    // If it's after after-hours
    const nextTradingDay = findNextTradingDay(today)
    nextTradingDay.setHours(4, 0, 0, 0)
    return { event: 'Pre-market opens', time: nextTradingDay }
  }

  if (session === 'pre-market') {
    const regularOpen = new Date(today)
    regularOpen.setHours(9, 30, 0, 0)
    return { event: 'Market opens', time: regularOpen }
  }

  if (session === 'regular') {
    const regularClose = new Date(today)
    regularClose.setHours(16, 0, 0, 0)
    return { event: 'Market closes', time: regularClose }
  }

  if (session === 'after-hours') {
    const afterHoursClose = new Date(today)
    afterHoursClose.setHours(20, 0, 0, 0)
    return { event: 'After-hours ends', time: afterHoursClose }
  }

  return { event: 'Market opens', time: new Date() }
}

function formatTimeUntil(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return 'Now'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function MarketStatusBanner({ className }: MarketStatusBannerProps) {
  const [currentTime, setCurrentTime] = useState<Date>(getETTime())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getETTime())
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  const session = useMemo(() => getMarketSession(currentTime), [currentTime])
  const nextEvent = useMemo(() => getNextMarketEvent(currentTime, session), [currentTime, session])
  const timeUntil = useMemo(() => formatTimeUntil(nextEvent.time, currentTime), [nextEvent, currentTime])

  const sessionConfig = {
    'pre-market': {
      label: 'Pre-Market',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      icon: Sunrise,
      dot: 'bg-amber-400',
      pulse: true,
    },
    'regular': {
      label: 'Market Open',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      icon: Sun,
      dot: 'bg-emerald-400',
      pulse: true,
    },
    'after-hours': {
      label: 'After-Hours',
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
      icon: Sunset,
      dot: 'bg-violet-400',
      pulse: true,
    },
    'closed': {
      label: 'Market Closed',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20',
      icon: Moon,
      dot: 'bg-gray-400',
      pulse: false,
    },
  }

  const config = sessionConfig[session]
  const Icon = config.icon

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border backdrop-blur-sm overflow-hidden',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left: Status */}
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className={cn(
              'relative flex items-center justify-center w-10 h-10 rounded-lg',
              config.bgColor
            )}>
              <Icon className={cn('w-5 h-5', config.color)} />
              {config.pulse && (
                <span className="absolute -top-0.5 -right-0.5">
                  <span className={cn('relative flex h-2.5 w-2.5')}>
                    <span className={cn(
                      'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                      config.dot
                    )} />
                    <span className={cn(
                      'relative inline-flex rounded-full h-2.5 w-2.5',
                      config.dot
                    )} />
                  </span>
                </span>
              )}
            </div>

            {/* Status Text */}
            <div>
              <div className="flex items-center gap-2">
                <span className={cn('font-semibold', config.color)}>
                  {config.label}
                </span>
                <span className="text-xs text-gray-500">NYSE / NASDAQ</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formattedTime} ET</span>
                <span className="text-gray-600">•</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Right: Next Event */}
          <div className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg',
            'bg-white/[0.03] border border-white/5'
          )}>
            <div className="text-right">
              <p className="text-xs text-gray-500">{nextEvent.event}</p>
              <p className="text-sm font-medium text-white">
                in <span className={config.color}>{timeUntil}</span>
              </p>
            </div>
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg',
              config.bgColor
            )}>
              <Bell className={cn('w-4 h-4', config.color)} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
