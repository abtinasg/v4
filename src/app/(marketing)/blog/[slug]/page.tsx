import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, User, Share2, Twitter, Linkedin } from 'lucide-react';
import { generatePageMetadata, JsonLd, generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seo';

// Blog posts data - in production, this would come from a CMS or MDX files
const blogPosts: Record<string, {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  readTime: string;
  category: string;
  image: string;
}> = {
  'understanding-pe-ratio-beginners-guide': {
    title: 'Understanding P/E Ratio: A Complete Beginner\'s Guide',
    excerpt: 'The Price-to-Earnings ratio is one of the most fundamental metrics in stock analysis. Learn what it means, how to calculate it, and when to use it.',
    content: `
## What is the P/E Ratio?

The Price-to-Earnings ratio, commonly known as P/E, is one of the most widely used metrics for evaluating whether a stock is fairly valued. It measures the relationship between a company's stock price and its earnings per share (EPS).

### The Formula

The P/E ratio is calculated by dividing the current stock price by the earnings per share:

**P/E Ratio = Stock Price / Earnings Per Share (EPS)**

For example, if a company's stock trades at $100 and its EPS is $5, the P/E ratio would be 20.

## Types of P/E Ratios

### Trailing P/E
Uses the company's earnings from the past 12 months. This is the most commonly cited P/E ratio because it's based on actual, reported earnings.

### Forward P/E
Uses estimated future earnings, typically for the next 12 months. This can be useful for fast-growing companies where past earnings may not reflect future potential.

## How to Interpret P/E Ratios

A high P/E ratio might indicate:
- Investors expect high growth in the future
- The stock might be overvalued
- The company is in a high-growth industry

A low P/E ratio might indicate:
- The stock is undervalued
- Investors have low growth expectations
- The company faces challenges

## Industry Comparisons

It's crucial to compare P/E ratios within the same industry. Technology companies often have higher P/E ratios than utility companies because they're expected to grow faster.

| Industry | Average P/E |
|----------|-------------|
| Technology | 25-40 |
| Financials | 10-15 |
| Utilities | 15-20 |
| Healthcare | 20-30 |

## Limitations of P/E

While useful, P/E has limitations:
- Doesn't account for debt levels
- Can be manipulated by accounting practices
- Not useful for unprofitable companies
- Doesn't consider growth rate

## When to Use P/E

P/E works best when:
- Comparing similar companies
- The company has stable, positive earnings
- Combined with other metrics like PEG ratio

## Start Analyzing

Ready to put this knowledge to use? Deep calculates P/E ratios and 50+ other metrics automatically for any stock.
    `,
    author: 'Deep Team',
    publishedAt: '2025-01-10',
    readTime: '8 min read',
    category: 'Fundamentals',
    image: '/blog/pe-ratio.jpg',
  },
  'why-you-dont-need-bloomberg-terminal': {
    title: 'Why You Don\'t Need a Bloomberg Terminal in 2025',
    excerpt: 'Professional-grade stock analysis doesn\'t require a $25,000/year terminal. Here\'s how individual investors can access the same insights for a fraction of the cost.',
    content: `
## The Bloomberg Problem

For decades, the Bloomberg Terminal has been the gold standard for financial professionals. At $25,000+ per year, it's priced for institutional traders and hedge funds, not individual investors.

But here's the thing: **you don't need it anymore**.

## What Bloomberg Offers

The Bloomberg Terminal provides:
- Real-time market data
- Financial news
- Company financials
- Technical analysis tools
- Economic indicators

Sound familiar? That's because these features are now available through modern alternatives at a fraction of the cost.

## The Rise of Alternatives

### Free Data Sources
- Yahoo Finance for basic quotes
- SEC EDGAR for filings
- Federal Reserve for economic data

### Affordable Platforms
Modern platforms like Deep combine these data sources with AI analysis to deliver professional-grade insights without the professional-grade price tag.

## What You Actually Need

Most individual investors need:
1. **Real-time quotes** - Available free or nearly free
2. **Financial statements** - Public via SEC filings
3. **Technical charts** - Many free options exist
4. **Analysis tools** - AI makes this accessible

## The AI Advantage

Here's where it gets interesting. AI can now:
- Analyze financial statements in seconds
- Identify patterns across thousands of stocks
- Generate professional reports
- Answer complex financial questions

This is something Bloomberg Terminal users have to do manually.

## Cost Comparison

| Feature | Bloomberg | Deep |
|---------|-----------|---------------|
| Monthly Cost | $2,000+ | Pay per use |
| Real-time Data | Yes | Yes |
| AI Analysis | Limited | Advanced |
| Learning Curve | Steep | Minutes |

## The Bottom Line

Unless you're a professional trader executing millions in daily volume, Bloomberg Terminal is overkill. Modern alternatives provide everything retail investors need at a tiny fraction of the cost.

The playing field has been leveled. Professional analysis is no longer reserved for the wealthy.
    `,
    author: 'Deep Team',
    publishedAt: '2025-01-08',
    readTime: '6 min read',
    category: 'Industry',
    image: '/blog/bloomberg-alternative.jpg',
  },
  'how-to-use-ai-for-stock-analysis': {
    title: 'How to Use AI for Stock Analysis: A Practical Guide',
    excerpt: 'AI is transforming how investors analyze stocks. Learn how to leverage artificial intelligence to gain insights, save time, and make better decisions.',
    content: `
## The AI Revolution in Investing

Artificial intelligence is fundamentally changing how we analyze stocks. What once took analysts hours can now be done in seconds. But how do you actually use AI for stock analysis?

## What AI Can Do

### Financial Statement Analysis
AI can instantly parse through years of financial statements, identifying trends, anomalies, and red flags that might take a human analyst hours to spot.

### Pattern Recognition
Machine learning excels at identifying patterns across thousands of stocks, finding correlations that humans might miss.

### Sentiment Analysis
AI can analyze news articles, social media, and earnings calls to gauge market sentiment around a stock.

### Risk Assessment
AI models can quantify risks based on historical data, market conditions, and company-specific factors.

## Practical Applications

### 1. Quick Company Overviews
Ask AI: "Give me an overview of AAPL's financial health"

The AI will analyze balance sheets, income statements, and cash flow to provide a comprehensive summary.

### 2. Comparative Analysis
Ask AI: "Compare AAPL to MSFT and GOOGL"

Get instant comparative metrics across valuation, growth, and profitability.

### 3. Technical Analysis
Ask AI: "What do the technical indicators say about AAPL?"

AI can interpret RSI, MACD, moving averages, and more.

### 4. Risk Analysis
Ask AI: "What are the main risks for investing in AAPL?"

Get a breakdown of market, operational, and financial risks.

## Best Practices

### Be Specific
The more specific your question, the better the answer. "Why is AAPL's P/E high compared to the tech sector average?" is better than "Tell me about AAPL."

### Verify Important Data
AI is powerful but not infallible. Always verify critical data points before making investment decisions.

### Use AI as a Starting Point
Think of AI as a research assistant, not a replacement for your judgment. It accelerates analysis but shouldn't make decisions for you.

### Combine with Traditional Analysis
The best approach combines AI efficiency with human intuition and experience.

## Getting Started

1. Start with companies you know
2. Ask basic questions to understand the AI's capabilities
3. Gradually increase complexity
4. Compare AI insights with your own analysis

AI won't replace human judgment, but it will amplify your analytical capabilities. The investors who learn to leverage AI effectively will have a significant advantage.
    `,
    author: 'Deep Team',
    publishedAt: '2025-01-05',
    readTime: '10 min read',
    category: 'AI & Technology',
    image: '/blog/ai-stock-analysis.jpg',
  },
  'technical-analysis-101': {
    title: 'Technical Analysis 101: Charts, Patterns, and Indicators',
    excerpt: 'A comprehensive introduction to technical analysis. Learn to read charts, identify patterns, and use popular indicators like RSI and MACD.',
    content: `
## What is Technical Analysis?

Technical analysis is the study of price movements and trading volume to forecast future price changes. Unlike fundamental analysis, which focuses on a company's financials, technical analysis is purely based on market data.

## Reading Charts

### Candlestick Charts
The most popular chart type shows:
- **Open** - Where the price started
- **Close** - Where the price ended
- **High** - The highest price
- **Low** - The lowest price

Green/white candles = price went up
Red/black candles = price went down

### Timeframes
- **1 minute** - Day trading
- **15 minutes** - Swing trading
- **Daily** - Position trading
- **Weekly** - Long-term investing

## Key Patterns

### Support and Resistance
- **Support** - Price level where buying pressure prevents further decline
- **Resistance** - Price level where selling pressure prevents further rise

### Trend Lines
Connect consecutive highs or lows to identify the trend direction.

### Common Patterns
1. **Head and Shoulders** - Reversal pattern
2. **Double Top/Bottom** - Reversal pattern
3. **Triangles** - Continuation pattern
4. **Flags** - Continuation pattern

## Popular Indicators

### Moving Averages
- **SMA (Simple)** - Average of prices over a period
- **EMA (Exponential)** - Weighted toward recent prices
- Common periods: 20, 50, 200 days

### RSI (Relative Strength Index)
- Measures momentum on a 0-100 scale
- Above 70 = Overbought
- Below 30 = Oversold

### MACD
- Shows relationship between two moving averages
- Signal line crossovers indicate buy/sell opportunities

### Bollinger Bands
- Middle band = 20-day SMA
- Upper/lower bands = 2 standard deviations
- Price touching bands can indicate reversals

## Putting It Together

1. Identify the trend (up, down, sideways)
2. Find support and resistance levels
3. Confirm with indicators
4. Look for patterns
5. Manage risk with stop-losses

## Limitations

Technical analysis works best when:
- Markets are liquid
- Combined with other analysis methods
- Risk management is in place

It's not perfect, but it's a valuable tool in any investor's toolkit.
    `,
    author: 'Deep Team',
    publishedAt: '2025-01-03',
    readTime: '12 min read',
    category: 'Technical Analysis',
    image: '/blog/technical-analysis.jpg',
  },
  'introducing-deep-terminal': {
    title: 'Introducing Deep: AI-Powered Stock Analysis for Everyone',
    excerpt: 'We built Deep to democratize professional stock analysis. Here\'s our story and vision for the future of retail investing.',
    content: `
## Why We Built Deep

The stock market has always been tilted toward those with the most resources. Professional traders have access to expensive terminals, teams of analysts, and sophisticated tools. Individual investors? They're often left with basic charts and outdated information.

We set out to change that.

## The Problem

Individual investors face several challenges:
- **Information asymmetry** - Professionals have access to better data
- **Analysis complexity** - Understanding financials takes expertise
- **Time constraints** - Most people can't spend hours researching
- **Cost barriers** - Professional tools are prohibitively expensive

## Our Solution

Deep combines three powerful elements:

### 1. Comprehensive Data
We aggregate data from multiple sources to provide a complete picture of any stock:
- Real-time quotes
- Financial statements
- Technical indicators
- Market news
- Economic data

### 2. AI-Powered Analysis
Our AI doesn't just retrieve data—it analyzes it. Ask any question about a stock and get instant, intelligent answers:
- "Is AAPL undervalued?"
- "What are the risks of investing in TSLA?"
- "Compare Microsoft's margins to its competitors"

### 3. Accessible Pricing
We believe everyone deserves access to professional tools. Our credit-based pricing means you pay for what you use, not a flat monthly fee you might not fully utilize.

## What You Can Do

With Deep, you can:
- Analyze any stock in seconds
- Get AI-generated reports
- Track watchlists with alerts
- Compare companies side by side
- Understand complex metrics explained simply

## Our Vision

We're building the future of retail investing—one where:
- Information is accessible to all
- AI augments human decision-making
- Professional tools don't require professional budgets
- Investing is less intimidating and more informed

## Get Started

We're offering 100 free credits to every new user. No credit card required. 

Join thousands of investors who are already using Deep to make smarter investment decisions.

Welcome to the future of stock analysis.
    `,
    author: 'Founders',
    publishedAt: '2025-01-01',
    readTime: '5 min read',
    category: 'Company',
    image: '/blog/introducing-deep-terminal.jpg',
  },
};

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = blogPosts[resolvedParams.slug];
  
  if (!post) {
    return {};
  }

  return generatePageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${resolvedParams.slug}`,
    type: 'article',
    publishedTime: post.publishedAt,
    authors: [post.author],
  });
}

export function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = blogPosts[resolvedParams.slug];

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          generateBreadcrumbSchema([
            { name: 'Home', url: 'https://deepterm.co' },
            { name: 'Blog', url: 'https://deepterm.co/blog' },
            { name: post.title, url: `https://deepterm.co/blog/${resolvedParams.slug}` },
          ]),
          generateArticleSchema({
            title: post.title,
            description: post.excerpt,
            url: `https://deepterm.co/blog/${resolvedParams.slug}`,
            image: `https://deepterm.co${post.image}`,
            publishedTime: post.publishedAt,
            author: post.author,
          }),
        ]}
      />

      <article className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mt-8">
            <div className="flex items-center gap-3 text-sm text-white/40">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-400">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {post.title}
            </h1>

            <p className="mt-4 text-lg text-white/60">
              {post.excerpt}
            </p>

            <div className="mt-6 flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500" />
                <div>
                  <div className="font-medium text-white">{post.author}</div>
                  <div className="text-sm text-white/40">Deep</div>
                </div>
              </div>

              {/* Share */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/40">Share:</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://deepterm.co/blog/${resolvedParams.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://deepterm.co/blog/${resolvedParams.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </header>

          {/* Content */}
          <div 
            className="prose prose-invert prose-cyan mt-10 max-w-none
              prose-headings:font-bold prose-headings:text-white
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-white/60 prose-p:leading-relaxed
              prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-strong:font-semibold
              prose-ul:text-white/60 prose-ol:text-white/60
              prose-li:marker:text-cyan-400
              prose-table:border-white/10
              prose-th:text-white prose-th:border-white/10 prose-th:p-3
              prose-td:text-white/60 prose-td:border-white/10 prose-td:p-3
              prose-code:text-cyan-400 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded
              prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(post.content) }}
          />

          {/* CTA */}
          <div className="mt-16 rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <h3 className="text-xl font-bold text-white">
              Ready to analyze stocks like a pro?
            </h3>
            <p className="mt-2 text-white/60">
              Get started with Deep and receive 100 free credits.
            </p>
            <Link
              href="/sign-up"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}

// Simple markdown formatter (in production, use a proper MDX library)
function formatMarkdown(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Lists
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    // Tables
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(Boolean);
      if (cells[0].includes('---')) return '';
      return `<tr>${cells.map(c => `<td>${c.trim()}</td>`).join('')}</tr>`;
    })
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Wrap in paragraph
    .replace(/^(.+)$/gim, (match) => {
      if (match.startsWith('<')) return match;
      return match;
    });
}
