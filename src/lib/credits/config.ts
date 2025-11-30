/**
 * Credit System Configuration
 */

// Credit cost per action
export const CREDIT_COSTS = {
  // Search and basic view
  stock_search: 2,
  real_time_quote: 3,
  
  // Analysis
  technical_analysis: 10,
  financial_report: 20,
  ai_analysis: 25,
  dcf_valuation: 35,
  stock_comparison: 40,
  portfolio_analysis: 50,
  
  // Other
  news_fetch: 5,
  watchlist_alert: 2,
  chat_message: 10,
} as const

export type CreditAction = keyof typeof CREDIT_COSTS

// Rate Limiting per plan
export const RATE_LIMITS = {
  free: {
    requestsPerMinute: 10,
    requestsPerHour: 50,
    requestsPerDay: 200,
    monthlyCredits: 50,
  },
  premium: {
    requestsPerMinute: 30,
    requestsPerHour: 200,
    requestsPerDay: 1000,
    monthlyCredits: 500,
  },
  professional: {
    requestsPerMinute: 60,
    requestsPerHour: 500,
    requestsPerDay: 3000,
    monthlyCredits: 2000,
  },
  enterprise: {
    requestsPerMinute: 120,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    monthlyCredits: -1, // Unlimited
  },
} as const

export type SubscriptionTier = keyof typeof RATE_LIMITS

// Credit packages
export const DEFAULT_CREDIT_PACKAGES = [
  {
    name: 'Starter',
    description: '100 credits to get started',
    credits: 100,
    bonusCredits: 0,
    price: 4.99,
    isPopular: false,
  },
  {
    name: 'Basic',
    description: '250 credits + 25 bonus',
    credits: 250,
    bonusCredits: 25,
    price: 9.99,
    isPopular: false,
  },
  {
    name: 'Pro',
    description: '600 credits + 100 bonus',
    credits: 600,
    bonusCredits: 100,
    price: 19.99,
    isPopular: true,
  },
  {
    name: 'Business',
    description: '1,500 credits + 300 bonus',
    credits: 1500,
    bonusCredits: 300,
    price: 39.99,
    isPopular: false,
  },
  {
    name: 'Enterprise',
    description: '4,000 credits + 1,000 bonus',
    credits: 4000,
    bonusCredits: 1000,
    price: 99.99,
    isPopular: false,
  },
] as const

// General settings
export const CREDIT_CONFIG = {
  // Initial free credits for new users
  initialFreeCredits: 20,
  
  // Monthly free credits per plan
  monthlyFreeCredits: {
    free: 50,
    premium: 200,
    professional: 800,
    enterprise: 2000,
  },
  
  // Low credit threshold for warning
  lowCreditThreshold: 20,
  
  // Free credit expiry in days
  freeCreditExpiryDays: 30,
  
  // Maximum credit balance
  maxCreditBalance: 100000,
}

// Endpoints that require credits
export const CREDIT_REQUIRED_ENDPOINTS: Record<string, CreditAction> = {
  '/api/stock/search': 'stock_search',
  '/api/stock/quote': 'real_time_quote',
  '/api/stock/technical': 'technical_analysis',
  '/api/stock/financials': 'financial_report',
  '/api/stock/dcf': 'dcf_valuation',
  '/api/stock/compare': 'stock_comparison',
  '/api/chat': 'chat_message',
  '/api/market/news': 'news_fetch',
  '/api/stock/analysis': 'ai_analysis',
  '/api/portfolio/analysis': 'portfolio_analysis',
}

// Endpoints exempt from Rate Limiting
export const RATE_LIMIT_EXEMPT_ENDPOINTS = [
  '/api/webhooks',
  '/api/admin',
  '/api/health',
  '/api/auth',
]

// Rate limit window durations (in milliseconds)
export const RATE_LIMIT_WINDOWS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
}
