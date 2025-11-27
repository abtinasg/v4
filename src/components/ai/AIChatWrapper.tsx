/**
 * AI Chat Wrapper
 * 
 * Client-side wrapper that combines ChatPanel with PageContextProvider
 * for automatic context-aware AI chat across all dashboard pages.
 */

'use client'

import { Suspense } from 'react'
import { ChatPanel, type ChatPanelProps } from './ChatPanel'
import { PageContextProvider } from './PageContextProvider'
import type { StockContext } from '@/lib/ai/context-builder'

interface AIChatWrapperProps extends ChatPanelProps {
  /** Full stock data for context (includes quote and metrics) */
  stockData?: StockContext
}

export function AIChatWrapper({ stockData, ...chatPanelProps }: AIChatWrapperProps) {
  return (
    <Suspense fallback={null}>
      <PageContextProvider stockData={stockData}>
        <ChatPanel {...chatPanelProps} />
      </PageContextProvider>
    </Suspense>
  )
}

export default AIChatWrapper
