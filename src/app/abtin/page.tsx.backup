'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Brain } from 'lucide-react'
import DashboardSidebar from '@/components/abtin/DashboardSidebar'
import OverviewDashboard from '@/components/abtin/OverviewDashboard'

interface User {
  id: string
  username: string
  email?: string
  fullName?: string
}

export default function AbtinPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    verifySession()
  }, [])

  const verifySession = async () => {
    try {
      const response = await fetch('/api/abtin/auth/verify')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Session verification failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    try {
      const response = await fetch('/api/abtin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      
      if (response.status === 401) {
        const data = await response.json()
        setAuthError(data.error || 'Invalid username or password')
      } else if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setAuthError('Authentication failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setAuthError('Authentication failed. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0e14] flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]" />
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]" />
        </div>
      </div>
    )
  }

  // Old sendMessage function and other unused code removed...
    if (!content.trim() || isStreaming) return

    const credentials = sessionStorage.getItem('abtin_auth')
    if (!credentials) {
      setIsAuthenticated(false)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsStreaming(true)

    abortControllerRef.current = new AbortController()

    try {
      const messageHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
        ...(m.modelName && { modelName: m.modelName }),
      }))
      messageHistory.push({ role: 'user', content })

      // Multi-model mode: send to multiple models
      if (isMultiModel && selectedModels.length > 1) {
        const response = await fetch('/api/abtin/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`,
          },
          body: JSON.stringify({
            messages: messageHistory,
            mode,
            models: selectedModels, // Send array of models
            multiModel: true,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          if (response.status === 401) {
            setIsAuthenticated(false)
            sessionStorage.removeItem('abtin_auth')
            throw new Error('Authentication expired. Please login again.')
          }
          throw new Error(`Request failed: ${response.status}`)
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
              
              if (data.newMessage) {
                // Add a new message for a new model
                setMessages(prev => [...prev, {
                  id: data.messageId,
                  role: 'assistant',
                  content: data.content || '',
                  timestamp: new Date(),
                  modelName: data.modelName,
                }])
              } else if (data.content) {
                // Update existing message
                setMessages(prev => {
                  const updated = [...prev]
                  const msgIndex = updated.findIndex(m => m.id === data.messageId)
                  if (msgIndex !== -1 && updated[msgIndex].role === 'assistant') {
                    updated[msgIndex].content += data.content
                  }
                  return updated
                })
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } else {
        // Single model mode (original behavior)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, assistantMessage])

        const response = await fetch('/api/abtin/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`,
          },
          body: JSON.stringify({
            messages: messageHistory,
            mode,
            model,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          if (response.status === 401) {
            setIsAuthenticated(false)
            sessionStorage.removeItem('abtin_auth')
            throw new Error('Authentication expired. Please login again.')
          }
          throw new Error(`Request failed: ${response.status}`)
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
              if (data.modelName) setCurrentModelName(data.modelName)
              if (data.content) {
                setMessages(prev => {
                  const updated = [...prev]
                  const lastMsg = updated[updated.length - 1]
                  if (lastMsg.role === 'assistant') {
                    lastMsg.content += data.content
                    lastMsg.modelName = data.modelName
                  }
                  return updated
                })
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error: unknown) {
      if ((error as Error).name === 'AbortError') return
      
      setMessages(prev => {
        const updated = [...prev]
        const lastMsg = updated[updated.length - 1]
        if (lastMsg.role === 'assistant') {
          lastMsg.content = `Error: ${(error as Error).message || 'An error occurred'}`
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }, [messages, mode, model, isStreaming, isMultiModel, selectedModels])

  const handleStop = () => {
    abortControllerRef.current?.abort()
    setIsStreaming(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const clearChat = () => {
    setMessages([])
    setCurrentModelName('')
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0c0e14] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white/70" />
              </div>
            </div>
            
            <h1 className="text-2xl font-semibold text-white text-center mb-2">
              Abtin Psychologist AI
            </h1>
            <p className="text-white/40 text-sm text-center mb-6">
              Enter your credentials to access the AI psychologist
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Enter password"
                  required
                />
              </div>

              {authError && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Login
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  // Main chat interface
  return (
    <div className="min-h-screen bg-[#0c0e14] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.05] bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white/70" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Abtin Psychologist AI</h1>
                <p className="text-xs text-white/40">Your AI-powered thinking partner</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                sessionStorage.removeItem('abtin_auth')
                setIsAuthenticated(false)
              }}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="border-b border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="space-y-4">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {(['brainstorm', 'debate'] as Mode[]).map((m) => {
                  const info = MODE_INFO[m]
                  const Icon = info.icon
                  return (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      disabled={isStreaming}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-xl border transition-all',
                        mode === m
                          ? `bg-gradient-to-br ${info.color} ${info.borderColor} border-2`
                          : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04]',
                        isStreaming && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', mode === m ? info.textColor : 'text-white/40')} />
                      <span className={cn('text-sm font-medium', mode === m ? 'text-white' : 'text-white/60')}>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-white/40 mt-2">{MODE_INFO[mode].description}</p>
            </div>

            {/* Multi-Model Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const newMultiModel = !isMultiModel
                  setIsMultiModel(newMultiModel)
                  if (newMultiModel && selectedModels.length === 0) {
                    setSelectedModels([model])
                  }
                }}
                disabled={isStreaming}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm',
                  isMultiModel
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 border-2'
                    : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04]',
                  isStreaming && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Brain className={cn('w-4 h-4', isMultiModel ? 'text-purple-400' : 'text-white/40')} />
                <span className={cn('font-medium', isMultiModel ? 'text-white' : 'text-white/60')}>
                  Multi-Model Collaboration
                </span>
              </button>
              {isMultiModel && (
                <span className="text-xs text-white/40">
                  {mode === 'brainstorm' 
                    ? 'Models will build on each other\'s ideas' 
                    : 'Models will debate and challenge each other'}
                </span>
              )}
            </div>

            {/* Model Selection */}
            {isMultiModel ? (
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Select Models (check all that should participate)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {MODELS.map((m) => {
                    const isSelected = selectedModels.includes(m.value)
                    return (
                      <button
                        key={m.value}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedModels(selectedModels.filter(sm => sm !== m.value))
                          } else {
                            setSelectedModels([...selectedModels, m.value])
                          }
                        }}
                        disabled={isStreaming}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm text-left',
                          isSelected
                            ? 'bg-violet-500/20 border-violet-500/40 border-2'
                            : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04]',
                          isStreaming && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center',
                          isSelected ? 'bg-violet-500 border-violet-500' : 'border-white/20'
                        )}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span className={cn('font-medium', isSelected ? 'text-white' : 'text-white/60')}>
                          {m.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-white/40 mt-2">
                  {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
                  {selectedModels.length < 2 && ' (select at least 2 for collaboration)'}
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm text-white/60 mb-2">AI Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as Model)}
                  disabled={isStreaming}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50"
                >
                  {MODELS.map((m) => (
                    <option key={m.value} value={m.value} className="bg-[#0c0e14]">
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full flex flex-col px-4">
          <div className="flex-1 overflow-y-auto py-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/15 to-cyan-500/15 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white/50" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Ready to explore your thoughts?</h3>
                <p className="text-white/40 text-sm text-center max-w-md">
                  Choose a mode and start a conversation. I&apos;m here to help you think creatively or critically.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white/70" />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    {msg.role === 'assistant' && msg.modelName && (
                      <div className="text-xs text-white/40 px-2">
                        {msg.modelName}
                      </div>
                    )}
                    <div
                      className={cn(
                        'px-4 py-3 rounded-2xl',
                        msg.role === 'user'
                          ? 'bg-violet-500/20 text-white border border-violet-500/30'
                          : 'bg-white/[0.03] text-white/90 border border-white/[0.08]'
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="py-4 border-t border-white/[0.05]">
            {currentModelName && (
              <div className="text-xs text-white/40 mb-2">Using: {currentModelName}</div>
            )}
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Type your message... (${mode} mode)`}
                disabled={isStreaming}
                className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none disabled:opacity-50"
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={isStreaming || !inputValue.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
                {isStreaming ? (
                  <button
                    onClick={handleStop}
                    className="px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors"
                  >
                    <StopCircle className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={clearChat}
                    disabled={messages.length === 0}
                    className="px-4 py-3 bg-white/[0.03] text-white/60 border border-white/[0.08] rounded-xl hover:bg-white/[0.06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
