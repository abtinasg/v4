'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, BarChart3, BrainCircuit, Shield, Activity, TrendingUp, TrendingDown, Search, Zap } from 'lucide-react'

// Sparkline component for market data
function Sparkline({ data, color, positive }: { data: number[]; color: string; positive: boolean }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 70 - 15}`).join(' ')

  return (
    <svg viewBox='0 0 100 100' className='w-full h-full overflow-visible' preserveAspectRatio='none'>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1='0%' y1='0%' x2='100%' y2='0%'>
          <stop offset='0%' stopColor={color} stopOpacity='0.2' />
          <stop offset='100%' stopColor={color} stopOpacity='0' />
        </linearGradient>
      </defs>
      <path
        d={`M0 100 L0 ${100 - ((data[0] - min) / range) * 70 - 15} ${points.replace(/ /g, ' L ')} L 100 100 Z`}
        fill={`url(#spark-${color.replace('#', '')})`}
        opacity='0.5'
      />
      <polyline
        fill='none'
        stroke={color}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        points={points}
      />
    </svg>
  )
}

const marketData = [
  { symbol: 'SPY', name: 'S&P 500', value: '5,892.34', change: '+1.24%', positive: true, data: [45, 52, 48, 61, 55, 70, 65, 78, 72, 85] },
  { symbol: 'QQQ', name: 'NASDAQ', value: '18,724.18', change: '+1.89%', positive: true, data: [30, 42, 38, 55, 48, 62, 58, 75, 82, 90] },
  { symbol: 'DIA', name: 'Dow Jones', value: '42,156.92', change: '+0.76%', positive: true, data: [55, 58, 52, 60, 65, 62, 68, 72, 70, 78] },
]

const features = [
  { icon: Sparkles, label: 'AI Analysis', desc: 'Multi-model intelligence' },
  { icon: BarChart3, label: 'Real-time Data', desc: 'Institutional-grade feeds' },
  { icon: Shield, label: 'Bank Security', desc: 'SOC 2 compliant' },
  { icon: Zap, label: 'Instant Alerts', desc: 'Never miss a move' },
]

export function Hero() {
  return (
    <section className='relative min-h-[100dvh] w-full overflow-hidden bg-[#030508] selection:bg-[#5B7CFF]/30'>
      {/* 1. Ambient Background - Calm & Premium */}
      <div className='absolute inset-0 pointer-events-none'>
        {/* Deep gradient base */}
        <div className='absolute inset-0 bg-gradient-to-b from-[#030508] via-[#05080F] to-[#030508]' />
        
        {/* Subtle Grid */}
        <div 
          className='absolute inset-0 opacity-[0.03]'
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />

        {/* Soft Glow Orbs - Reduced intensity for 'calm' feel */}
        <div className='absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-[#5B7CFF]/[0.03] blur-[120px]' />
        <div className='absolute top-[20%] right-[-20%] w-[800px] h-[800px] rounded-full bg-[#00C9E4]/[0.02] blur-[120px]' />
      </div>

      <div className='relative z-10 container mx-auto px-6 lg:px-8 h-full flex flex-col justify-center pt-32 pb-20 lg:pt-48 lg:pb-32'>
        <div className='grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-center'>
          
          {/* 2. Left Column: Content Hierarchy */}
          <div className='flex flex-col items-start space-y-10'>
            
            {/* Trust Badge */}
            <div className='inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-1.5 backdrop-blur-md transition-all hover:bg-white/[0.04]'>
              <div className='h-1.5 w-1.5 rounded-full bg-[#00C9E4] animate-pulse' />
              <span className='text-xs font-medium text-gray-300 tracking-wide uppercase'>Live Market Intelligence</span>
            </div>

            {/* Headlines */}
            <div className='space-y-6 relative'>
              <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]'>
                Professional<br />
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#5B7CFF] via-[#8B5CF6] to-[#00C9E4] animate-gradient-x'>
                  AI 
                </span>{' '}
               stock research
              </h1>
              <p className='text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-lg'>
               Fundamental stock analysis with 432 institutional metrics and AI, so retail investors can make decisions like professionals
              </p>
            </div>

            {/* Feature Chips - 2x2 Grid */}
            <div className='grid grid-cols-2 gap-4 w-full max-w-md'>
              {features.map((feature, i) => (
                <div 
                  key={i}
                  className='group flex items-start gap-3 p-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 backdrop-blur-sm'
                >
                  <feature.icon className='h-5 w-5 text-[#5B7CFF] mt-0.5' />
                  <div>
                    <div className='text-sm font-medium text-white'>{feature.label}</div>
                    <div className='text-xs text-gray-500 mt-0.5'>{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Cluster */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2'>
              <Link
                href='/sign-up'
                className='relative inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#5B7CFF] px-8 text-base font-semibold text-white transition-all hover:bg-[#4A6AE0] hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(91,124,255,0.5)]'
              >
                <span>Get started free</span>
                <ArrowRight className='h-4 w-4' />
              </Link>
              
              <Link
                href='#demo'
                className='inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-transparent px-8 text-base font-medium text-white transition-all hover:bg-white/[0.05]'
              >
                View Live Demo
              </Link>
            </div>

            {/* Social Proof */}
            <div className='flex items-center gap-4 pt-4 border-t border-white/[0.05] w-full max-w-md'>
              <div className='flex -space-x-3'>
               
              </div>
              <div className='text-sm text-gray-500'>
                 <span className='text-white font-medium'>70+</span>  analysis credits included · No credit card required
              </div>
            </div>
          </div>

          {/* 3. Right Column: Premium Mockup */}
          <div className='relative hidden lg:block perspective-[2000px]'>
            {/* Glow Effect */}
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5B7CFF]/10 blur-[100px] rounded-full pointer-events-none' />

            {/* Main Dashboard Card */}
            <div className='relative z-10 rounded-2xl border border-white/[0.08] bg-[#0A0F18]/80 backdrop-blur-xl shadow-2xl transform rotate-y-[-5deg] rotate-x-[2deg] transition-transform duration-500 hover:rotate-y-0 hover:rotate-x-0'>
              {/* Window Controls */}
              <div className='flex items-center justify-between px-6 py-4 border-b border-white/[0.06]'>
                <div className='flex gap-2'>
                  <div className='w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50' />
                  <div className='w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50' />
                  <div className='w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50' />
                </div>
                <div className='flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]'>
                  <Search className='w-3 h-3 text-gray-500' />
                  <span className='text-xs text-gray-500'>Search assets...</span>
                  <span className='text-[10px] text-gray-600 border border-white/[0.1] px-1 rounded'>⌘K</span>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className='p-6 space-y-6'>
                {/* Market Overview */}
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-medium text-gray-400'>Market Overview</h3>
                    <span className='flex items-center gap-1.5 text-xs text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full'>
                      <div className='w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse' />
                      Market Open
                    </span>
                  </div>
                  
                  <div className='grid gap-3'>
                    {marketData.map((item) => (
                      <div key={item.symbol} className='flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center text-xs font-bold text-white'>
                            {item.symbol}
                          </div>
                          <div>
                            <div className='text-sm font-medium text-white'>{item.name}</div>
                            <div className='text-xs text-gray-500'>{item.value}</div>
                          </div>
                        </div>
                        <div className='flex items-center gap-4'>
                          <div className='w-24 h-8'>
                            <Sparkline data={item.data} color={item.positive ? '#22C55E' : '#EF4444'} positive={item.positive} />
                          </div>
                          <div className={`text-sm font-medium ${item.positive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {item.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insight Section */}
                <div className='p-4 rounded-xl bg-gradient-to-br from-[#5B7CFF]/10 to-[#8B5CF6]/10 border border-[#5B7CFF]/20'>
                  <div className='flex items-start gap-3'>
                    <div className='p-2 rounded-lg bg-[#5B7CFF]/20'>
                      <BrainCircuit className='w-4 h-4 text-[#5B7CFF]' />
                    </div>
                    <div>
                      <div className='text-sm font-medium text-white mb-1'>AI Sentiment Analysis</div>
                      <p className='text-xs text-gray-400 leading-relaxed'>
                        Bullish divergence detected on SPY. Institutional flow indicates accumulation in tech sector. 
                        <span className='text-[#5B7CFF] hover:underline cursor-pointer ml-1'>Read full report →</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements - Layered Depth */}
            
            {/* Top Right - Confidence Score */}
            <div className='absolute -right-8 top-20 p-4 rounded-2xl bg-[#0A0F18]/90 backdrop-blur-xl border border-white/[0.1] shadow-2xl animate-float-slow z-20'>
              <div className='flex items-center gap-3 mb-2'>
                <div className='w-2 h-2 rounded-full bg-[#22C55E]' />
                <span className='text-xs font-medium text-gray-400'>AI Confidence</span>
              </div>
              <div className='text-2xl font-bold text-white'>94%</div>
            </div>

            {/* Bottom Left - Active Users */}
            <div className='absolute -left-8 bottom-32 p-4 rounded-2xl bg-[#0A0F18]/90 backdrop-blur-xl border border-white/[0.1] shadow-2xl animate-float-delayed z-20'>
              <div className='flex items-center gap-3'>
                <div className='flex -space-x-2'>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-[#0A0F18]' />
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-[#0A0F18]' />
                </div>
                <div>
                  <div className='text-xs font-medium text-white'>New Signal</div>
                  <div className='text-[10px] text-gray-400'>Just now</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}