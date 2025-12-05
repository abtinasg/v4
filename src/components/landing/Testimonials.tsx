'use client'

import { Quote, Star, Users } from 'lucide-react'

const testimonials = [
  {
    quote: "Deep Terminal transformed how I approach investing. The AI orchestrator catches patterns I'd never see on my own.",
    author: 'Michael Chen',
    role: 'Day Trader',
    avatar: 'MC',
    rating: 5,
    gradient: 'from-[#5B7CFF] to-[#00C9E4]'
  },
  {
    quote: "Finally, institutional-grade analytics without the Bloomberg price tag. The metrics library alone is worth every credit.",
    author: 'Sarah Williams',
    role: 'Portfolio Manager',
    avatar: 'SW',
    rating: 5,
    gradient: 'from-[#00C9E4] to-[#8B5CF6]'
  },
  {
    quote: "The multi-model AI analysis is brilliant. Getting comprehensive market insights in seconds is absolutely game-changing.",
    author: 'David Park',
    role: 'Quantitative Analyst',
    avatar: 'DP',
    rating: 5,
    gradient: 'from-[#8B5CF6] to-[#5B7CFF]'
  }
]

const stats = [
  { value: '10K+', label: 'Active Investors', color: '#5B7CFF' },
  { value: '2.3M', label: 'AI Queries/Month', color: '#00C9E4' },
  { value: '99.9%', label: 'Platform Uptime', color: '#22C55E' },
  { value: '4.9/5', label: 'User Rating', color: '#F59E0B' }
]

export function Testimonials() {
  return (
    <section className="relative py-28 md:py-36 bg-[#030508] overflow-hidden">
      {/* Premium ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute top-[30%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#5B7CFF]/[0.03] blur-[150px]" />
        <div className="absolute bottom-[30%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/[0.03] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 pb-16 border-b border-white/[0.04]">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5B7CFF]/20 bg-[#5B7CFF]/[0.06] px-5 py-2 text-sm font-medium text-[#5B7CFF] mb-8">
            <Users className="h-4 w-4" />
            Trusted by Investors
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-5xl font-semibold tracking-tight text-white mb-6">
            What Our{' '}
            <span className="bg-gradient-to-r from-[#5B7CFF] via-[#00C9E4] to-[#8B5CF6] bg-clip-text text-transparent">
              Users Say
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed font-light">
            Join thousands of investors who've upgraded their edge with Deep Terminal.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 backdrop-blur-sm transition-all duration-500 hover:border-white/[0.12]"
            >
              {/* Quote icon */}
              <Quote className="h-10 w-10 text-[#8B5CF6]/20 mb-6" />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-base text-gray-300 leading-relaxed mb-8">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-sm font-bold text-white shadow-lg`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{testimonial.author}</div>
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
