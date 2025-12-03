'use client'

import { Sparkles, Send } from 'lucide-react'

const sampleQuestions = [
  "What's the P/E ratio for AAPL?",
  "Compare NVDA vs AMD",
]

export function AIPreview() {
  return (
    <section className="relative py-20 bg-[#030407] overflow-hidden">
      {/* Ambient glow - stronger */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] opacity-50 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.1) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left: Copy - Closer to chat */}
          <div className="space-y-5 lg:pr-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6366F1]/25 bg-[#6366F1]/[0.08] px-3 py-1">
              <Sparkles className="h-3 w-3 text-[#818CF8]" />
              <span className="text-[11px] text-[#818CF8] font-semibold tracking-wide uppercase">
                AI-Powered
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Ask anything about
              <span className="text-[#64748B]"> any stock.</span>
            </h2>
            
            <p className="text-base text-[#64748B] leading-relaxed max-w-md">
              Natural language queries. Instant answers backed by real-time data and 150+ financial metrics.
            </p>

            {/* Sample Questions - Compact */}
            <div className="space-y-2 pt-2">
              <p className="text-[10px] text-[#475569] uppercase tracking-wider font-semibold">Try asking</p>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((q) => (
                  <span 
                    key={q}
                    className="
                      text-xs text-[#94A3B8] 
                      px-3 py-1.5 rounded-lg
                      bg-white/[0.03] border border-white/[0.06]
                    "
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Chat Preview Card - 15% Larger */}
          <div className="relative">
            {/* Glow behind - stronger */}
            <div 
              className="absolute -inset-6 opacity-70"
              style={{
                background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(99, 102, 241, 0.12) 0%, transparent 60%)',
              }}
            />
            
            {/* Chat Card - Larger, with subtle glow */}
            <div 
              className="
                relative rounded-xl
                bg-[#0A0D12]/90
                border border-white/[0.08]
                backdrop-blur-md
                overflow-hidden
              "
              style={{
                boxShadow: `
                  0 24px 64px -16px rgba(0,0,0,0.6),
                  0 0 0 1px rgba(255,255,255,0.03) inset,
                  0 0 40px rgba(99,102,241,0.06)
                `,
              }}
            >
              {/* Gradient ring effect */}
              <div 
                className="absolute -inset-[1px] rounded-xl opacity-30 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.4) 0%, transparent 50%, rgba(34,211,238,0.2) 100%)',
                }}
              />
              
              {/* Header */}
              <div className="relative px-5 py-4 border-b border-white/[0.06] flex items-center gap-3 bg-white/[0.01]">
                <div className="h-9 w-9 rounded-lg bg-[#6366F1]/25 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#818CF8]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">DeepIn AI</div>
                  <div className="text-[10px] text-[#475569] font-medium">Always learning, always ready</div>
                </div>
              </div>

              {/* Messages - Larger */}
              <div className="relative p-5 space-y-4 min-h-[320px]">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="
                    max-w-[80%] rounded-xl rounded-br-sm
                    px-4 py-3
                    bg-gradient-to-r from-[#6366F1] to-[#818CF8]
                    text-white text-sm font-medium
                    shadow-[0_4px_16px_rgba(99,102,241,0.25)]
                  ">
                    Is Apple a good investment right now?
                  </div>
                </div>

                {/* AI response */}
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-[#818CF8]" />
                  </div>
                  <div className="
                    max-w-[90%] rounded-xl rounded-tl-sm
                    px-4 py-3.5
                    bg-white/[0.04] border border-white/[0.06]
                  ">
                    <p className="text-sm text-[#E2E8F0] leading-relaxed font-medium">
                      Based on current data, Apple (AAPL) shows:
                    </p>
                    <ul className="mt-2.5 space-y-2 text-sm text-[#94A3B8]">
                      <li className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
                        P/E ratio of 28.4 (slightly above sector avg)
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
                        Strong revenue growth: +8.2% YoY
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24]" />
                        RSI at 62 (approaching overbought)
                      </li>
                    </ul>
                    <p className="mt-3 text-sm text-[#94A3B8]">
                      <span className="text-[#818CF8] font-semibold">Verdict:</span> Solid fundamentals, consider waiting for a pullback.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="relative px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
                <div className="
                  flex items-center gap-3
                  rounded-lg
                  bg-white/[0.03] border border-white/[0.06]
                  px-4 py-3
                ">
                  <input 
                    type="text"
                    placeholder="Ask about any stock..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-[#475569] outline-none"
                    disabled
                  />
                  <button className="h-8 w-8 rounded-lg bg-[#6366F1]/20 flex items-center justify-center">
                    <Send className="h-4 w-4 text-[#818CF8]" />
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
