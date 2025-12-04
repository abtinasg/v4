import { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata, JsonLd, generateBreadcrumbSchema, siteConfig } from '@/lib/seo';
import { 
  BarChart3, 
  Brain, 
  LineChart, 
  PieChart,
  TrendingUp,
  Shield,
  Zap,
  Search,
  FileText,
  Bell,
  Globe,
  Lock,
  Sparkles,
  Calculator,
  Target,
  Users,
  ArrowRight,
  Check
} from 'lucide-react';

export const metadata: Metadata = generatePageMetadata({
  title: 'Features - Professional Stock Analysis Tools',
  description: 'Explore Deep Terminal features: 190+ institutional-grade financial metrics, AI-powered analysis, real-time data, stock screener, technical analysis, and more. Your Bloomberg alternative.',
  path: '/features',
  keywords: ['stock analysis features', 'financial metrics', 'AI stock analysis', 'stock screener', 'technical analysis tools'],
});

const mainFeatures = [
  {
    icon: BarChart3,
    title: '190+ Institutional Metrics',
    description: 'Comprehensive coverage of valuation, profitability, growth, liquidity, efficiency, and risk metrics. All calculated in real-time.',
    highlights: ['P/E, P/B, EV/EBITDA', 'ROE, ROA, ROIC', 'Current & Quick Ratios', 'Beta & Volatility'],
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Deep AI integration for intelligent stock analysis. Get natural language insights, answer questions, and understand complex metrics.',
    highlights: ['Natural Language Q&A', 'Metric Explanations', 'Investment Thesis', 'Risk Assessment'],
  },
  {
    icon: LineChart,
    title: 'Advanced Charts',
    description: 'Interactive TradingView-powered charts with multiple timeframes, indicators, and drawing tools for technical analysis.',
    highlights: ['Multiple Timeframes', '50+ Indicators', 'Drawing Tools', 'Pattern Recognition'],
  },
  {
    icon: Search,
    title: 'Stock Screener',
    description: 'Filter through thousands of stocks using any combination of our 190+ institutional-grade metrics. Find opportunities that match your criteria.',
    highlights: ['Custom Filters', 'Save Screens', 'Export Results', 'Real-time Updates'],
  },
  {
    icon: FileText,
    title: 'AI Investment Reports',
    description: 'Generate comprehensive PDF reports with institutional-grade analysis. CFA-level framework with DCF valuation and risk assessment.',
    highlights: ['PDF Export', 'CFA Framework', 'DCF Valuation', 'Peer Comparison'],
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Set alerts on any metric or price level. Get notified when stocks meet your criteria or break key technical levels.',
    highlights: ['Price Alerts', 'Metric Triggers', 'Email & Push', 'Watchlist Alerts'],
  },
];

const metricCategories = [
  { name: 'Valuation', count: 25, examples: 'P/E, P/B, P/S, EV/EBITDA, PEG' },
  { name: 'Profitability', count: 20, examples: 'ROE, ROA, ROIC, Margins' },
  { name: 'Growth', count: 15, examples: 'Revenue Growth, EPS Growth, CAGR' },
  { name: 'Liquidity', count: 12, examples: 'Current Ratio, Quick Ratio, Cash Ratio' },
  { name: 'Efficiency', count: 15, examples: 'Asset Turnover, Inventory Days' },
  { name: 'Leverage', count: 12, examples: 'D/E, Interest Coverage, Debt Ratios' },
  { name: 'Risk', count: 18, examples: 'Beta, VaR, Sharpe Ratio, Max Drawdown' },
  { name: 'Technical', count: 25, examples: 'RSI, MACD, Moving Averages, Bollinger' },
  { name: 'DCF & Valuation', count: 15, examples: 'WACC, Terminal Value, Fair Value' },
  { name: 'Industry', count: 13, examples: 'Peer Rankings, Sector Comparisons' },
];

const comparisonTable = [
  { feature: 'Financial Metrics', deepTerminal: '190+', bloomberg: '200+', yahooFinance: '30' },
  { feature: 'AI Analysis', deepTerminal: true, bloomberg: false, yahooFinance: false },
  { feature: 'Real-time Data', deepTerminal: true, bloomberg: true, yahooFinance: true },
  { feature: 'PDF Reports', deepTerminal: true, bloomberg: true, yahooFinance: false },
  { feature: 'Stock Screener', deepTerminal: true, bloomberg: true, yahooFinance: 'Basic' },
  { feature: 'Technical Charts', deepTerminal: true, bloomberg: true, yahooFinance: true },
  { feature: 'Price', deepTerminal: 'Free / $29', bloomberg: '$24,000/yr', yahooFinance: 'Free / $35' },
];

export default function FeaturesPage() {
  const breadcrumbs = [
    { name: 'Home', url: siteConfig.url },
    { name: 'Features', url: `${siteConfig.url}/features` },
  ];

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5" />
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Professional Analysis
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/60">
              190+ institutional-grade financial metrics, AI-powered insights, advanced charts, and 
              research tools. All in one affordable platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/5"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Core Features</h2>
            <p className="mt-4 text-white/60">Powerful tools for serious investors</p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {mainFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
                    <feature.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-white/40">{feature.description}</p>
                    <ul className="mt-4 grid grid-cols-2 gap-2">
                      {feature.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-center gap-2 text-sm text-white/60">
                          <Check className="h-4 w-4 text-cyan-400" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Categories */}
      <section className="py-20 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">190+ Institutional Metrics</h2>
            <p className="mt-4 text-white/60">
              Comprehensive coverage across 10 categories
            </p>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {metricCategories.map((category) => (
              <div
                key={category.name}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">{category.name}</h3>
                  <span className="text-xs text-cyan-400 font-medium">{category.count}</span>
                </div>
                <p className="mt-2 text-xs text-white/40">{category.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">How We Compare</h2>
            <p className="mt-4 text-white/60">
              Deep Terminal vs Bloomberg Terminal vs Yahoo Finance
            </p>
          </div>

          <div className="mt-16 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-4 text-left text-sm font-medium text-white/60">Feature</th>
                  <th className="py-4 px-4 text-center">
                    <span className="text-cyan-400 font-semibold">Deep Terminal</span>
                  </th>
                  <th className="py-4 px-4 text-center text-sm font-medium text-white/60">Bloomberg</th>
                  <th className="py-4 px-4 text-center text-sm font-medium text-white/60">Yahoo Finance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisonTable.map((row) => (
                  <tr key={row.feature} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-4 text-sm text-white">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.deepTerminal === 'boolean' ? (
                        row.deepTerminal ? (
                          <Check className="h-5 w-5 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-white/20">—</span>
                        )
                      ) : (
                        <span className="text-cyan-400 font-medium">{row.deepTerminal}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.bloomberg === 'boolean' ? (
                        row.bloomberg ? (
                          <Check className="h-5 w-5 text-white/40 mx-auto" />
                        ) : (
                          <span className="text-white/20">—</span>
                        )
                      ) : (
                        <span className="text-white/60">{row.bloomberg}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.yahooFinance === 'boolean' ? (
                        row.yahooFinance ? (
                          <Check className="h-5 w-5 text-white/40 mx-auto" />
                        ) : (
                          <span className="text-white/20">—</span>
                        )
                      ) : (
                        <span className="text-white/60">{row.yahooFinance}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/10 p-8 sm:p-12 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Level Up Your Analysis?
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Start with 100 free credits. No credit card required.
            </p>
            <div className="mt-8">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-4 text-base font-medium text-white transition-all hover:opacity-90"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
