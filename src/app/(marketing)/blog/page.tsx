import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { generatePageMetadata, JsonLd, generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Blog - Stock Market Insights & Analysis',
  description: 'Expert insights on stock analysis, financial metrics, investing strategies, and market trends. Learn to make better investment decisions.',
  path: '/blog',
});

// Blog posts data - in production, this would come from a CMS or MDX files
const blogPosts = [
  {
    slug: 'fed-rate-cuts-2025-what-investors-need-to-know',
    title: 'Fed Rate Cuts in 2025: What Investors Need to Know',
    excerpt: 'The Federal Reserve is signaling potential rate cuts in 2025. Here\'s how this could impact your portfolio and which sectors stand to benefit most.',
    author: 'Deepin Team',
    publishedAt: '2025-12-05',
    readTime: '7 min read',
    category: 'Market Analysis',
    image: '/blog/fed-rates-2025.jpg',
    featured: true,
  },
  {
    slug: 'nvidia-vs-amd-ai-chip-war-2025',
    title: 'NVIDIA vs AMD: The AI Chip War Heats Up in 2025',
    excerpt: 'The battle for AI chip dominance intensifies. We analyze both companies\' strategies, market positions, and what it means for investors.',
    author: 'Deepin Team',
    publishedAt: '2025-12-04',
    readTime: '9 min read',
    category: 'Industry',
    image: '/blog/nvidia-amd-ai.jpg',
    featured: true,
  },
  {
    slug: 'magnificent-7-stocks-still-worth-buying',
    title: 'Are the Magnificent 7 Stocks Still Worth Buying in December 2025?',
    excerpt: 'Apple, Microsoft, Google, Amazon, Meta, NVIDIA, and Tesla have dominated the market. We break down which ones still have room to run.',
    author: 'Deepin Team',
    publishedAt: '2025-12-03',
    readTime: '11 min read',
    category: 'Stock Analysis',
    image: '/blog/magnificent-7.jpg',
    featured: false,
  },
  {
    slug: 'how-to-analyze-earnings-reports-like-a-pro',
    title: 'How to Analyze Earnings Reports Like a Wall Street Pro',
    excerpt: 'Earnings season can make or break your portfolio. Learn the key metrics, red flags, and insights that professional analysts look for.',
    author: 'Deepin Team',
    publishedAt: '2025-12-02',
    readTime: '10 min read',
    category: 'Fundamentals',
    image: '/blog/earnings-analysis.jpg',
    featured: false,
  },
  {
    slug: 'small-cap-stocks-2025-hidden-gems',
    title: 'Small-Cap Stocks: Finding Hidden Gems in 2025',
    excerpt: 'While mega-caps grab headlines, small-cap stocks often offer the best growth potential. Here\'s how to find undervalued opportunities.',
    author: 'Deepin Team',
    publishedAt: '2025-12-01',
    readTime: '8 min read',
    category: 'Investment Strategy',
    image: '/blog/small-cap-gems.jpg',
    featured: false,
  },
  {
    slug: 'understanding-pe-ratio-beginners-guide',
    title: 'Understanding P/E Ratio: A Complete Beginner\'s Guide',
    excerpt: 'The Price-to-Earnings ratio is one of the most fundamental metrics in stock analysis. Learn what it means, how to calculate it, and when to use it.',
    author: 'Deepin Team',
    publishedAt: '2025-01-10',
    readTime: '8 min read',
    category: 'Fundamentals',
    image: '/blog/pe-ratio.jpg',
    featured: false,
  },
  {
    slug: 'why-you-dont-need-bloomberg-terminal',
    title: 'Why You Don\'t Need a Bloomberg Terminal in 2025',
    excerpt: 'Professional-grade stock analysis doesn\'t require a $25,000/year terminal. Here\'s how individual investors can access the same insights for a fraction of the cost.',
    author: 'Deepin Team',
    publishedAt: '2025-01-08',
    readTime: '6 min read',
    category: 'Industry',
    image: '/blog/bloomberg-alternative.jpg',
    featured: false,
  },
  {
    slug: 'how-to-use-ai-for-stock-analysis',
    title: 'How to Use AI for Stock Analysis: A Practical Guide',
    excerpt: 'AI is transforming how investors analyze stocks. Learn how to leverage artificial intelligence to gain insights, save time, and make better decisions.',
    author: 'Deepin Team',
    publishedAt: '2025-01-05',
    readTime: '10 min read',
    category: 'AI & Technology',
    image: '/blog/ai-stock-analysis.jpg',
    featured: false,
  },
  {
    slug: 'technical-analysis-101',
    title: 'Technical Analysis 101: Charts, Patterns, and Indicators',
    excerpt: 'A comprehensive introduction to technical analysis. Learn to read charts, identify patterns, and use popular indicators like RSI and MACD.',
    author: 'Deepin Team',
    publishedAt: '2025-01-03',
    readTime: '12 min read',
    category: 'Technical Analysis',
    image: '/blog/technical-analysis.jpg',
    featured: false,
  },
  {
    slug: 'introducing-deep-terminal',
    title: 'Introducing Deep: AI-Powered Stock Analysis for Everyone',
    excerpt: 'We built Deepin to democratize professional stock analysis. Here\'s our story and vision for the future of retail investing.',
    author: 'Founders',
    publishedAt: '2025-01-01',
    readTime: '5 min read',
    category: 'Company',
    image: '/blog/introducing-deep-terminal.jpg',
    featured: false,
  },
];

const categories = [
  { name: 'All Posts', slug: 'all' },
  { name: 'Market Analysis', slug: 'market-analysis' },
  { name: 'Stock Analysis', slug: 'stock-analysis' },
  { name: 'Fundamentals', slug: 'fundamentals' },
  { name: 'Technical Analysis', slug: 'technical-analysis' },
  { name: 'AI & Technology', slug: 'ai-technology' },
  { name: 'Industry', slug: 'industry' },
  { name: 'Investment Strategy', slug: 'investment-strategy' },
];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((post) => post.featured);
  const recentPosts = blogPosts.filter((post) => !post.featured);

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Home', url: 'https://deepterm.co' },
          { name: 'Blog', url: 'https://deepterm.co/blog' },
        ])}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Stock Market Insights
            </h1>
            <p className="mt-6 text-lg text-white/60">
              Expert analysis, investing strategies, and market trends. 
              Learn to make better investment decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.slug}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                  category.slug === 'all'
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
            Featured
          </h2>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {featuredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-cyan-500/20 to-violet-500/20" />
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-cyan-400">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/40 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
            All Posts
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...featuredPosts, ...recentPosts].map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="aspect-[16/9] rounded-lg bg-gradient-to-br from-cyan-500/10 to-violet-500/10" />
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span className="text-cyan-400">{post.category}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="mt-2 font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/40 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Get Market Insights Delivered
            </h2>
            <p className="mt-4 text-white/60">
              Join our newsletter for weekly market analysis and investing tips.
            </p>
            <form className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 sm:w-72"
              />
              <button
                type="submit"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-white/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-4 text-xs text-white/40">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
