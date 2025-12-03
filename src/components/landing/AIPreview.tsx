'use client'

import { Bot, Send } from 'lucide-react'

const sampleQuestions = [
  "What's the current P/E ratio for AAPL?",
  "Compare NVDA vs AMD fundamentals",
  "Is Tesla overvalued right now?",
  "Explain Microsoft's revenue growth",
]

export function AIPreview() {
  return (
    <section className="relative py-32 bg-[#030407] overflow-hidden">
      {/* Ambient glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left: Copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6366F1]/20 bg-[#6366F1]/[0.06] px-4 py-1.5">
              <Bot className="h-3.5 w-3.5 text-[#6366F1]" />
              <span className="text-xs text-[#6366F1] font-medium tracking-wide">
                AI-Powered
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
              Ask anything about
              <br />
              <span className="text-[#64748B]">any stock.</span>
            </h2>
            
            <p className="text-lg text-[#64748B] font-light leading-relaxed max-w-md">
              Natural language queries. Instant, intelligent answers backed by real-time data and 150+ financial metrics.
            </p>

            {/* Sample Questions */}
            <div className="space-y-2 pt-4">
              <p className="text-xs text-[#475569] uppercase tracking-wider font-medium">Try asking</p>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.slice(0, 2).map((q) => (
                  <span 
                    key={q}
                    className="
                      text-xs text-[#94A3B8] 
                      px-3 py-1.5 rounded-lg
                      bg-white/[0.02] border border-white/[0.04]
                    "
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Chat Preview Card */}
          <div className="relative">
            {/* Glow behind */}
            <div 
              className="absolute -inset-4 opacity-60"
              style={{
                background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)',
              }}
            />
            
            {/* Chat Card */}
            <div className="
              relative rounded-2xl
              bg-gradient-to-b from-white/[0.03] to-white/[0.01]
              border border-white/[0.06]
              backdrop-blur-xl
              shadow-[0_16px_48px_-12px_rgba(0,0,0,0.4)]
              overflow-hidden
            ">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/[0.04] flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#6366F1]/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-[#6366F1]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">DeepIn AI</div>
                  <div className="text-[11px] text-[#475569]">Always learning, always ready</div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[280px]">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="
                    max-w-[80%] rounded-2xl rounded-br-md
                    px-4 py-2.5
                    bg-[#6366F1] text-white text-sm
                  ">
                    Is Apple a good investment right now?
                  </div>
                </div>

                {/* AI response */}
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3.5 w-3.5 text-[#6366F1]" />
                  </div>
                  <div className="
                    max-w-[85%] rounded-2xl rounded-tl-md
                    px-4 py-3
                    bg-white/[0.03] border border-white/[0.04]
                  ">
                    <p className="text-sm text-[#E2E8F0] leading-relaxed">
                      Based on current data, Apple (AAPL) shows:
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-[#94A3B8]">
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-[#34D399]" />
                        P/E ratio of 28.4 (slightly above sector avg)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-[#34D399]" />
                        Strong revenue growth: +8.2% YoY
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-[#F59E0B]" />
                        RSI at 62 (approaching overbought)
                      </li>
                    </ul>
                    <p className="mt-3 text-sm text-[#94A3B8]">
                      <span className="text-[#6366F1]">Verdict:</span> Solid fundamentals, but consider waiting for a pullback given current momentum.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-white/[0.04]">
                <div className="
                  flex items-center gap-3
                  rounded-xl
                  bg-white/[0.02] border border-white/[0.04]
                  px-4 py-2.5
                ">
                  <input 
                    type="text"
                    placeholder="Ask about any stock..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-[#475569] outline-none"
                    disabled
                  />
                  <button className="h-8 w-8 rounded-lg bg-[#6366F1] flex items-center justify-center">
                    <Send className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
