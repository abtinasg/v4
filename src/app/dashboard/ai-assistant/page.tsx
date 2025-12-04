'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { MessageSquare, RefreshCw, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useChatStore } from '@/lib/stores/chat-store'
import { Message } from '@/components/ai/Message'
import { MessageInput } from '@/components/ai/MessageInput'
import { SuggestedQuestions } from '@/components/ai/SuggestedQuestions'
import type { FeedbackType } from '@/lib/stores/chat-store'
import { cn } from '@/lib/utils'

// Types for market data
interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface EconomicIndicator {
  value: number | null
  change: number | null
}

interface EconomicData {
  gdp: EconomicIndicator | null
  unemployment: EconomicIndicator | null
  inflation: EconomicIndicator | null
  federalFundsRate: EconomicIndicator | null
  consumerConfidence: EconomicIndicator | null
  manufacturingPmi: EconomicIndicator | null
  servicesPmi: EconomicIndicator | null
}

interface NewsItem {
  headline: string
  summary?: string
  category?: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  source?: string
  timeAgo?: string
}

interface Mover {
  symbol: string
  name?: string
  price?: number
  change?: number
  changePercent?: number
}

interface FullMarketContext {
  indices?: MarketIndex[]
  economicIndicators?: EconomicData
  topGainers?: Mover[]
  topLosers?: Mover[]
  news?: NewsItem[]
  sectors?: { name: string; change: number }[]
  lastUpdated?: string
}

// Chat API Hook
function useChatApi() {
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const sendMessage = useCallback(async (
    messages: { role: 'user' | 'assistant'; content: string }[],
    context: any,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void,
    onModelInfo?: (model: string, modelName: string) => void,
  ) => {
    abortControllerRef.current = new AbortController()
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context, stream: true }),
        signal: abortControllerRef.current.signal,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Request failed: ${response.status}`)
      }
      
      const reader = response.body?.getReader()
      if (!reader) throw new Error('Response body not readable')
      
      const decoder = new TextDecoder()
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (!trimmed.startsWith('data: ')) continue
          
          try {
            const data = JSON.parse(trimmed.slice(6))
            if (data.error) throw new Error(data.error)
            if (data.model && data.modelName) onModelInfo?.(data.model, data.modelName)
            if (data.content) onChunk(data.content)
          } catch (e) { /* Skip malformed JSON */ }
        }
      }
      
      onComplete()
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        onComplete()
        return
      }
      onError((error as Error).message || 'An error occurred')
    }
  }, [])
  
  const abort = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])
  
  return { sendMessage, abort }
}

export default function AIAssistantPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [marketContext, setMarketContext] = useState<FullMarketContext | null>(null)
  const [isLoadingContext, setIsLoadingContext] = useState(true)
  
  // Store state
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const context = useChatStore((s) => s.context)
  
  // Actions
  const addMessage = useChatStore((s) => s.addMessage)
  const updateMessage = useChatStore((s) => s.updateMessage)
  const appendToMessage = useChatStore((s) => s.appendToMessage)
  const setStreaming = useChatStore((s) => s.setStreaming)
  const setFeedback = useChatStore((s) => s.setFeedback)
  const clearMessages = useChatStore((s) => s.clearMessages)
  const setContext = useChatStore((s) => s.setContext)
  
  const { sendMessage, abort } = useChatApi()

  // Fetch comprehensive market data for AI context
  const fetchMarketContext = useCallback(async () => {
    setIsLoadingContext(true)
    try {
      const [overviewRes, moversRes, newsRes, economicRes, sectorsRes] = await Promise.allSettled([
        fetch('/api/market/overview'),
        fetch('/api/market/movers'),
        fetch('/api/market/news?limit=15'),
        fetch('/api/economic/indicators'),
        fetch('/api/market/sectors'),
      ])

      const newContext: FullMarketContext = { lastUpdated: new Date().toISOString() }

      // Market indices
      if (overviewRes.status === 'fulfilled' && overviewRes.value.ok) {
        const data = await overviewRes.value.json()
        newContext.indices = data.indices || []
      }

      // Top movers
      if (moversRes.status === 'fulfilled' && moversRes.value.ok) {
        const data = await moversRes.value.json()
        newContext.topGainers = data.gainers?.slice(0, 10) || []
        newContext.topLosers = data.losers?.slice(0, 10) || []
      }

      // News
      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        const data = await newsRes.value.json()
        newContext.news = data.news?.slice(0, 15) || []
      }

      // Economic indicators
      if (economicRes.status === 'fulfilled' && economicRes.value.ok) {
        const data = await economicRes.value.json()
        if (data.success) {
          newContext.economicIndicators = data.data
        }
      }

      // Sectors
      if (sectorsRes.status === 'fulfilled' && sectorsRes.value.ok) {
        const data = await sectorsRes.value.json()
        newContext.sectors = data.sectors || []
      }

      setMarketContext(newContext)
      
      // Update chat store context with comprehensive data
      // Map the local MarketIndex (with 'price') to the store type (with 'value')
      const mappedIndices = newContext.indices?.map(i => ({
        symbol: i.symbol,
        name: i.name,
        value: i.price,
        change: i.change,
        changePercent: i.changePercent,
      }));
      
      setContext({
        type: 'general',
        market: {
          indices: mappedIndices,
          topGainers: newContext.topGainers?.map(g => ({ symbol: g.symbol, change: g.changePercent || 0 })),
          topLosers: newContext.topLosers?.map(l => ({ symbol: l.symbol, change: l.changePercent || 0 })),
          sectorPerformance: newContext.sectors?.reduce((acc, s) => ({ ...acc, [s.name]: s.change }), {}),
        },
        newsContext: {
          recentNews: (newContext.news || []).map(n => ({
            headline: n.headline,
            summary: n.summary || '',
            category: n.category || 'General',
            sentiment: n.sentiment,
            source: n.source || '',
            timeAgo: n.timeAgo || '',
          })),
          newsCount: newContext.news?.length || 0,
          sentimentBreakdown: {
            bullish: newContext.news?.filter(n => n.sentiment === 'bullish').length || 0,
            bearish: newContext.news?.filter(n => n.sentiment === 'bearish').length || 0,
            neutral: newContext.news?.filter(n => n.sentiment === 'neutral').length || 0,
          },
        },
        terminalContext: {
          indices: newContext.indices,
          sectors: newContext.sectors,
          topGainers: newContext.topGainers?.map(g => ({
            symbol: g.symbol,
            name: g.name || g.symbol,
            price: g.price || 0,
            changePercent: g.changePercent || 0,
          })),
          topLosers: newContext.topLosers?.map(l => ({
            symbol: l.symbol,
            name: l.name || l.symbol,
            price: l.price || 0,
            changePercent: l.changePercent || 0,
          })),
        },
        pageContext: {
          currentPage: 'AI Assistant',
        },
        // @ts-ignore - extend context with economic data
        economicIndicators: newContext.economicIndicators,
      })
    } catch (error) {
      console.error('Error fetching market context:', error)
    } finally {
      setIsLoadingContext(false)
    }
  }, [setContext])

  // Set context for this page and fetch market data
  useEffect(() => {
    fetchMarketContext()
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketContext, 300000)
    return () => clearInterval(interval)
  }, [fetchMarketContext])

  // Track if user is near bottom for auto-scroll
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)
  
  // Check if user is near bottom of scroll container
  const checkIfNearBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return true
    const threshold = 100 // pixels from bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold
  }, [])
  
  // Handle scroll to update isNearBottom
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    
    const handleScroll = () => {
      isNearBottomRef.current = checkIfNearBottom()
    }
    
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [checkIfNearBottom])
  
  // Auto-scroll to bottom (only if user is near bottom)
  useEffect(() => {
    if (!isNearBottomRef.current) return
    const container = messagesContainerRef.current
    if (container) {
      // Use instant scroll to prevent jitter during streaming
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  // Handle sending
  const handleSend = useCallback(async (content: string) => {
    addMessage({ role: 'user', content, status: 'complete' })
    
    const assistantId = addMessage({
      role: 'assistant',
      content: '',
      status: 'streaming',
      context: { type: context.type },
    })
    
    setStreaming(true, assistantId)
    
    const messageHistory = messages.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
    messageHistory.push({ role: 'user', content })
    
    await sendMessage(
      messageHistory,
      context,
      (chunk) => appendToMessage(assistantId, chunk),
      () => {
        updateMessage(assistantId, { status: 'complete' })
        setStreaming(false, null)
      },
      (error) => {
        updateMessage(assistantId, { status: 'error', content: `Error: ${error}` })
        setStreaming(false, null)
      },
      (model, modelName) => updateMessage(assistantId, { model: modelName })
    )
  }, [messages, context, addMessage, updateMessage, appendToMessage, setStreaming, sendMessage])

  const handleFeedback = useCallback((id: string, feedback: FeedbackType) => {
    setFeedback(id, feedback)
  }, [setFeedback])

  return (
    <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* Header - Clean & Premium */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-4 sm:py-6 lg:py-8"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* AI Avatar */}
          <div className="relative">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
            </div>
            {/* Status indicator */}
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 border-[#0c0e14]",
              isLoadingContext ? "bg-amber-400" : "bg-emerald-400"
            )} />
          </div>
          
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white tracking-tight">
              AI Assistant
            </h1>
            <p className="text-xs sm:text-sm text-white/40 font-light mt-0.5 sm:mt-1 leading-relaxed hidden sm:block">
              Intelligent insights powered by real-time market data
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={fetchMarketContext}
            disabled={isLoadingContext}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg sm:rounded-xl transition-all duration-200"
            title="Refresh market data"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isLoadingContext && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={clearMessages}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg sm:rounded-xl transition-all duration-200"
          >
            Clear
          </button>
        </div>
      </motion.header>

      {/* Chat Container - Glass Surface */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl sm:rounded-2xl overflow-hidden flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      >
        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 space-y-3 sm:space-y-6"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16">
              {/* AI Avatar - Large */}
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500/15 to-cyan-500/15 backdrop-blur-sm border border-white/[0.06] flex items-center justify-center mb-4 sm:mb-6 shadow-[0_12px_32px_rgba(0,0,0,0.15)]">
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-white/50" />
              </div>
              
              <h3 className="text-lg sm:text-xl font-medium text-white tracking-tight mb-2 sm:mb-3">
                Start a Conversation
              </h3>
              <p className="text-white/40 text-xs sm:text-sm font-light max-w-md mx-auto text-center leading-relaxed px-4">
                Ask about stocks, market trends, financial metrics, or investment strategies. 
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                onFeedback={handleFeedback}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions - Premium Cards */}
        {messages.length === 0 && (
          <div className="px-4 sm:px-6 lg:px-8 py-5 border-t border-white/[0.04]">
            <SuggestedQuestions
              onSelect={handleSend}
              maxQuestions={4}
            />
          </div>
        )}

        {/* Input Section - Glass Container */}
        <div className="p-4 sm:p-5 lg:p-6 border-t border-white/[0.04] bg-white/[0.01]">
          <MessageInput
            onSend={handleSend}
            onStop={abort}
            isStreaming={isStreaming}
            placeholder="Ask about stocks, markets, or financial concepts..."
          />
          <p className="text-[11px] text-white/25 mt-3 text-center font-light">
            AI responses are based on provided data only. Not financial advice.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
