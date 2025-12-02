'use client'

import { motion } from 'framer-motion'
import { Sparkles, Brain, ArrowRight, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/cinematic'

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={cn('h-full', className)}
    >
      <GlassCard className="h-full p-6 sm:p-8">
        {/* Subtle accent gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#9B87F5]/[0.04] via-transparent to-transparent pointer-events-none rounded-2xl" />
        
        <div className="relative space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#9B87F5]/10 border border-[#9B87F5]/15">
              <Brain className="w-4 h-4 text-[#9B87F5]" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white">AI Assistant</h3>
              <p className="text-xs text-white/35">Ask anything about markets</p>
            </div>
          </div>

          {/* Sample Questions */}
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wide font-medium mb-3">Try asking</p>
            {SAMPLE_QUESTIONS.map((question, i) => (
              <button
                key={i}
                onClick={() => router.push(`/dashboard/ai-assistant?q=${encodeURIComponent(question)}`)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl',
                  'bg-white/[0.02] border border-white/[0.04]',
                  'hover:bg-white/[0.04] hover:border-white/[0.08]',
                  'transition-all duration-200 group text-left'
                )}
              >
                <MessageSquare className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                <span className="text-sm text-white/60 flex-1 truncate group-hover:text-white/80 transition-colors">
                  {question}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-[#9B87F5] transition-colors" />
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => router.push('/dashboard/ai-assistant')}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl',
              'bg-[#9B87F5]/10 border border-[#9B87F5]/20',
              'hover:bg-[#9B87F5]/15 hover:border-[#9B87F5]/30',
              'transition-all duration-200'
            )}
          >
            <Sparkles className="w-4 h-4 text-[#9B87F5]" />
            <span className="text-sm font-medium text-[#9B87F5]">Open AI Assistant</span>
          </button>
        </div>
      </GlassCard>
    </motion.div>
  )
}
