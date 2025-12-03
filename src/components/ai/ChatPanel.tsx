/**
 * Chat Panel Component
 * 
 * Main chat interface container with:
 * - Floating bubble trigger
 * - Slide-out panel or modal
 * - Message history with virtualization
 * - Streaming responses
 * - Context awareness
 * - Smooth animations
 */

'use client'

import React, { useCallback, useRef, useEffect, useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Settings,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Message } from './Message'
import { MessageInput } from './MessageInput'
import { SuggestedQuestions } from './SuggestedQuestions'
import { ContextBadge } from './ContextBadge'
import { BrainstormToggle } from './BrainstormMode'
import { QuickActions, parseCommand } from './QuickActions'
import {
  useChatStore,
  type ChatMessage,
  type FeedbackType,
} from '@/lib/stores/chat-store'
import { triggerCreditRefresh } from '@/lib/hooks/use-credits'

// ============================================================
// TYPES
// ============================================================

export interface ChatPanelProps {
  className?: string
  position?: 'right' | 'left'
  defaultOpen?: boolean
}

// ============================================================
// CHAT API HOOK
// ============================================================

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
      if (!reader) {
        throw new Error('Response body not readable')
      }
      
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
            if (data.error) {
              throw new Error(data.error)
            }
            if (data.model && data.modelName) {
              onModelInfo?.(data.model, data.modelName)
            }
            if (data.content) {
              onChunk(data.content)
            }
          } catch (e) {
            // Skip malformed JSON
          }
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

// ============================================================
// MAIN CHAT PANEL COMPONENT
// ============================================================

export const ChatPanel = memo(function ChatPanel({
  className,
  position = 'right',
  defaultOpen = false,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  // Store state
  const isOpen = useChatStore((s) => s.isOpen)
  const isMinimized = useChatStore((s) => s.isMinimized)
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const context = useChatStore((s) => s.context)
  const streamingMessageId = useChatStore((s) => s.streamingMessageId)
  
  // Actions
  const setOpen = useChatStore((s) => s.setOpen)
  const toggleOpen = useChatStore((s) => s.toggleOpen)
  const setMinimized = useChatStore((s) => s.setMinimized)
  const addMessage = useChatStore((s) => s.addMessage)
  const updateMessage = useChatStore((s) => s.updateMessage)
  const appendToMessage = useChatStore((s) => s.appendToMessage)
  const setStreaming = useChatStore((s) => s.setStreaming)
  const setFeedback = useChatStore((s) => s.setFeedback)
  const clearMessages = useChatStore((s) => s.clearMessages)
  
  // AI Settings
  const aiSettings = useChatStore((s) => s.aiSettings)
  const setBrainstormMode = useChatStore((s) => s.setBrainstormMode)
  
  // Input state for quick actions
  const [inputValue, setInputValue] = React.useState('')
  
  const { sendMessage, abort } = useChatApi()
  
  // Track if user is near bottom for auto-scroll
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
  const scrollToBottom = useCallback((force = false) => {
    if (!force && !isNearBottomRef.current) return
    const container = messagesContainerRef.current
    if (container) {
      // Use instant scroll during streaming to prevent jitter
      container.scrollTop = container.scrollHeight
    }
  }, [])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])
  
  // Handle sending a message
  const handleSend = useCallback(async (content: string) => {
    // Parse command if starts with /
    const parsed = parseCommand(content)
    
    // Build actual message content
    let messageContent = content
    let enhancedContext = context
    
    // Handle special commands
    if (parsed.type === 'analyze' && parsed.symbols?.length) {
      messageContent = `Analyze ${parsed.symbols.join(', ')} - provide a comprehensive analysis including valuation, growth prospects, and risks.`
    } else if (parsed.type === 'compare' && parsed.symbols?.length) {
      messageContent = `Compare ${parsed.symbols.join(' vs ')} - analyze their valuations, growth, financials, and which one is a better investment.`
    } else if (parsed.type === 'brainstorm') {
      messageContent = `🧠 BRAINSTORM MODE: ${parsed.params?.topic || 'Generate investment ideas and perspectives'}`
    }
    
    // Add brainstorm prefix if mode is active
    if (aiSettings.brainstormMode && parsed.type === 'text') {
      messageContent = `🧠 BRAINSTORM: ${content}\n\nGenerate multiple perspectives, ideas, and angles on this topic. Be creative and consider contrarian viewpoints.`
    }
    
    // Add user message
    addMessage({
      role: 'user',
      content,
      status: 'complete',
    })
    
    // Add placeholder for assistant response
    const assistantId = addMessage({
      role: 'assistant',
      content: '',
      status: 'streaming',
      context: {
        type: context.type,
        symbol: context.stock?.symbol,
      },
    })
    
    setStreaming(true, assistantId)
    
    // Prepare message history for API
    const messageHistory = messages.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
    messageHistory.push({ role: 'user', content })
    
    await sendMessage(
      messageHistory,
      context,
      // On chunk
      (chunk) => {
        appendToMessage(assistantId, chunk)
      },
      // On complete
      () => {
        updateMessage(assistantId, { status: 'complete' })
        setStreaming(false, null)
        // Refresh credit balance after AI response
        triggerCreditRefresh()
      },
      // On error
      (error) => {
        updateMessage(assistantId, { 
          status: 'error', 
          content: `Error: ${error}` 
        })
        setStreaming(false, null)
        // Also refresh on error (credits might have been deducted)
        triggerCreditRefresh()
      },
      // On model info
      (model, modelName) => {
        updateMessage(assistantId, { model: modelName })
      }
    )
  }, [messages, context, addMessage, updateMessage, appendToMessage, setStreaming, sendMessage])
  
  // Handle stopping generation
  const handleStop = useCallback(() => {
    abort()
    if (streamingMessageId) {
      updateMessage(streamingMessageId, { status: 'complete' })
    }
    setStreaming(false, null)
  }, [abort, streamingMessageId, updateMessage, setStreaming])
  
  // Handle regenerating last response
  const handleRegenerate = useCallback(async (id: string) => {
    // Find the user message before this assistant message
    const messageIndex = messages.findIndex((m) => m.id === id)
    if (messageIndex <= 0) return
    
    const userMessage = messages[messageIndex - 1]
    if (userMessage.role !== 'user') return
    
    // Update the assistant message to streaming
    updateMessage(id, { content: '', status: 'streaming' })
    setStreaming(true, id)
    
    // Prepare message history
    const messageHistory = messages.slice(0, messageIndex - 1).slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
    messageHistory.push({ role: 'user', content: userMessage.content })
    
    await sendMessage(
      messageHistory,
      context,
      (chunk) => appendToMessage(id, chunk),
      () => {
        updateMessage(id, { status: 'complete', feedback: null })
        setStreaming(false, null)
      },
      (error) => {
        updateMessage(id, { status: 'error', content: `Error: ${error}` })
        setStreaming(false, null)
      }
    )
  }, [messages, context, updateMessage, appendToMessage, setStreaming, sendMessage])
  
  // Handle feedback
  const handleFeedback = useCallback((id: string, feedback: FeedbackType) => {
    setFeedback(id, feedback)
  }, [setFeedback])
  
  // Handle suggested question selection
  const handleSuggestedQuestion = useCallback((question: string) => {
    handleSend(question)
  }, [handleSend])

  return (
    <>
      {/* Floating Trigger Button - Premium Fintech Design */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed z-50',
              'bottom-6 sm:bottom-8',
              position === 'right' ? 'right-6 sm:right-8' : 'left-6 sm:left-8',
            )}
          >
            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      toggleOpen();
                      if (navigator.vibrate) navigator.vibrate(10);
                    }}
                    className={cn(
                      // Base sizing with comfortable internal padding
                      'h-12 w-12 sm:h-[52px] sm:w-[52px] p-3 sm:p-3.5',
                      'rounded-full',
                      // Premium glassmorphism background
                      'bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-indigo-950/90',
                      'backdrop-blur-md',
                      // Subtle depth shadow (blur 18px, low alpha)
                      'shadow-[0_8px_20px_-4px_rgba(0,0,0,0.35),0_4px_8px_-2px_rgba(0,0,0,0.2)]',
                      // Thin premium border
                      'border border-white/[0.06]',
                      'ring-1 ring-white/[0.04] ring-inset',
                      // Smooth hover - no aggressive scale
                      'hover:bg-gradient-to-br hover:from-slate-700/90 hover:via-slate-800/95 hover:to-indigo-900/90',
                      'hover:border-white/[0.08]',
                      'hover:shadow-[0_10px_24px_-4px_rgba(0,0,0,0.4),0_6px_12px_-2px_rgba(0,0,0,0.25)]',
                      'transition-all duration-300 ease-out',
                      // Focus state for accessibility
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                      'group relative touch-manipulation',
                    )}
                  >
                    {/* Clean icon with thin stroke and muted opacity */}
                    <MessageCircle 
                      className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-white/85 group-hover:text-white/95 transition-colors duration-300" 
                      strokeWidth={1.5}
                    />
                    
                    {/* Premium notification badge - subtle and refined */}
                    {messages.length > 0 && (
                      <span 
                        className={cn(
                          'absolute -top-0.5 -right-0.5',
                          'min-w-[18px] h-[18px] px-1',
                          'rounded-full',
                          // Soft red with low saturation
                          'bg-gradient-to-br from-rose-500/90 to-red-600/85',
                          'shadow-[0_2px_6px_-1px_rgba(220,38,38,0.35),inset_0_1px_1px_rgba(255,255,255,0.15)]',
                          'border border-slate-900/60',
                          // Typography
                          'text-[10px] font-medium text-white/90',
                          'flex items-center justify-center',
                          'transition-transform duration-200',
                        )}
                      >
                        {messages.length > 9 ? '9+' : messages.length}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="left" 
                  sideOffset={12}
                  className="bg-slate-900/95 backdrop-blur-sm border-white/[0.06] text-white/90 text-xs font-medium px-3 py-1.5"
                >
                  <p>AI Assistant</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop Overlay - Mobile Only */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setOpen(false);
              if (navigator.vibrate) navigator.vibrate(10);
            }}
            className="sm:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            dragSnapToOrigin
            onDragEnd={(event, info) => {
              // Swipe down to dismiss on mobile
              if (info.offset.y > 100 && window.innerWidth < 640) {
                setOpen(false);
                // Haptic feedback
                if (navigator.vibrate) {
                  navigator.vibrate(50);
                }
              }
            }}
            initial={{ opacity: 0, y: position === 'right' ? 400 : -400 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              height: isMinimized ? 'auto' : '600px',
            }}
            exit={{ opacity: 0, y: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 sm:bottom-6 z-50',
              'w-full sm:w-[400px] md:w-[420px] max-w-full sm:max-w-[calc(100vw-48px)]',
              'flex flex-col overflow-hidden',
              'rounded-t-2xl sm:rounded-2xl',
              'bg-[#0a0d12]/95 backdrop-blur-xl',
              'border-t-2 border-x-0 sm:border border-white/10 shadow-2xl shadow-black/40',
              'touch-pan-y',
              position === 'right' ? 'right-0 sm:right-6' : 'left-0 sm:left-6',
              className,
            )}
            style={{
              height: isMinimized ? 'auto' : 'min(480px, 65vh)',
              maxHeight: 'min(600px, 75vh)',
            }}
          >
            {/* Swipe Indicator - Mobile Only */}
            <div className="sm:hidden flex items-center justify-center py-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1 rounded-full bg-white/20" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">AI Assistant</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <ContextBadge />
                    {/* Model badge - auto selected */}
                    
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-0.5 sm:gap-1">
                {/* Brainstorm Toggle */}
                <div className="mr-1">
                  <BrainstormToggle
                    isActive={aiSettings.brainstormMode}
                    onToggle={() => setBrainstormMode(!aiSettings.brainstormMode)}
                  />
                </div>
                
                {/* Clear chat */}
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          clearMessages();
                          if (navigator.vibrate) navigator.vibrate(10);
                        }}
                        disabled={messages.length === 0}
                        className="h-7 w-7 sm:h-8 sm:w-8 text-white/50 hover:text-white hover:bg-white/10"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear chat</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Minimize */}
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setMinimized(!isMinimized);
                          if (navigator.vibrate) navigator.vibrate(10);
                        }}
                        className="h-7 w-7 sm:h-8 sm:w-8 text-white/50 hover:text-white hover:bg-white/10"
                      >
                        {isMinimized ? (
                          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isMinimized ? 'Expand' : 'Minimize'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Close */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setOpen(false);
                    if (navigator.vibrate) navigator.vibrate(10);
                  }}
                  className="h-7 w-7 sm:h-8 sm:w-8 text-white/50 hover:text-white hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto min-h-0"
                  style={{ maxHeight: 'calc(65vh - 120px)' }}
                >
                  {messages.length === 0 ? (
                    // Empty state
                    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-5 md:p-6 text-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-600/20 flex items-center justify-center mb-3 sm:mb-4">
                        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-cyan-400" />
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">
                        AI Financial Assistant
                      </h4>
                      <p className="text-xs sm:text-sm text-white/50 mb-4 sm:mb-5 md:mb-6 max-w-[280px]">
                        Ask me anything about stocks, markets, metrics, or your portfolio.
                      </p>
                      <SuggestedQuestions onSelect={handleSuggestedQuestion} />
                    </div>
                  ) : (
                    // Messages
                    <div className="py-2">
                      <AnimatePresence mode="popLayout">
                        {messages.map((message, index) => (
                          <Message
                            key={message.id}
                            message={message}
                            onFeedback={handleFeedback}
                            onRegenerate={handleRegenerate}
                            isLast={index === messages.length - 1}
                          />
                        ))}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-2.5 sm:p-3 md:p-4 border-t border-white/10 bg-white/5">
                  <MessageInput
                    onSend={handleSend}
                    onStop={handleStop}
                    isStreaming={isStreaming}
                    placeholder="Ask about stocks, metrics, or markets..."
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})

export default ChatPanel
