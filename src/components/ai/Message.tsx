/**
 * Message Component
 * 
 * Single chat message with:
 * - Syntax highlighting for code blocks
 * - Copy message button
 * - Thumbs up/down feedback
 * - Streaming typewriter effect
 * - Avatar and timestamp
 */

'use client'

import React, { useState, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  User,
  Sparkles,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ChatMessage, FeedbackType } from '@/lib/stores/chat-store'

// ============================================================
// CODE BLOCK COMPONENT
// ============================================================

interface CodeBlockProps {
  code: string
  language?: string
}

const CodeBlock = memo(function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-3 rounded-lg bg-[#0d1117] border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs text-white/50 font-mono">
          {language || 'code'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-white/50 hover:text-white hover:bg-white/10"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span className="ml-1.5 text-xs">{copied ? 'Copied' : 'Copy'}</span>
        </Button>
      </div>
      {/* Code */}
      <pre className="p-4 overflow-x-auto text-sm font-mono text-white/90 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
})

// ============================================================
// MARKDOWN RENDERER
// ============================================================

interface MarkdownContentProps {
  content: string
}

const MarkdownContent = memo(function MarkdownContent({ content }: MarkdownContentProps) {
  // Parse and render markdown-like content
  const parts = useMemo(() => {
    const result: React.ReactNode[] = []
    let currentIndex = 0
    
    // Match code blocks
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
    let match
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > currentIndex) {
        const textBefore = content.slice(currentIndex, match.index)
        result.push(
          <span key={currentIndex} className="whitespace-pre-wrap">
            {renderInlineMarkdown(textBefore)}
          </span>
        )
      }
      
      // Add code block
      result.push(
        <CodeBlock
          key={match.index}
          language={match[1]}
          code={match[2].trim()}
        />
      )
      
      currentIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (currentIndex < content.length) {
      result.push(
        <span key={currentIndex} className="whitespace-pre-wrap">
          {renderInlineMarkdown(content.slice(currentIndex))}
        </span>
      )
    }
    
    return result
  }, [content])

  return <div className="space-y-1">{parts}</div>
})

// Render inline markdown (bold, italic, inline code)
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0
  
  // Simple patterns
  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, render: (m: string) => <strong key={key++} className="font-semibold text-white">{m}</strong> },
    { regex: /\*(.+?)\*/g, render: (m: string) => <em key={key++} className="italic">{m}</em> },
    { regex: /`([^`]+)`/g, render: (m: string) => <code key={key++} className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-sm">{m}</code> },
  ]
  
  // For simplicity, just do basic inline code detection
  const inlineCodeRegex = /`([^`]+)`/g
  const boldRegex = /\*\*(.+?)\*\*/g
  
  // Split by inline code first
  const codeMatches = [...text.matchAll(inlineCodeRegex)]
  if (codeMatches.length === 0) {
    // No inline code, check for bold
    const boldMatches = [...text.matchAll(boldRegex)]
    if (boldMatches.length === 0) {
      return [text]
    }
    
    let lastIndex = 0
    boldMatches.forEach((match, i) => {
      if (match.index! > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      parts.push(<strong key={`bold-${i}`} className="font-semibold text-white">{match[1]}</strong>)
      lastIndex = match.index! + match[0].length
    })
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }
    return parts
  }
  
  let lastIndex = 0
  codeMatches.forEach((match, i) => {
    if (match.index! > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <code key={`code-${i}`} className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-sm">
        {match[1]}
      </code>
    )
    lastIndex = match.index! + match[0].length
  })
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  
  return parts
}

// ============================================================
// MESSAGE COMPONENT
// ============================================================

export interface MessageProps {
  message: ChatMessage
  onFeedback?: (id: string, feedback: FeedbackType) => void
  onRegenerate?: (id: string) => void
  onCopy?: (content: string) => void
  isLast?: boolean
}

export const Message = memo(function Message({
  message,
  onFeedback,
  onRegenerate,
  onCopy,
  isLast = false,
}: MessageProps) {
  const [copied, setCopied] = useState(false)
  const [showActions, setShowActions] = useState(false)
  
  const isUser = message.role === 'user'
  const isStreaming = message.status === 'streaming'
  const isError = message.status === 'error'
  
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    onCopy?.(message.content)
    setTimeout(() => setCopied(false), 2000)
  }, [message.content, onCopy])
  
  const handleFeedback = useCallback((feedback: FeedbackType) => {
    if (message.feedback === feedback) {
      onFeedback?.(message.id, null)
    } else {
      onFeedback?.(message.id, feedback)
    }
  }, [message.id, message.feedback, onFeedback])
  
  const formattedTime = useMemo(() => {
    const date = new Date(message.timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }, [message.timestamp])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative flex gap-3 px-4 py-4',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
            : 'bg-gradient-to-br from-violet-500 to-purple-600',
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex-1 max-w-[85%]',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3',
            isUser
              ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 ml-auto'
              : 'bg-white/5 border border-white/10',
            isError && 'border-red-500/50 bg-red-500/10',
          )}
        >
          {/* Content */}
          <div
            className={cn(
              'text-sm leading-relaxed',
              isUser ? 'text-white' : 'text-white/90',
              isError && 'text-red-400',
            )}
          >
            {isUser ? (
              message.content
            ) : (
              <MarkdownContent content={message.content} />
            )}
            
            {/* Streaming cursor */}
            {isStreaming && (
              <motion.span
                className="inline-block w-2 h-4 ml-1 bg-cyan-400 rounded-sm"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </div>

          {/* Context badge for assistant messages */}
          {!isUser && message.context && (
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/40">
                Context: {message.context.type}
                {message.context.symbol && ` • ${message.context.symbol}`}
              </span>
              {message.model && (
                <span className="text-xs text-purple-400/70 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {message.model}
                </span>
              )}
            </div>
          )}
          
          {/* Show model even without context */}
          {!isUser && !message.context && message.model && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <span className="text-xs text-purple-400/70 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {message.model}
              </span>
            </div>
          )}
        </div>

        {/* Timestamp and Actions */}
        <div
          className={cn(
            'flex items-center gap-2 mt-1.5 px-1',
            isUser ? 'flex-row-reverse' : 'flex-row',
          )}
        >
          <span className="text-xs text-white/30">{formattedTime}</span>
          
          {/* Action buttons for assistant messages */}
          {!isUser && message.status === 'complete' && (
            <AnimatePresence>
              {(showActions || message.feedback) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-1"
                >
                  <TooltipProvider delayDuration={300}>
                    {/* Copy */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopy}
                          className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/10"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copied ? 'Copied!' : 'Copy message'}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Thumbs Up */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFeedback('positive')}
                          className={cn(
                            'h-6 w-6 hover:bg-white/10',
                            message.feedback === 'positive'
                              ? 'text-green-400'
                              : 'text-white/40 hover:text-white',
                          )}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Good response</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Thumbs Down */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFeedback('negative')}
                          className={cn(
                            'h-6 w-6 hover:bg-white/10',
                            message.feedback === 'negative'
                              ? 'text-red-400'
                              : 'text-white/40 hover:text-white',
                          )}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Poor response</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Regenerate (only for last message) */}
                    {isLast && onRegenerate && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRegenerate(message.id)}
                            className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/10"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Regenerate response</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  )
})

export default Message
