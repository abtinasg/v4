import { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata, JsonLd, generateBreadcrumbSchema, siteConfig } from '@/lib/seo';
import { 
  BarChart3, 
  Users, 
  Globe, 
  Target, 
  Zap, 
  Shield,
  TrendingUp,
  Brain,
  ArrowRight
} from 'lucide-react';

export const metadata: Metadata = generatePageMetadata({
  title: 'About Deepin - Democratizing Financial Analysis',
  description: 'Deepin brings Wall Street-level stock analysis to retail investors. 432+ institutional metrics, AI-powered insights, and professional research tools at a fraction of the cost.',
  path: '/about',
  keywords: ['about deepin', 'stock analysis platform', 'financial technology', 'investment research', 'AI stock analysis'],
});

const stats = [
  { value: '432+', label: 'Institutional Metrics' },
  { value: '50K+', label: 'Active Investors' },
  { value: '10M+', label: 'Analyses Generated' },
  { value: '99.9%', label: 'Platform Uptime' },
];

const values = [
  {
    icon: Target,
    title: 'Democratization',
    description: 'Wall Street-quality analysis shouldn\'t require a $25,000/year Bloomberg terminal. We make it accessible to everyone.',
  },
  {
    icon: Shield,
    title: 'Data Integrity',
    description: 'Real-time data from trusted sources. No manipulation, no delays—just accurate financial information you can rely on.',
  },
  {
    icon: Brain,
    title: 'AI-First Approach',
    description: 'Multi-model AI orchestration combining GPT-4, Claude, and proprietary models for comprehensive, unbiased analysis.',
  },
  {
    icon: Zap,
    title: 'Speed & Simplicity',
    description: 'From ticker to full research report in seconds. Professional analysis without the learning curve.',
  },
];

const timeline = [
  {
    year: '2024',
    title: 'The Vision',
    description: 'Founded by investors frustrated with expensive, complex tools. We set out to build something better.',
  },
  {
    year: '2024',
    title: 'Platform Launch',
    description: 'Released Deepin with 432+ institutional metrics, real-time data, and an intuitive interface.',
  },
  {
    year: '2024',
    title: 'AI Revolution',
    description: 'Integrated multi-model AI for automated research reports and intelligent stock analysis.',
  },
  {
    year: '2025',
    title: 'Rapid Growth',
    description: 'Now serving 50,000+ investors worldwide with millions of analyses generated monthly.',
  },
];

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'Home', url: siteConfig.url },
    { name: 'About', url: `${siteConfig.url}/about` },
  ];

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5" />
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Wall Street Analysis.{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                For Everyone.
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/60">
              We're on a mission to level the playing field. Deepin gives retail investors 
              the same powerful analysis tools that hedge funds and institutions use—at a 
              price that makes sense.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Our Mission</h2>
              <p className="mt-6 text-lg text-white/60">
                Professional investors have had an unfair advantage for decades—expensive terminals, 
                proprietary data, and teams of analysts. We built Deepin to change that.
              </p>
              <p className="mt-4 text-white/60">
                With 432+ institutional-grade metrics, real-time market data, AI-powered research reports, 
                and portfolio tracking, Deepin gives you everything you need to invest with confidence. 
                No finance degree required—just smart tools that work.
              </p>
              <div className="mt-8">
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Explore our features
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 p-8 border border-white/10">
                <div className="h-full w-full rounded-xl bg-[#0a0d12] flex items-center justify-center">
                  <BarChart3 className="h-32 w-32 text-cyan-400/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Our Values</h2>
            <p className="mt-4 text-white/60">The principles that guide everything we do</p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
                  <value.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{value.title}</h3>
                <p className="mt-2 text-sm text-white/40">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Our Journey</h2>
            <p className="mt-4 text-white/60">From idea to impact</p>
          </div>

          <div className="mt-16 relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 to-violet-500/50 hidden lg:block" />
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col lg:flex-row gap-8 ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  <div className="flex-1 lg:text-right">
                    {index % 2 === 0 && (
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                        <p className="text-sm text-cyan-400 font-medium">{item.year}</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                        <p className="mt-2 text-white/40">{item.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 hidden lg:block" />
                  <div className="flex-1">
                    {index % 2 !== 0 && (
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                        <p className="text-sm text-cyan-400 font-medium">{item.year}</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                        <p className="mt-2 text-white/40">{item.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/10 p-8 sm:p-12 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Transform Your Research?
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Join thousands of investors who've upgraded their analysis workflow with Deepin.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                Get Started Free
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/5"
              >
                View Features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
