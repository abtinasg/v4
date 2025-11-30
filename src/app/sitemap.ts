import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

// Blog posts - match actual blog post slugs
const blogPosts = [
  { slug: 'understanding-pe-ratio-beginners-guide', lastModified: '2025-01-10' },
  { slug: 'why-you-dont-need-bloomberg-terminal', lastModified: '2025-01-08' },
  { slug: 'how-to-use-ai-for-stock-analysis', lastModified: '2025-01-05' },
  { slug: 'technical-analysis-101', lastModified: '2025-01-03' },
  { slug: 'introducing-deep-terminal', lastModified: '2025-01-01' },
];

// Popular stock symbols for SEO
const popularStocks = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B',
  'JPM', 'V', 'JNJ', 'WMT', 'PG', 'MA', 'HD', 'DIS', 'NFLX', 'ADBE',
  'CRM', 'PYPL', 'INTC', 'AMD', 'QCOM', 'IBM', 'ORCL', 'CSCO',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Stock analysis pages (for popular stocks)
  const stockPages: MetadataRoute.Sitemap = popularStocks.map((symbol) => ({
    url: `${baseUrl}/dashboard/stock-analysis/${symbol}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...stockPages];
}
