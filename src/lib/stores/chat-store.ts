/**
 * Chat Store - Zustand state management for AI chat
 * 
 * Features:
 * - Message history with streaming support
 * - Context awareness
 * - localStorage persistence
 * - Clear on logout
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AIContext, StockContext, MarketContext, PortfolioContext } from '@/lib/ai'

// ============================================================
// TYPES
// ============================================================

export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error'
export type FeedbackType = 'positive' | 'negative' | null

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  status: MessageStatus
  feedback?: FeedbackType
  context?: {
    type: string
    symbol?: string
  }
  tokenCount?: number
  model?: string
}

// News item for context
export interface NewsContextItem {
  headline: string
  summary: string
  category: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  source: string
  timeAgo: string
  symbol?: string
}

// Terminal/Market context
export interface TerminalContext {
  indices?: { symbol: string; name: string; price: number; change: number; changePercent: number }[]
  sectors?: { name: string; change: number }[]
  topGainers?: { symbol: string; name: string; price: number; changePercent: number }[]
  topLosers?: { symbol: string; name: string; price: number; changePercent: number }[]
  currencies?: { symbol: string; price: number; change: number }[]
  commodities?: { symbol: string; name: string; price: number; change: number }[]
  crypto?: { symbol: string; price: number; change: number }[]
  news?: { headline: string; time: string }[]
}

export interface ChatContext {
  type: 'general' | 'stock' | 'market' | 'portfolio' | 'screener' | 'news' | 'terminal'
  stock?: StockContext
  market?: MarketContext
  portfolio?: PortfolioContext
  screenerResults?: {
    count: number
    topResults: { symbol: string; name: string }[]
  }
  // News page context
  newsContext?: {
    recentNews: NewsContextItem[]
    newsCount: number
    sentimentBreakdown?: { bullish: number; bearish: number; neutral: number }
  }
  // Terminal Pro page context
  terminalContext?: TerminalContext
  pageContext?: {
    currentPage: string
    selectedTimeframe?: string
  }
}

// AI Settings
export interface AISettings {
  selectedModel: string
  brainstormMode: boolean
}

export interface ChatState {
  // Messages
  messages: ChatMessage[]
  isStreaming: boolean
  streamingMessageId: string | null
  
  // Context
  context: ChatContext
  
  // AI Settings
  aiSettings: AISettings
  
  // UI State
  isOpen: boolean
  isMinimized: boolean
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  appendToMessage: (id: string, content: string) => void
  deleteMessage: (id: string) => void
  clearMessages: () => void
  
  setStreaming: (isStreaming: boolean, messageId?: string | null) => void
  setFeedback: (id: string, feedback: FeedbackType) => void
  
  setContext: (context: Partial<ChatContext>) => void
  clearContext: () => void
  
  // AI Settings Actions
  setSelectedModel: (modelId: string) => void
  setBrainstormMode: (enabled: boolean) => void
  
  setOpen: (isOpen: boolean) => void
  toggleOpen: () => void
  setMinimized: (isMinimized: boolean) => void
  
  // Reset (for logout)
  reset: () => void
}

// ============================================================
// HELPERS
// ============================================================

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// ============================================================
// INITIAL STATE
// ============================================================

const initialContext: ChatContext = {
  type: 'general',
}

const initialAISettings: AISettings = {
  selectedModel: 'openai/gpt-4o',
  brainstormMode: false,
}

const initialState = {
  messages: [],
  isStreaming: false,
  streamingMessageId: null,
  context: initialContext,
  aiSettings: initialAISettings,
  isOpen: false,
  isMinimized: false,
}

// ============================================================
// STORE
// ============================================================

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Message actions
      addMessage: (message) => {
        const id = generateId()
        const newMessage: ChatMessage = {
          ...message,
          id,
          timestamp: new Date(),
        }
        set((state) => ({
          messages: [...state.messages, newMessage],
        }))
        return id
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        }))
      },

      appendToMessage: (id, content) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content: msg.content + content } : msg
          ),
        }))
      },

      deleteMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        }))
      },

      clearMessages: () => {
        set({ messages: [], streamingMessageId: null, isStreaming: false })
      },

      // Streaming actions
      setStreaming: (isStreaming, messageId = null) => {
        set({ isStreaming, streamingMessageId: messageId })
      },

      // Feedback
      setFeedback: (id, feedback) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, feedback } : msg
          ),
        }))
      },

      // Context actions
      setContext: (context) => {
        set((state) => ({
          context: { ...state.context, ...context },
        }))
      },

      clearContext: () => {
        set({ context: initialContext })
      },

      // AI Settings actions
      setSelectedModel: (modelId) => {
        set((state) => ({
          aiSettings: { ...state.aiSettings, selectedModel: modelId },
        }))
      },

      setBrainstormMode: (enabled) => {
        set((state) => ({
          aiSettings: { ...state.aiSettings, brainstormMode: enabled },
        }))
      },

      // UI actions
      setOpen: (isOpen) => {
        set({ isOpen, isMinimized: false })
      },

      toggleOpen: () => {
        const { isOpen, isMinimized } = get()
        if (isMinimized) {
          set({ isMinimized: false })
        } else {
          set({ isOpen: !isOpen })
        }
      },

      setMinimized: (isMinimized) => {
        set({ isMinimized })
      },

      // Reset for logout
      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'deep-terminal-chat',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        context: state.context,
      }),
      // Rehydrate dates properly
      onRehydrateStorage: () => (state) => {
        if (state?.messages) {
          state.messages = state.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        }
      },
    }
  )
)

// ============================================================
// SELECTORS
// ============================================================

export const selectMessages = (state: ChatState) => state.messages
export const selectIsStreaming = (state: ChatState) => state.isStreaming
export const selectContext = (state: ChatState) => state.context
export const selectIsOpen = (state: ChatState) => state.isOpen
export const selectLastMessage = (state: ChatState) => 
  state.messages[state.messages.length - 1]

// ============================================================
// HOOKS
// ============================================================

/**
 * Hook to get context-aware suggested questions
 */
export function useSuggestedQuestions(): string[] {
  const context = useChatStore((state) => state.context)
  
  const baseQuestions = [
    "What's the market outlook today?",
    "Explain key metrics for beginners",
    "What sectors are performing well?",
  ]
  
  if (context.type === 'stock' && context.stock?.symbol) {
    return [
      `What's your analysis of ${context.stock.symbol}?`,
      `Is ${context.stock.symbol} overvalued or undervalued?`,
      `What are the key risks for ${context.stock.symbol}?`,
      `How does ${context.stock.symbol} compare to competitors?`,
    ]
  }
  
  if (context.type === 'market') {
    return [
      "What's driving the market today?",
      "Which sectors should I watch?",
      "What's the VIX telling us?",
      "Are we in a bull or bear market?",
    ]
  }
  
  if (context.type === 'portfolio') {
    return [
      "How diversified is my portfolio?",
      "What's my sector allocation?",
      "Which holdings should I review?",
      "How can I reduce risk?",
    ]
  }
  
  if (context.type === 'screener' && context.screenerResults) {
    return [
      `Analyze the top ${context.screenerResults.count} screener results`,
      "What patterns do you see in these stocks?",
      "Which of these stocks look most promising?",
      "Compare the valuations of screened stocks",
    ]
  }
  
  return baseQuestions
}
