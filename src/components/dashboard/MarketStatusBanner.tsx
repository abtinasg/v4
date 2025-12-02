'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type MarketSession = 'pre-market' | 'regular' | 'after-hours' | 'closed'

interface MarketStatusBannerProps {
  className?: string
}

const MARKET_HOURS = {
  preMarket: { start: 4, end: 9.5 },
  regular: { start: 9.5, end: 16 },
  afterHours: { start: 16, end: 20 },
}

const MARKET_HOLIDAYS = [
  '2024-01-01', '2024-01-15', '2024-02-19', '2024-03-29', '2024-05-27',
  '2024-06-19', '2024-07-04', '2024-09-02', '2024-11-28', '2024-12-25',
  '2025-01-01', '2025-01-20', '2025-02-17', '2025-04-18', '2025-05-26',
  '2025-06-19', '2025-07-04', '2025-09-01', '2025-11-27', '2025-12-25',
]

function getETTime(): Date {
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
  return day === 0 || day === 6
}

function getMarketSession(etTime: Date): MarketSession {
  if (isWeekend(etTime) || isHoliday(etTime)) return 'closed'
  const hours = etTime.getHours() + etTime.getMinutes() / 60
  if (hours >= MARKET_HOURS.preMarket.start && hours < MARKET_HOURS.preMarket.end) return 'pre-market'
  if (hours >= MARKET_HOURS.regular.start && hours < MARKET_HOURS.regular.end) return 'regular'
  if (hours >= MARKET_HOURS.afterHours.start && hours < MARKET_HOURS.afterHours.end) return 'after-hours'
  return 'closed'
}

function getNextMarketEvent(etTime: Date, session: MarketSession): { event: string; time: Date } {
  const today = new Date(etTime)
  today.setHours(0, 0, 0, 0)

  const findNextTradingDay = (startDate: Date): Date => {
    let nextDay = new Date(startDate)
    nextDay.setDate(nextDay.getDate() + 1)
    while (isWeekend(nextDay) || isHoliday(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1)
    }
    return nextDay
  }

  if (session === 'closed') {
    if (isWeekend(etTime) || isHoliday(etTime)) {
      const nextTradingDay = findNextTradingDay(today)
      nextTradingDay.setHours(4, 0, 0, 0)
      return { event: 'Pre-market', time: nextTradingDay }
    }
    const hours = etTime.getHours() + etTime.getMinutes() / 60
    if (hours < MARKET_HOURS.preMarket.start) {
      const preMarketOpen = new Date(today)
      preMarketOpen.setHours(4, 0, 0, 0)
      return { event: 'Pre-market', time: preMarketOpen }
    }
    const nextTradingDay = findNextTradingDay(today)
    nextTradingDay.setHours(4, 0, 0, 0)
    return { event: 'Pre-market', time: nextTradingDay }
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
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function MarketStatusBanner({ className }: MarketStatusBannerProps) {
  const [currentTime, setCurrentTime] = useState<Date>(getETTime())

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(getETTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  const session = useMemo(() => getMarketSession(currentTime), [currentTime])
  const nextEvent = useMemo(() => getNextMarketEvent(currentTime, session), [currentTime, session])
  const timeUntil = useMemo(() => formatTimeUntil(nextEvent.time, currentTime), [nextEvent, currentTime])

  const sessionConfig = {
    'pre-market': { label: 'Pre-Market', color: 'bg-amber-400', textColor: 'text-amber-400' },
    'regular': { label: 'Market Open', color: 'bg-emerald-400', textColor: 'text-emerald-400' },
    'after-hours': { label: 'After-Hours', color: 'bg-orange-400', textColor: 'text-orange-400' },
    'closed': { label: 'Closed', color: 'bg-white/30', textColor: 'text-white/50' },
  }

  const config = sessionConfig[session]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn('flex items-center justify-between', className)}
    >
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', config.color, session === 'regular' && 'animate-pulse')} />
          <span className={cn('text-sm font-medium', config.textColor)}>{config.label}</span>
        </div>
        
        {/* Divider */}
        <span className="text-white/10">|</span>
        
        {/* Next event */}
        <span className="text-sm text-white/40">
          {nextEvent.event} in <span className="text-white/60 font-medium">{timeUntil}</span>
        </span>
      </div>

      {/* ET Time */}
      <span className="text-sm text-white/30 tabular-nums">
        {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} ET
      </span>
    </motion.div>
  )
}
