'use client'

import { useEffect, useRef, useCallback } from 'react'
import { MessageSquare } from 'lucide-react'
import { useChatStore } from '@/lib/stores/chat-store'
import { Message } from '@/components/ai/Message'
import { MessageInput } from '@/components/ai/MessageInput'
import { SuggestedQuestions } from '@/components/ai/SuggestedQuestions'
import type { FeedbackType } from '@/lib/stores/chat-store'

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

  // Set context for this page
  useEffect(() => {
    setContext({
      type: 'general',
      pageContext: {
        currentPage: 'AI Assistant',
      },
    })
  }, [setContext])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    <div className="h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            AI Assistant
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Get intelligent insights about stocks and markets (Real AI powered by Claude)
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={clearMessages}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            Clear Chat
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-[#0d0d0f] border border-white/10 rounded-xl overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">Start a Conversation</h3>
              <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto px-4">
                Ask me about stocks, market trends, financial metrics, or investment strategies. 
                I use real-time data from Yahoo Finance and calculated metrics.
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

        {/* Suggestions - only show when no messages */}
        {messages.length === 0 && (
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t border-white/5">
            <SuggestedQuestions
              onSelect={handleSend}
              maxQuestions={4}
            />
          </div>
        )}

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-white/10">
          <MessageInput
            onSend={handleSend}
            onStop={abort}
            isStreaming={isStreaming}
            placeholder="Ask about stocks, markets, or financial concepts..."
          />
          <p className="text-[10px] text-gray-600 mt-2 text-center">
            AI responses are based on provided data only. Not financial advice.
          </p>
        </div>
      </div>
    </div>
  )
}
