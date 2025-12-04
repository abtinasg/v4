/**
 * SEO Utilities for Deep
 * 
 * Centralized SEO configuration, metadata helpers, and JSON-LD generators
 */

import { Metadata } from 'next';

// ============================================================
// SITE CONFIGURATION
// ============================================================

export const siteConfig = {
  name: 'Deepin',
  description: 'Professional stock analysis platform with 190+ institutional-grade metrics, AI-powered insights, and comprehensive research tools. The affordable Bloomberg Terminal alternative.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.deepinhq.com',
  ogImage: '/og-image.png',
  twitterHandle: '@deepinhq',
  keywords: [
    'stock analysis',
    'financial analysis tool',
    'Bloomberg alternative',
    'affordable stock research',
    'stock metrics',
    'investment research',
    'AI stock analysis',
    'technical analysis',
    'fundamental analysis',
    'stock screener',
    'financial data',
    'market analysis',
    'portfolio analysis',
    'stock valuation',
    'equity research',
  ],
  author: 'Deepin',
  locale: 'en_US',
};

// ============================================================
// DEFAULT METADATA
// ============================================================

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Professional Stock Analysis Platform`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - Professional Stock Analysis Platform`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - Professional Stock Analysis Platform`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: siteConfig.url,
  },
};

// ============================================================
// PAGE METADATA GENERATOR
// ============================================================

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

export function generatePageMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
  keywords = [],
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
}: PageMetadataOptions): Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || siteConfig.ogImage;
  const allKeywords = [...siteConfig.keywords, ...keywords];

  const openGraphData: Record<string, unknown> = {
    title,
    description,
    url,
    type,
    images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
  };

  if (type === 'article' && publishedTime) {
    openGraphData.publishedTime = publishedTime;
    openGraphData.modifiedTime = modifiedTime || publishedTime;
    openGraphData.authors = authors;
  }

  return {
    title,
    description,
    keywords: allKeywords,
    robots: noIndex ? { index: false, follow: false } : undefined,
    authors: authors?.map((author) => ({ name: author })),
    openGraph: openGraphData,
    twitter: {
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

// ============================================================
// JSON-LD STRUCTURED DATA
// ============================================================

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.jpeg`,
    description: siteConfig.description,
    sameAs: [
      'https://twitter.com/deepin',
      'https://github.com/deepin',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@deepterm.co',
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/dashboard/stock-analysis/{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier with 100 credits',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    description: siteConfig.description,
    url: siteConfig.url,
  };
}

interface BlogPostSchemaOptions {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  image?: string;
}

export function generateBlogPostSchema({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  author = 'Deepin Team',
  image,
}: BlogPostSchemaOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url: `${siteConfig.url}/blog/${slug}`,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.jpeg`,
      },
    },
    image: image || siteConfig.ogImage,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/blog/${slug}`,
    },
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

interface ArticleSchemaOptions {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
}

export function generateArticleSchema({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  author = 'Deepin Team',
}: ArticleSchemaOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    image: image || `${siteConfig.url}${siteConfig.ogImage}`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.jpeg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ============================================================
// JSON-LD COMPONENT HELPER
// ============================================================

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
