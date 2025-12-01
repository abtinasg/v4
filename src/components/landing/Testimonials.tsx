'use client'

import { Quote, Star } from 'lucide-react'

const testimonials = [
  {
    quote: "Deep changed how I approach trading. The AI orchestrator catches patterns I'd never see on my own.",
    author: 'Michael Chen',
    role: 'Day Trader',
    avatar: 'MC',
    rating: 5
  },
  {
    quote: "Finally, institutional-grade analytics without the Bloomberg price tag. The metrics library alone is worth it.",
    author: 'Sarah Williams',
    role: 'Portfolio Manager',
    avatar: 'SW',
    rating: 5
  },
  {
    quote: "The multi-model AI approach is brilliant. Getting consensus from GPT-4 and Claude on market analysis is game-changing.",
    author: 'David Park',
    role: 'Quantitative Analyst',
    avatar: 'DP',
    rating: 5
  }
]

const stats = [
  { value: '15K+', label: 'Active Traders' },
  { value: '2.3M', label: 'AI Queries/Month' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9', label: 'App Store Rating' }
]

export function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 bg-[#05070B] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full bg-[#00D4FF]/[0.02] blur-[150px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/[0.02] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Stats Bar */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 pb-20 border-b border-white/[0.04]"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div
          className="text-center mb-16"
        >
          <h2 className="text-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            Trusted by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6]">
              Traders
            </span>
          </h2>
          <p className="text-subhead text-gray-400 max-w-xl mx-auto">
            Join thousands of traders who've upgraded their edge.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={testimonial.author}
              className="group relative rounded-2xl border border-white/[0.05] bg-[#0A0D12]/60 p-8 backdrop-blur-sm hover:border-white/[0.08] transition-all duration-500"
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-[#8B5CF6]/30 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#8B5CF6]/30 to-[#00D4FF]/30 flex items-center justify-center text-sm font-medium text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{testimonial.author}</div>
                  <div className="text-xs text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
