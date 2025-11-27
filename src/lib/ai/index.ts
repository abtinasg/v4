/**
 * AI Integration Module
 * 
 * Re-exports all AI-related utilities for easy importing
 */

// OpenRouter client and types
export {
  OpenRouterClient,
  getOpenRouterClient,
  chat,
  streamChat,
  OpenRouterError,
  estimateTokens,
  estimateMessageTokens,
  estimateCost,
  OPENROUTER_MODELS,
  DEFAULT_MODEL,
  FALLBACK_MODEL,
  type OpenRouterModel,
  type ChatMessage,
  type ChatCompletionOptions,
  type ChatCompletionResponse,
  type StreamChunk,
} from './openrouter'

// Prompts
export {
  getSystemPrompt,
  buildSystemPrompt,
  getMetricExplanationPrompt,
  getQuickAnalysisPrompt,
  GENERAL_FINANCIAL_ANALYSIS,
  STOCK_ANALYSIS,
  METRIC_EXPLANATION,
  MARKET_OVERVIEW,
  PORTFOLIO_ADVICE,
  TECHNICAL_ANALYSIS,
  NEWS_ANALYSIS,
  type PromptContext,
} from './prompts'

// Context builder
export {
  buildContextString,
  buildFullContext,
  inferPromptContext,
  type StockMetrics,
  type StockContext,
  type MarketContext,
  type PortfolioContext,
  type UserContext,
  type AIContext,
} from './context-builder'

// Context-specific prompts
export {
  buildContextSystemPrompt,
  generateSuggestedQuestions,
  detectContextType,
  buildPromptContext,
  type AIContextType,
  type AIPromptContext,
  type StockAnalysisContext,
  type MarketOverviewContext,
  type PortfolioContextData,
  type GeneralEducationContext,
  type SuggestedQuestion,
} from './context-prompts'

// Stock summary
export {
  generateStockSummary,
  batchGenerateSummaries,
  hasCachedSummary,
  getCacheStatus,
  prefetchSummary,
  clearSummaryCache,
  type StockSummary,
} from './stock-summary'

// Metric explainer
export {
  explainMetric,
  batchExplainMetrics,
  hasExplanation,
  clearExplanationCache,
  getQuickExplanation,
  QUICK_EXPLANATIONS,
  type MetricExplanation,
} from './metric-explainer'

// Comparison analysis
export {
  compareStocks,
  quickCompare,
  hasComparison,
  clearComparisonCache,
  getComparisonCacheStatus,
  type ComparisonAnalysis,
  type StockAnalysis,
  type InvestorTypeMatch,
} from './comparison'
