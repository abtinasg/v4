'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Check, 
  BarChart3, 
  Brain, 
  Sparkles,
  TrendingUp,
  Users,
  Star,
  ChevronDown
} from 'lucide-react'

// Countdown timer for urgency
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-3 text-white">
      <div className="flex flex-col items-center bg-white/10 rounded-lg px-3 py-2">
        <span className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[10px] text-zinc-400">Hours</span>
      </div>
      <span className="text-2xl font-bold">:</span>
      <div className="flex flex-col items-center bg-white/10 rounded-lg px-3 py-2">
        <span className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[10px] text-zinc-400">Mins</span>
      </div>
      <span className="text-2xl font-bold">:</span>
      <div className="flex flex-col items-center bg-white/10 rounded-lg px-3 py-2">
        <span className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[10px] text-zinc-400">Secs</span>
      </div>
    </div>
  )
}

// Animated stats counter
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])

  return <span>{count.toLocaleString()}{suffix}</span>
}

const benefits = [
  'Access 432 institutional-grade metrics',
  'AI-powered analysis from multiple models',
  'Generate professional PDF reports',
  'Real-time price alerts',
  'Track unlimited portfolios',
]

const socialProof = [
  { name: 'Sarah M.', role: 'Day Trader', text: 'Finally, institutional-level data without the Bloomberg price tag.', rating: 5 },
  { name: 'Michael K.', role: 'Portfolio Manager', text: 'The AI reports save me hours of research every week.', rating: 5 },
  { name: 'David L.', role: 'Retail Investor', text: 'I feel like I have a team of analysts working for me.', rating: 5 },
]

export default function PromoPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#09090B] overflow-x-hidden">
      {/* Sticky CTA Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
            <span className="text-sm font-medium text-white hidden sm:block">
              Limited Time: Get 50 free credits on signup!
            </span>
            <span className="text-sm font-medium text-white sm:hidden">
              50 free credits!
            </span>
          </div>
          <Link
            href="/sign-up"
            className="px-4 py-1.5 bg-white text-blue-600 text-sm font-semibold rounded-full hover:bg-blue-50 transition-colors"
          >
            Claim Now
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-24">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo.jpeg"
                alt="Deepin"
                className="h-10 w-10 rounded-xl object-cover"
              />
              <span className="text-xl font-semibold text-white">Deepin</span>
            </Link>
          </div>

          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-2 mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-sm text-blue-300">Join 10,000+ smart investors</span>
          </div>

          {/* Headline */}
          <h1 
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Stop guessing.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Start analyzing.
            </span>
          </h1>

          {/* Subheadline */}
          <p 
            className={`text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Get the same fundamental analysis tools used by professional analysts at top investment firms. 
            <span className="text-white font-medium"> Powered by AI.</span>
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Link
              href="/sign-up"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-black bg-gradient-to-r from-white to-zinc-100 hover:from-zinc-100 hover:to-white rounded-full shadow-lg shadow-white/10 transition-all hover:scale-[1.02]"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Check className="h-4 w-4 text-emerald-400" />
              No credit card required
            </div>
          </div>

          {/* Stats */}
          <div 
            className={`grid grid-cols-3 gap-6 max-w-lg mx-auto mb-12 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedNumber target={432} />
              </div>
              <div className="text-xs sm:text-sm text-zinc-500">Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedNumber target={10} suffix="K+" />
              </div>
              <div className="text-xs sm:text-sm text-zinc-500">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedNumber target={4} suffix="M+" />
              </div>
              <div className="text-xs sm:text-sm text-zinc-500">Reports</div>
            </div>
          </div>

          {/* Product Preview */}
          <div 
            className={`relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/10 transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent z-10 pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop"
              alt="Deepin Dashboard Preview"
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 bg-gradient-to-b from-[#09090B] to-[#0f0f12]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Benefits List */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Everything you need to invest 
                <span className="text-blue-400"> like a pro</span>
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-lg text-zinc-300">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full transition-colors"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right - Feature Cards */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <BarChart3 className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">432 Institutional Metrics</h3>
                <p className="text-zinc-400">Access the same data used by professional analysts at Goldman Sachs, Morgan Stanley, and top hedge funds.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <Brain className="h-8 w-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Analysis</h3>
                <p className="text-zinc-400">Our multi-model AI system analyzes data from multiple perspectives to give you comprehensive insights.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative py-20 bg-[#0a0a0d]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by investors worldwide
            </h2>
            <p className="text-zinc-400">See why thousands of investors trust Deepin for their research.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {socialProof.map((review, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-4">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-white">{review.name}</div>
                    <div className="text-sm text-zinc-500">{review.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="relative py-16 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            ⏰ Limited Time Offer
          </h2>
          <p className="text-zinc-300 mb-6">
            Sign up now and get <span className="text-blue-400 font-bold">50 free credits</span> to analyze any stock. Offer expires in:
          </p>
          <div className="flex justify-center mb-8">
            <CountdownTimer />
          </div>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-zinc-100 transition-colors shadow-lg shadow-white/20"
          >
            Claim Your Free Credits
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 bg-[#09090B]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[128px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to invest smarter?
          </h2>
          <p className="text-lg text-zinc-400 mb-8">
            Join thousands of investors who use Deepin to make data-driven decisions. Start your free trial today.
          </p>
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 px-10 py-5 text-lg font-semibold text-black bg-white hover:bg-zinc-100 rounded-full transition-all hover:scale-[1.02] shadow-xl shadow-white/10"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-4 text-sm text-zinc-500">
            No credit card required • 50 free credits • Cancel anytime
          </p>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="Deepin" className="h-6 w-6 rounded-lg" />
            <span className="text-sm text-zinc-500">© 2024 Deepin. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/#product" className="hover:text-white transition-colors">Features</Link>
            <Link href="/sign-in" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
