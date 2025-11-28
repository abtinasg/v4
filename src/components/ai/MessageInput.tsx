/**
 * Message Input Component
 * 
 * Features:
 * - Auto-resizing textarea
 * - Voice input (optional)
 * - Send on Enter
 * - Character count
 * - Disabled state when streaming
 */

'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Mic,
  MicOff,
  Loader2,
  Paperclip,
  X,
  StopCircle,
  Command,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { QuickActions } from './QuickActions'

// ============================================================
// TYPES
// ============================================================

export interface MessageInputProps {
  onSend: (message: string) => void
  onStop?: () => void
  isStreaming?: boolean
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  showVoiceInput?: boolean
  showQuickActions?: boolean
  className?: string
}

// ============================================================
// VOICE INPUT HOOK
// ============================================================

function useVoiceInput(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('')
        
        if (event.results[0].isFinal) {
          onTranscript(transcript)
          setIsListening(false)
        }
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [onTranscript])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isListening])

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  }
}

// ============================================================
// MESSAGE INPUT COMPONENT
// ============================================================

export function MessageInput({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
  placeholder = 'Ask anything about stocks, markets, or metrics...',
  maxLength = 4000,
  showVoiceInput = true,
  showQuickActions = true,
  className,
}: MessageInputProps) {
  const [value, setValue] = useState('')
  const [showCommands, setShowCommands] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const { isListening, isSupported, startListening, stopListening } = useVoiceInput(
    (transcript) => {
      setValue((prev) => prev + (prev ? ' ' : '') + transcript)
    }
  )

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  // Show quick actions when typing /
  useEffect(() => {
    setShowCommands(value.startsWith('/'))
  }, [value])

  // Handle quick action selection
  const handleQuickActionSelect = useCallback((command: string) => {
    setValue(command)
    textareaRef.current?.focus()
    if (navigator.vibrate) navigator.vibrate(10)
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed && !isStreaming && !disabled) {
      onSend(trimmed)
      setValue('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }, [value, isStreaming, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const handleVoiceClick = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const charCount = value.length
  const isNearLimit = charCount > maxLength * 0.9
  const isOverLimit = charCount > maxLength

  return (
    <div className={cn('relative', className)}>
      {/* Quick Actions Popup */}
      {showQuickActions && showCommands && (
        <QuickActions
          input={value}
          onSelect={handleQuickActionSelect}
        />
      )}

      {/* Input Container */}
      <div
        className={cn(
          'relative flex items-end gap-2 rounded-2xl border bg-white/5 backdrop-blur-xl transition-all duration-200',
          'border-white/10 hover:border-white/20',
          'focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20',
          disabled && 'opacity-50 cursor-not-allowed',
          isListening && 'border-violet-500/50 ring-2 ring-violet-500/20',
        )}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40',
            'focus:outline-none disabled:cursor-not-allowed',
            'min-h-[44px] max-h-[200px]',
          )}
        />

        {/* Actions */}
        <div className="flex items-center gap-1 pr-2 pb-2">
          {/* Character count */}
          <AnimatePresence>
            {value.length > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  'text-xs mr-1',
                  isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-white/30',
                )}
              >
                {charCount}/{maxLength}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Voice Input */}
          {showVoiceInput && isSupported && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceClick}
                    disabled={disabled || isStreaming}
                    className={cn(
                      'h-8 w-8 rounded-full transition-all duration-200',
                      isListening
                        ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                        : 'text-white/50 hover:text-white hover:bg-white/10',
                    )}
                  >
                    {isListening ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <MicOff className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isListening ? 'Stop listening' : 'Voice input'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Send / Stop Button */}
          {isStreaming ? (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onStop}
                    className="h-8 w-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <StopCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Stop generating</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleSubmit}
                    disabled={!value.trim() || disabled || isOverLimit}
                    className={cn(
                      'h-8 w-8 rounded-full transition-all duration-200',
                      value.trim() && !isOverLimit
                        ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                        : 'text-white/30 hover:text-white/50 hover:bg-white/5',
                    )}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-8 left-0 right-0 flex items-center justify-center"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30">
              <motion.div
                className="w-2 h-2 rounded-full bg-violet-400"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-xs text-violet-300">Listening...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint text */}
      <div className="mt-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30">
            Press Enter to send, Shift+Enter for new line
          </span>
          <span className="text-xs text-white/20">•</span>
          <span className="text-xs text-white/30 flex items-center gap-1">
            <Command className="w-3 h-3" />
            Type / for commands
          </span>
        </div>
      </div>
    </div>
  )
}

export default MessageInput
