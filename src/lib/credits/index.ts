/**
 * Credit System
 * Main exports for the credit system
 */

// Config
export {
  CREDIT_COSTS,
  RATE_LIMITS,
  CREDIT_CONFIG,
  DEFAULT_CREDIT_PACKAGES,
  CREDIT_REQUIRED_ENDPOINTS,
  RATE_LIMIT_EXEMPT_ENDPOINTS,
  RATE_LIMIT_WINDOWS,
  type CreditAction,
  type SubscriptionTier,
} from './config'

// Service
export {
  getUserCreditBalance,
  getUserCredits,
  initializeUserCredits,
  checkCredits,
  deductCredits,
  addCredits,
  refundCredits,
  resetMonthlyCredits,
  getCreditHistory,
  getCreditStats,
  checkAndResetMonthlyCredits,
  type CreditCheckResult,
  type CreditDeductResult,
  type CreditAddResult,
} from './service'

// Rate Limiter
export {
  checkRateLimit,
  getRateLimitInfo,
  cleanupRateLimitRecords,
  resetRateLimit,
  type RateLimitResult,
  type RateLimitInfo,
} from './rate-limiter'

// Middleware
export {
  creditMiddleware,
  deductCreditsAfterSuccess,
  addCreditHeaders,
  createCreditErrorResponse,
  createInsufficientCreditsResponse,
  createAuthRequiredResponse,
  createRateLimitResponse,
  type CreditMiddlewareResult,
} from './middleware'

// Higher Order Functions
export {
  withCredits,
  withRateLimit,
  type CreditContext,
} from './with-credits'

// Promo Codes
export {
  validatePromoCode,
  redeemPromoCode,
  applyPromoCodeToPurchase,
  recordPromoCodePurchaseUsage,
  createPromoCode,
  getActivePromoCodes,
  getPromoCodeStats,
  type PromoCodeValidationResult,
  type PromoCodeRedeemResult,
} from './promo'

// Analytics
export {
  getUserUsageAnalytics,
  getSystemAnalytics,
  getUserTransactionHistory,
  type UsageByAction,
  type DailyUsage,
  type UsageAnalytics,
  type AdminAnalytics,
} from './analytics'
