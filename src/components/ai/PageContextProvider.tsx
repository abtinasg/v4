/**
 * Page Context Provider
 * 
 * Automatically updates the AI chat context based on the current page.
 * This allows the AI to provide context-aware responses.
 */

'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useChatStore, type ChatContext } from '@/lib/stores/chat-store'
import type { StockContext } from '@/lib/ai/context-builder'

interface PageContextProviderProps {
  children: React.ReactNode
  /** Optional stock symbol for stock analysis pages */
  stockSymbol?: string
  /** Optional full stock data to provide to the AI (with quote and metrics) */
  stockData?: StockContext
}

/**
 * Maps pathname to context type
 */
function getContextType(pathname: string): ChatContext['type'] {
  if (pathname.includes('/stock-analysis')) return 'stock'
  if (pathname.includes('/watchlist')) return 'portfolio'
  if (pathname.includes('/screener')) return 'screener'
  if (pathname.includes('/market')) return 'market'
  return 'general'
}

/**
 * Gets a friendly page name for display
 */
function getPageName(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  
  const pageNames: Record<string, string> = {
    'dashboard': 'Dashboard',
    'stock-analysis': 'Stock Analysis',
    'watchlist': 'Watchlist',
    'terminal-pro': 'Terminal Pro',
    'ai-assistant': 'AI Assistant',
    'screener': 'Stock Screener',
    'market': 'Market Overview',
    'portfolio': 'Portfolio',
  }
  
  return pageNames[lastSegment] || lastSegment?.charAt(0).toUpperCase() + lastSegment?.slice(1) || 'Dashboard'
}

export function PageContextProvider({
  children,
  stockSymbol,
  stockData,
}: PageContextProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const setContext = useChatStore((s) => s.setContext)
  
  // Get symbol from URL if not provided as prop
  const symbol = stockSymbol || searchParams.get('symbol')
  
  useEffect(() => {
    const contextType = getContextType(pathname)
    const pageName = getPageName(pathname)
    
    const contextUpdate: Partial<ChatContext> = {
      type: contextType,
      pageContext: {
        currentPage: pageName,
        selectedTimeframe: searchParams.get('timeframe') || undefined,
      },
    }
    
    // Add stock context if available
    if (stockData) {
      // Full stock data with quote and metrics
      contextUpdate.stock = stockData
    } else if (symbol) {
      // Just have the symbol - minimal context
      contextUpdate.stock = {
        symbol: symbol.toUpperCase(),
        name: '',
      }
    } else {
      // Clear stock context if not on a stock page
      contextUpdate.stock = undefined
    }
    
    setContext(contextUpdate)
    
  }, [pathname, searchParams, symbol, stockData, setContext])
  
  return <>{children}</>
}

export default PageContextProvider
