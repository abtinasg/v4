'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Activity } from 'lucide-react'
import { TerminalPanel, MiniChart } from './TerminalPanel'
import { cn } from '@/lib/utils'

interface MarketStat {
  label: string
  value: string | number
  change?: number
  status?: 'up' | 'down' | 'neutral'
}

interface MarketStatusPanelProps {
  className?: string
}

export function MarketStatusPanel({ className }: MarketStatusPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Determine market status
  const now = currentTime
  const hours = now.getUTCHours() - 5 // EST
  const day = now.getDay()
  const isWeekday = day > 0 && day < 6
  
  let marketStatus: 'open' | 'pre-market' | 'after-hours' | 'closed' = 'closed'
  let statusColor = 'text-red-400 bg-red-500/10'
  
  if (isWeekday) {
    if (hours >= 4 && hours < 9.5) {
      marketStatus = 'pre-market'
      statusColor = 'text-amber-400 bg-amber-500/10'
    } else if (hours >= 9.5 && hours < 16) {
      marketStatus = 'open'
      statusColor = 'text-emerald-400 bg-emerald-500/10'
    } else if (hours >= 16 && hours < 20) {
      marketStatus = 'after-hours'
      statusColor = 'text-violet-400 bg-violet-500/10'
    }
  }

  const marketStats: MarketStat[] = [
    { label: 'NYSE Volume', value: '2.8B', change: 12.4, status: 'up' },
    { label: 'NASDAQ Volume', value: '4.2B', change: -5.2, status: 'down' },
    { label: 'VIX', value: '14.32', change: -8.5, status: 'up' },
    { label: 'Put/Call', value: '0.87', status: 'neutral' },
    { label: 'Adv/Dec', value: '1.34', status: 'up' },
    { label: 'New Highs', value: '124', change: 15, status: 'up' },
    { label: 'New Lows', value: '28', change: -12, status: 'up' },
    { label: '52W High', value: '89', status: 'up' },
  ]

  // Simulated market breadth data
  const breadthData = {
    advancing: 287,
    declining: 213,
    unchanged: 12,
    total: 512
  }
  const advancePercent = (breadthData.advancing / (breadthData.advancing + breadthData.declining)) * 100

  return (
    <TerminalPanel
      title="Market Status"
      icon={<Activity className="w-3 h-3" />}
      badge={marketStatus.toUpperCase().replace('-', ' ')}
      badgeColor={marketStatus === 'open' ? 'green' : marketStatus === 'closed' ? 'red' : 'amber'}
      isLoading={isLoading}
      className={className}
      noPadding
    >
      {/* Status Header */}
      <div className="px-3 py-2.5 border-b border-white/[0.04] bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full animate-pulse',
              marketStatus === 'open' ? 'bg-emerald-400' : 
              marketStatus === 'closed' ? 'bg-red-400' : 'bg-amber-400'
            )} />
            <span className={cn('text-xs font-bold uppercase', statusColor.split(' ')[0])}>
              {marketStatus.replace('-', ' ')}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-white">
              {currentTime.toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}
            </div>
            <div className="text-[10px] text-gray-500">NYSE/NASDAQ</div>
          </div>
        </div>
      </div>

      {/* Market Breadth */}
      <div className="px-3 py-2.5 border-b border-white/[0.04]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-gray-500 uppercase">S&P 500 Breadth</span>
          <span className="text-[10px] font-mono text-gray-400">
            {breadthData.advancing}/{breadthData.declining}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${advancePercent}%` }}
          />
          <div 
            className="h-full bg-red-500 transition-all"
            style={{ width: `${100 - advancePercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-emerald-400">{breadthData.advancing} Adv</span>
          <span className="text-[9px] text-gray-500">{breadthData.unchanged} Unch</span>
          <span className="text-[9px] text-red-400">{breadthData.declining} Dec</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-px bg-white/[0.04]">
        {marketStats.map((stat) => (
          <div
            key={stat.label}
            className="px-3 py-2 bg-[#030508] hover:bg-white/[0.02] transition-colors"
          >
            <div className="text-[10px] text-gray-500 uppercase">{stat.label}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-mono text-white">{stat.value}</span>
              {stat.change !== undefined && (
                <span className={cn(
                  'text-[10px] font-mono',
                  stat.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {stat.change >= 0 ? '+' : ''}{stat.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trading Sessions */}
      <div className="px-3 py-2 border-t border-white/[0.04] bg-black/20">
        <div className="text-[10px] text-gray-500 uppercase mb-1.5">Trading Sessions (EST)</div>
        <div className="grid grid-cols-4 gap-1">
          {[
            { name: 'Pre', time: '4:00-9:30', active: marketStatus === 'pre-market' },
            { name: 'Regular', time: '9:30-16:00', active: marketStatus === 'open' },
            { name: 'After', time: '16:00-20:00', active: marketStatus === 'after-hours' },
            { name: 'Closed', time: '20:00-4:00', active: marketStatus === 'closed' },
          ].map((session) => (
            <div
              key={session.name}
              className={cn(
                'text-center py-1 rounded text-[9px]',
                session.active 
                  ? 'bg-cyan-500/20 text-cyan-400 font-bold' 
                  : 'bg-white/[0.02] text-gray-500'
              )}
            >
              {session.name}
            </div>
          ))}
        </div>
      </div>
    </TerminalPanel>
  )
}
