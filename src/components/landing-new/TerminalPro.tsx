import Image from 'next/image'
import { ArrowRight, Zap } from 'lucide-react'

export function TerminalPro() {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">Professional Trading Terminal</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Meet our Terminal Pro
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Real-time market data, advanced charting, and institutional-grade analytics in one powerful platform
          </p>
        </div>

        {/* Terminal Image */}
        <div className="relative group">
          {/* Glow effect behind image */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Image container with border */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/50 backdrop-blur-sm">
            <Image
              src="/terminal.jpeg"
              alt="Terminal Pro Interface"
              width={1400}
              height={800}
              className="w-full h-auto"
              priority
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent opacity-60" />
          </div>

          {/* Feature badges on image */}
          <div className="absolute bottom-8 left-8 right-8 flex flex-wrap gap-3">
            {[
              'Real-time Data',
              'Advanced Charts',
              'News Terminal',
              'Portfolio Tracking',
              'AI Insights'
            ].map((feature) => (
              <div
                key={feature}
                className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors text-white font-semibold text-lg group"
          >
            Try Terminal Pro Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-sm text-zinc-500 mt-4">
            No credit card required · Start with 50 free credits
          </p>
        </div>
      </div>
    </section>
  )
}
