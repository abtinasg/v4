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
  title: 'About Deep Terminal - Our Mission & Story',
  description: 'Learn about Deep Terminal, the professional stock analysis platform making institutional-grade research accessible to everyone. Our mission, team, and values.',
  path: '/about',
  keywords: ['about deep terminal', 'stock analysis company', 'financial technology', 'fintech startup'],
});

const stats = [
  { value: '190+', label: 'Financial Metrics' },
  { value: '10K+', label: 'Active Users' },
  { value: '5M+', label: 'Analyses Run' },
  { value: '99.9%', label: 'Uptime' },
];

const values = [
  {
    icon: Target,
    title: 'Accessibility',
    description: 'Professional-grade financial analysis should be available to everyone, not just institutions with Bloomberg terminals.',
  },
  {
    icon: Shield,
    title: 'Transparency',
    description: 'We believe in clear, honest communication. No hidden fees, no misleading claims, just real data and insights.',
  },
  {
    icon: Brain,
    title: 'Intelligence',
    description: 'Combining cutting-edge AI with proven financial frameworks to deliver insights that matter.',
  },
  {
    icon: Zap,
    title: 'Simplicity',
    description: 'Complex analysis made simple. We handle the complexity so you can focus on decisions.',
  },
];

const timeline = [
  {
    year: '2024',
    title: 'The Beginning',
    description: 'Deep Terminal was founded with a simple mission: democratize access to professional stock analysis.',
  },
  {
    year: '2024',
    title: 'AI Integration',
    description: 'Integrated Deep AI for intelligent analysis and natural language insights on any stock.',
  },
  {
    year: '2024',
    title: 'Public Launch',
    description: 'Launched to the public with 190+ institutional-grade metrics and comprehensive analysis tools.',
  },
  {
    year: '2025',
    title: 'Growing Fast',
    description: 'Reached 10,000+ users and processed millions of stock analyses.',
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
              Making Professional Analysis{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Accessible to Everyone
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/60">
              We believe every investor deserves access to the same quality of analysis that 
              institutions have. Deep Terminal brings institutional-grade stock research to 
              individual investors at a fraction of the cost.
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
                For too long, sophisticated financial analysis has been locked behind expensive 
                Bloomberg terminals and institutional access. We're changing that.
              </p>
              <p className="mt-4 text-white/60">
                Deep Terminal combines real-time market data, 190+ institutional-grade financial metrics, and 
                AI-powered insights to give every investor the tools they need to make 
                informed decisions. Whether you're analyzing your first stock or managing 
                a portfolio, we've got you covered.
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
              Join thousands of investors who've upgraded their analysis workflow with Deep Terminal.
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
