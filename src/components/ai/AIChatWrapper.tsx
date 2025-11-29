/**
 * AI Chat Wrapper
 * 
 * Client-side wrapper that combines ChatPanel with:
 * - GlobalContextUpdater for system-wide data
 * - PageContextProvider for page-specific context
 * 
 * This ensures AI always has access to all system data on every page.
 */

'use client'

import { Suspense } from 'react'
import { ChatPanel, type ChatPanelProps } from './ChatPanel'
import { PageContextProvider } from './PageContextProvider'
import { GlobalContextUpdater } from './GlobalContextUpdater'
import type { StockContext } from '@/lib/ai/context-builder'

interface AIChatWrapperProps extends ChatPanelProps {
  /** Full stock data for context (includes quote and metrics) */
  stockData?: StockContext
}

export function AIChatWrapper({ stockData, ...chatPanelProps }: AIChatWrapperProps) {
  return (
    <Suspense fallback={null}>
      {/* Global context: provides market data, economic indicators, etc. to ALL pages */}
      <GlobalContextUpdater refreshInterval={60000} />
      
      <PageContextProvider stockData={stockData}>
        <ChatPanel {...chatPanelProps} />
      </PageContextProvider>
    </Suspense>
  )
}

export default AIChatWrapper
