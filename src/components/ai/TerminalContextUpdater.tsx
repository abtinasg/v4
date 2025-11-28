/**
 * Terminal Context Updater
 * 
 * Client component that fetches terminal/market data and updates AI context.
 * Use this on Terminal Pro page to give AI access to market data.
 */

'use client'

import { useEffect, useState } from 'react'
import { useChatStore, type TerminalContext } from '@/lib/stores/chat-store'

interface TerminalContextUpdaterProps {
  /** Refresh interval in ms (default: 30 seconds) */
  refreshInterval?: number
}

export function TerminalContextUpdater({ refreshInterval = 30000 }: TerminalContextUpdaterProps) {
  const setContext = useChatStore((s) => s.setContext)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAndUpdateContext() {
      try {
        // Fetch all terminal data in parallel
        const [indicesRes, sectorsRes, moversRes, newsRes] = await Promise.allSettled([
          fetch('/api/market/overview'),
          fetch('/api/market/sectors'),
          fetch('/api/market/movers'),
          fetch('/api/market/news?limit=5'),
        ])

        const terminalContext: TerminalContext = {}

        // Parse indices
        if (indicesRes.status === 'fulfilled' && indicesRes.value.ok) {
          const data = await indicesRes.value.json()
          if (data.indices) {
            terminalContext.indices = data.indices.map((idx: any) => ({
              symbol: idx.symbol,
              name: idx.name,
              price: idx.price,
              change: idx.change,
              changePercent: idx.changePercent,
            }))
          }
        }

        // Parse sectors
        if (sectorsRes.status === 'fulfilled' && sectorsRes.value.ok) {
          const data = await sectorsRes.value.json()
          if (data.sectors) {
            terminalContext.sectors = data.sectors.slice(0, 11).map((s: any) => ({
              name: s.name,
              change: s.change,
            }))
          }
        }

        // Parse movers
        if (moversRes.status === 'fulfilled' && moversRes.value.ok) {
          const data = await moversRes.value.json()
          if (data.gainers) {
            terminalContext.topGainers = data.gainers.slice(0, 5).map((g: any) => ({
              symbol: g.symbol,
              name: g.name,
              price: g.price,
              changePercent: g.changePercent,
            }))
          }
          if (data.losers) {
            terminalContext.topLosers = data.losers.slice(0, 5).map((l: any) => ({
              symbol: l.symbol,
              name: l.name,
              price: l.price,
              changePercent: l.changePercent,
            }))
          }
        }

        // Parse news headlines
        if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
          const data = await newsRes.value.json()
          if (data.news) {
            terminalContext.news = data.news.slice(0, 5).map((n: any) => ({
              headline: n.headline,
              time: n.timeAgo,
            }))
          }
        }

        console.log('🖥️ Terminal context updated for AI:', {
          indicesCount: terminalContext.indices?.length || 0,
          sectorsCount: terminalContext.sectors?.length || 0,
          gainersCount: terminalContext.topGainers?.length || 0,
          losersCount: terminalContext.topLosers?.length || 0,
          newsCount: terminalContext.news?.length || 0,
        })

        // Update the chat context
        setContext({
          type: 'terminal',
          terminalContext,
          pageContext: {
            currentPage: 'Terminal Pro',
          },
        })
      } catch (error) {
        console.error('Failed to update terminal AI context:', error)
        
        // Still set basic context even if APIs fail
        setContext({
          type: 'terminal',
          pageContext: {
            currentPage: 'Terminal Pro',
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchAndUpdateContext()

    // Set up periodic refresh
    const interval = setInterval(fetchAndUpdateContext, refreshInterval)

    // Cleanup: Reset context when leaving the page
    return () => {
      clearInterval(interval)
      setContext({
        type: 'general',
        terminalContext: undefined,
      })
    }
  }, [setContext, refreshInterval])

  // This component doesn't render anything
  return null
}

export default TerminalContextUpdater
