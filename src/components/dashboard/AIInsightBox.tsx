'use client'

import { motion } from 'framer-motion'
import { Sparkles, Brain, ArrowRight, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { GlassCard, PulsingDot } from '@/components/ui/cinematic'

interface AIInsightBoxProps {
  className?: string
}

const SAMPLE_QUESTIONS = [
  "What's moving the markets today?",
  "Analyze AAPL technicals",
  "Compare NVDA vs AMD",
  "Explain current VIX levels",
]

export function AIInsightBox({ className }: AIInsightBoxProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={className}
    >
      <GlassCard className="relative h-full p-4 sm:p-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/5 opacity-60" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/20">
              <Brain className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
                <PulsingDot color="cyan" size="sm" />
              </div>
              <p className="text-[10px] text-gray-500">Ask anything about markets</p>
            </div>
          </div>
        </div>

        {/* Sample Questions */}
        <div className="relative space-y-2 mb-4">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          {SAMPLE_QUESTIONS.map((question, i) => (
            <button
              key={i}
              onClick={() => router.push(`/dashboard/ai-assistant?q=${encodeURIComponent(question)}`)}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 text-left hover:bg-white/10 hover:border-violet-500/30 transition-all group"
            >
              <MessageSquare className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
              <span className="text-xs text-gray-300 flex-1 truncate">{question}</span>
              <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-violet-400 transition-colors" />
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push('/dashboard/ai-assistant')}
          className="relative w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Open AI Assistant</span>
        </button>
      </GlassCard>
    </motion.div>
  )
}
