import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Book, 
  Zap, 
  CreditCard, 
  Bot,
  BarChart3,
  Bell,
  Search,
  Download,
  Settings,
  Shield,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { generatePageMetadata, JsonLd, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Documentation',
  description: 'Learn how to use Deep effectively. Guides, tutorials, and API documentation for stock analysis.',
  path: '/docs',
});

const categories = [
  {
    title: 'Getting Started',
    description: 'New to Deep? Start here.',
    icon: Zap,
    articles: [
      { title: 'Quick Start Guide', href: '/docs/quick-start', time: '5 min' },
      { title: 'Understanding the Dashboard', href: '/docs/dashboard', time: '10 min' },
      { title: 'Your First Stock Analysis', href: '/docs/first-analysis', time: '8 min' },
      { title: 'Setting Up Watchlists', href: '/docs/watchlists', time: '5 min' },
    ],
  },
  {
    title: 'AI Assistant',
    description: 'Master the AI-powered analysis.',
    icon: Bot,
    articles: [
      { title: 'Introduction to AI Analysis', href: '/docs/ai-intro', time: '7 min' },
      { title: 'Asking the Right Questions', href: '/docs/ai-questions', time: '10 min' },
      { title: 'Understanding AI Reports', href: '/docs/ai-reports', time: '8 min' },
      { title: 'Conversation Modes', href: '/docs/ai-modes', time: '5 min' },
    ],
  },
  {
    title: 'Financial Metrics',
    description: 'Deep dive into 50+ financial metrics.',
    icon: BarChart3,
    articles: [
      { title: 'Valuation Metrics Explained', href: '/docs/valuation-metrics', time: '15 min' },
      { title: 'Profitability Metrics', href: '/docs/profitability', time: '12 min' },
      { title: 'Growth Indicators', href: '/docs/growth', time: '10 min' },
      { title: 'Risk & Leverage Metrics', href: '/docs/risk-metrics', time: '12 min' },
    ],
  },
  {
    title: 'Credits & Billing',
    description: 'Manage your credits and subscription.',
    icon: CreditCard,
    articles: [
      { title: 'How Credits Work', href: '/docs/credits', time: '5 min' },
      { title: 'Purchasing Credits', href: '/docs/purchase', time: '3 min' },
      { title: 'Credit Usage Guide', href: '/docs/usage', time: '5 min' },
      { title: 'Billing FAQ', href: '/docs/billing-faq', time: '5 min' },
    ],
  },
  {
    title: 'Alerts & Notifications',
    description: 'Stay updated on market changes.',
    icon: Bell,
    articles: [
      { title: 'Setting Up Price Alerts', href: '/docs/price-alerts', time: '5 min' },
      { title: 'Custom Alert Conditions', href: '/docs/custom-alerts', time: '8 min' },
      { title: 'Email Notifications', href: '/docs/email-notifications', time: '4 min' },
      { title: 'Alert Best Practices', href: '/docs/alert-tips', time: '6 min' },
    ],
  },
  {
    title: 'Account & Security',
    description: 'Manage your account settings.',
    icon: Shield,
    articles: [
      { title: 'Account Settings', href: '/docs/account', time: '5 min' },
      { title: 'Security Best Practices', href: '/docs/security', time: '7 min' },
      { title: 'Data Privacy', href: '/docs/privacy', time: '5 min' },
      { title: 'Deleting Your Account', href: '/docs/delete-account', time: '3 min' },
    ],
  },
];

const popularArticles = [
  { title: 'Quick Start Guide', href: '/docs/quick-start', category: 'Getting Started' },
  { title: 'How Credits Work', href: '/docs/credits', category: 'Billing' },
  { title: 'Understanding AI Reports', href: '/docs/ai-reports', category: 'AI Assistant' },
  { title: 'Valuation Metrics Explained', href: '/docs/valuation-metrics', category: 'Metrics' },
];

const faqItems = [
  { question: 'How do I get started with Deep?', answer: 'Sign up for a free account, get 100 credits, and start analyzing any stock immediately.' },
  { question: 'What are credits used for?', answer: 'Credits are used for AI-powered analysis features like chat, reports, and advanced metrics.' },
  { question: 'Is my financial data secure?', answer: 'Yes, we use bank-level encryption and never store your brokerage credentials.' },
];

export default function DocsPage() {
  return (
    <>
      <JsonLd
        data={[
          generateBreadcrumbSchema([
            { name: 'Home', url: 'https://deepterm.co' },
            { name: 'Documentation', url: 'https://deepterm.co/docs' },
          ]),
          generateFAQSchema(faqItems),
        ]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-cyan-500/10 p-3">
                <Book className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Documentation
            </h1>
            <p className="mt-6 text-lg text-white/60">
              Everything you need to know about using Deep. 
              From getting started to advanced features.
            </p>

            {/* Search */}
            <div className="mt-8">
              <div className="relative mx-auto max-w-xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
            Popular Articles
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {popularArticles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                {article.title}
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.title}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
                    <category.icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{category.title}</h3>
                    <p className="text-xs text-white/40">{category.description}</p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {category.articles.map((article) => (
                    <li key={article.href}>
                      <Link
                        href={article.href}
                        className="group flex items-center justify-between text-sm text-white/60 hover:text-white transition-colors"
                      >
                        <span>{article.title}</span>
                        <span className="text-xs text-white/30 group-hover:text-white/50">
                          {article.time}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/docs/${category.title.toLowerCase().replace(/ /g, '-')}`}
                  className="mt-6 inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  View all articles
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <Download className="h-8 w-8 text-cyan-400" />
              <h3 className="mt-4 font-semibold text-white">API Reference</h3>
              <p className="mt-2 text-sm text-white/40">
                Technical documentation for developers integrating with Deep.
              </p>
              <Link
                href="/docs/api"
                className="mt-4 inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View API Docs
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <Settings className="h-8 w-8 text-cyan-400" />
              <h3 className="mt-4 font-semibold text-white">System Status</h3>
              <p className="mt-2 text-sm text-white/40">
                Check the current status of Deep services.
              </p>
              <Link
                href="/status"
                className="mt-4 inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View Status
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <Book className="h-8 w-8 text-cyan-400" />
              <h3 className="mt-4 font-semibold text-white">Release Notes</h3>
              <p className="mt-2 text-sm text-white/40">
                Stay updated with the latest features and improvements.
              </p>
              <Link
                href="/changelog"
                className="mt-4 inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View Changelog
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Can't find what you're looking for?
            </h2>
            <p className="mt-4 text-white/60">
              Our support team is here to help you with any questions.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
              >
                Contact Support
              </Link>
              <a
                href="mailto:support@deepterm.co"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
