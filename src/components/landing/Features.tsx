'use client'

import {
  BrainCircuit,
  ChartCandlestick,
  Layers3,
  LayoutDashboard,
  Radio,
  ScanEye,
  Sparkles,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Database,
} from 'lucide-react'

// Mini chart for visual mockups
function MiniAreaChart({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <svg
      viewBox="0 0 100 40"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id={`areaGrad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,35 Q10,30 20,32 T40,25 T60,28 T80,15 T100,20 L100,40 L0,40 Z"
        fill={`url(#areaGrad-${color})`}
      />
      <path
        d="M0,35 Q10,30 20,32 T40,25 T60,28 T80,15 T100,20"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  )
}

// Metric counter with glow
function MetricCounter({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div 
        className="text-4xl md:text-5xl font-bold tracking-tight"
        style={{ color, textShadow: `0 0 30px ${color}50` }}
      >
        {value}
      </div>
      <div className="label-caps text-gray-500 mt-2">{label}</div>
    </div>
  )
}

const productPillars = [
  {
    icon: LayoutDashboard,
    title: 'Terminal Pro',
    description: 'Bloomberg-style command terminal with real-time market data, top movers, and instant stock lookup.',
    bullets: ['Type any symbol + GO', 'Live market indices', 'Keyboard shortcuts'],
    color: '#FF6B35',
    large: true,
  },
  {
    icon: Radio,
    title: 'Smart Watchlist',
    description: 'Track your favorite stocks with real-time prices and customizable alerts.',
    bullets: ['Price alerts', 'Portfolio tracking', 'Quick actions'],
    color: '#00D4FF',
    large: false,
  },
  {
    icon: BrainCircuit,
    title: 'AI Assistant',
    description: 'Ask questions about any stock and get instant, intelligent answers powered by advanced AI.',
    bullets: ['Natural language queries', 'Context-aware responses', 'Data-backed insights'],
    color: '#8B5CF6',
    large: false,
  },
  {
    icon: Layers3,
    title: '150+ Stock Metrics',
    description: 'Comprehensive fundamental and technical analysis with valuation, growth, profitability, and more.',
    bullets: ['Financial statements', 'Valuation ratios', 'Technical indicators'],
    color: '#00D4FF',
    large: true,
  },
]

const aiTimeline = [
  { label: 'Live Market Data', copy: 'Real-time prices, financial statements, and market news at your fingertips.', icon: Database },
  { label: 'AI-Powered Analysis', copy: 'Ask questions in plain English, get intelligent answers backed by data.', icon: BrainCircuit },
  { label: 'Personal Context', copy: 'Understands your portfolio and watchlist for personalized insights.', icon: Target },
  { label: 'Take Action', copy: 'Smart alerts, portfolio tracking, and instant stock lookup.', icon: Zap },
]

const metricHighlights = [
  { stat: '150+', label: 'Financial metrics', color: '#00D4FF' },
  { stat: '10+', label: 'Analysis categories', color: '#8B5CF6' },
  { stat: 'Live', label: 'Real-time data', color: '#FF6B35' },
]

export function Features() {
  return (
    <section className="relative overflow-hidden bg-[#080A0E]">
      {/* Section 1: Vision - Light weight */}
      <div className="relative py-32" id="vision">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#9A7BFF]/10 blur-[150px]" />
        
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center space-y-12">
          <div
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#9A7BFF]/30 bg-[#9A7BFF]/10 px-5 py-2 text-sm font-medium text-[#9A7BFF] glow-violet">
              <Sparkles className="h-4 w-4" />
              <span className="label-caps">Our Vision</span>
            </div>
            
            <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl text-white">
              Professional tools.{' '}
              <span className="text-glow-violet text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#FF6B35]">
                Simple to use.
              </span>
            </h2>
            
            <p className="subhead-light text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Everything you need to research, analyze, and track stocks—without the complexity or cost of Bloomberg Terminal.
            </p>
          </div>

          {/* Vision Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Powerful yet accessible', detail: 'Professional-grade analysis without the steep learning curve or high cost.' },
              { title: 'Real-time insights', detail: 'Live market data, instant analysis, and AI-powered answers at your fingertips.' },
              { title: 'Everything in one place', detail: 'Terminal, watchlist, portfolio, news, and AI assistant—all integrated seamlessly.' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm hover:border-[#9A7BFF]/30 hover:bg-[#9A7BFF]/5 transition-all duration-500"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity gradient-border" />
                <h3 className="text-lg font-semibold text-white mb-3 relative z-10">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed relative z-10">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Product Pillars - Heavy weight with Bento grid */}
      <div className="relative py-40 border-t border-white/5" id="terminal">
        {/* Multiple ambient glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#5BB9F7]/10 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#3FE3C2]/10 blur-[120px]" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 space-y-16">
          <div
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5"
          >
            <div className="space-y-3">
              <div className="label-caps text-[#00D4FF]">Everything You Need</div>
              <h3 className="heading-display text-3xl md:text-4xl text-white">Core Features</h3>
            </div>
            <p className="subhead-light text-gray-400 max-w-md">
              All the tools you need to research stocks, track your portfolio, and make informed decisions.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(280px,auto)]">
            {productPillars.map((pillar, i) => (
              <div
                key={pillar.title}
                className={`group relative rounded-3xl border border-white/5 bg-[#0C0E14]/80 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white/20 ${
                  pillar.large ? 'lg:col-span-2' : ''
                }`}
              >
                {/* Gradient stroke */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 gradient-border" />
                
                {/* Neon edge glow */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 1px 0 0 ${pillar.color}40, 0 0 30px ${pillar.color}15` }}
                />
                
                {/* Icon glow background */}
                <div 
                  className="absolute top-6 left-6 w-16 h-16 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
                  style={{ backgroundColor: pillar.color }}
                />
                
                <div className="relative z-10 p-8 h-full flex flex-col">
                  {/* Icon */}
                  <div 
                    className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-300"
                    style={{ 
                      backgroundColor: `${pillar.color}15`,
                      borderColor: `${pillar.color}30`,
                    }}
                  >
                    <pillar.icon className="h-7 w-7" style={{ color: pillar.color }} />
                  </div>
                  
                  <h4 className="text-2xl font-semibold text-white mb-3">{pillar.title}</h4>
                  <p className="text-gray-400 leading-relaxed mb-6">{pillar.description}</p>
                  
                  {/* Bullets */}
                  <div className="mt-auto pt-6 border-t border-white/5">
                    <ul className="space-y-3">
                      {pillar.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-3 text-sm text-gray-300">
                          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pillar.color, boxShadow: `0 0 8px ${pillar.color}` }} />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Mini chart mockup for large cards */}
                  {pillar.large && (
                    <div className="absolute bottom-0 right-0 w-48 h-24 opacity-40 group-hover:opacity-60 transition-opacity">
                      <MiniAreaChart color={pillar.color} delay={0.3} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: AI Orchestrator - Feature Split */}
      <div className="relative py-40" id="ai">
        {/* Ambient lighting */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[800px] rounded-full bg-[#9A7BFF]/10 blur-[150px]" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="rounded-[3rem] border border-white/5 bg-[#0C0E14]/60 backdrop-blur-xl overflow-hidden">
            {/* Glass reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />
            
            <div className="grid lg:grid-cols-2 gap-12 p-10 md:p-16 relative z-10">
              {/* Left - Copy */}
              <div className="space-y-8">
                <div
                >
                  <div className="inline-flex items-center gap-2 text-[#8B5CF6] label-caps mb-4">
                    <BrainCircuit className="h-4 w-4" />
                    AI ASSISTANT
                  </div>
                  
                  <h3 className="heading-display text-4xl md:text-5xl text-white mb-6">
                    Ask anything.{' '}
                    <span className="text-glow-violet text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#00D4FF]">
                      Get instant answers.
                    </span>
                  </h3>
                  
                  <p className="subhead-light text-lg text-gray-400 leading-relaxed">
                    Just type your question in plain English. Our AI understands your portfolio, analyzes the data, and gives you clear, actionable insights.
                  </p>
                </div>

                {/* Feature cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: ChartCandlestick, title: 'Data-Backed', desc: 'Every answer supported by real financial data.', color: '#8B5CF6' },
                    { icon: ScanEye, title: 'Context Aware', desc: 'Understands your portfolio and preferences.', color: '#00D4FF' },
                  ].map((item, i) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-colors"
                    >
                      <div 
                        className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <item.icon className="h-5 w-5" style={{ color: item.color }} />
                      </div>
                      <div className="font-semibold text-white mb-1">{item.title}</div>
                      <div className="text-sm text-gray-400">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Timeline Visual */}
              <div className="relative">
                <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-[#9A7BFF]/50 via-[#5BB9F7]/30 to-transparent" />
                
                <div className="space-y-10 py-8">
                  {aiTimeline.map((step, i) => (
                    <div
                      key={step.label}
                      className="relative pl-20 group"
                    >
                      {/* Timeline node */}
                      <div className="absolute left-[21px] top-1 h-6 w-6 rounded-full border-2 border-[#9A7BFF] bg-[#080A0E] flex items-center justify-center group-hover:border-[#5BB9F7] group-hover:shadow-[0_0_15px_rgba(91,185,247,0.5)] transition-all duration-300">
                        <step.icon className="h-3 w-3 text-[#9A7BFF] group-hover:text-[#5BB9F7] transition-colors" />
                      </div>
                      
                      <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-[#5BB9F7] transition-colors">{step.label}</h4>
                      <p className="text-sm text-gray-400">{step.copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Metrics - Visual Mockup */}
      <div className="relative py-40 border-t border-white/5" id="metrics">
        {/* Teal ambient glow */}
        <div className="absolute bottom-0 right-0 w-[700px] h-[500px] rounded-full bg-[#3FE3C2]/10 blur-[150px]" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 space-y-20">
          {/* Header */}
          <div
            className="text-center space-y-6"
          >
            <div className="label-caps text-[#00D4FF]">Complete Analysis</div>
            <h3 className="heading-display text-3xl md:text-4xl lg:text-5xl text-white max-w-3xl mx-auto">
              150+ metrics at your fingertips.{' '}
              <span className="text-glow-teal text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#FF6B35]">
                No expertise required.
              </span>
            </h3>
          </div>

          {/* Metric Counters */}
          <div
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {metricHighlights.map((metric) => (
              <MetricCounter key={metric.label} value={metric.stat} label={metric.label} color={metric.color} />
            ))}
          </div>

          {/* UI Mockup Card */}
          <div
            className="rounded-3xl border border-white/5 bg-[#0C0E14]/80 backdrop-blur-xl overflow-hidden"
          >
            {/* Glass reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
            
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Valuation */}
                <div className="space-y-4">
                  <div className="label-caps text-[#5BB9F7]">Valuation</div>
                  {['P/E Ratio', 'EV/EBITDA', 'P/B Ratio'].map((metric, i) => (
                    <div key={metric} className="flex items-center justify-between py-3 border-b border-white/5">
                      <span className="text-sm text-gray-400">{metric}</span>
                      <span className="text-white font-medium">{(18.5 + i * 2.3).toFixed(1)}x</span>
                    </div>
                  ))}
                </div>
                
                {/* Quality */}
                <div className="space-y-4">
                  <div className="label-caps text-[#9A7BFF]">Quality</div>
                  {['ROE', 'ROIC', 'Gross Margin'].map((metric, i) => (
                    <div key={metric} className="flex items-center justify-between py-3 border-b border-white/5">
                      <span className="text-sm text-gray-400">{metric}</span>
                      <span className="text-[#3FE3C2] font-medium">{(24.5 + i * 4.2).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
                
                {/* Growth */}
                <div className="space-y-4">
                  <div className="label-caps text-[#3FE3C2]">Growth</div>
                  {['Revenue YoY', 'EPS Growth', 'FCF Growth'].map((metric, i) => (
                    <div key={metric} className="flex items-center justify-between py-3 border-b border-white/5">
                      <span className="text-sm text-gray-400">{metric}</span>
                      <span className="text-[#3FE3C2] font-medium">+{(12.3 + i * 3.1).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div
            className="rounded-3xl border border-white/5 bg-gradient-to-r from-[#3FE3C2]/10 via-[#080A0E] to-[#9A7BFF]/10 p-8 md:p-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-sm text-[#3FE3C2]">
                  <Target className="h-4 w-4" />
                  Customize your playbooks
                </div>
                <h4 className="text-2xl font-semibold text-white">Align the metrics with your investing style.</h4>
                <p className="text-gray-400">Pin any metric, assign custom weightings, and let the orchestrator coach you when signals drift.</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {['Momentum blends', 'Income stability', 'Capital efficiency', 'AI exposure'].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 hover:border-[#3FE3C2]/30 hover:bg-[#3FE3C2]/5 transition-colors cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
