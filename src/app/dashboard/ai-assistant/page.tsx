'use client'

import { useState } from 'react'
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react'

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI financial assistant. I can help you analyze stocks, understand market trends, and answer questions about your portfolio. How can I help you today?",
    },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return

    setMessages((prev) => [...prev, { role: 'user', content: input }])
    setInput('')

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm analyzing your request. This is a demo response. In the full version, I'll be able to provide detailed financial analysis, market insights, and personalized recommendations based on your portfolio and investment goals.",
        },
      ])
    }, 1000)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            AI Assistant
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Get intelligent insights about stocks and markets
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">Online</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-[#0d0d0f] border border-white/10 rounded-xl overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant'
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-400'
                    : 'bg-white/10'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={`max-w-[70%] p-4 rounded-xl ${
                  message.role === 'assistant'
                    ? 'bg-white/5 border border-white/10'
                    : 'bg-blue-500/20 border border-blue-500/30'
                }`}
              >
                <p className="text-sm text-gray-300 leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="px-6 py-4 border-t border-white/5">
          <p className="text-xs text-gray-500 mb-3">Suggested prompts</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Analyze AAPL stock',
              'Market outlook today',
              'Best tech stocks to watch',
              'Explain P/E ratio',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="px-3 py-1.5 text-xs text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about stocks, markets, or your portfolio..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-2 text-center">
            AI can make mistakes. Always verify important financial information.
          </p>
        </div>
      </div>
    </div>
  )
}
