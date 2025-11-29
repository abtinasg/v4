/**
 * AI Context Builder
 * 
 * Builds context from the current page state, stock data,
 * and user preferences to provide to the AI.
 */

import type { 
  StockQuote, 
  MarketIndex, 
  ChatContext,
  UserSettings 
} from '@/types'
import { PromptContext } from './prompts'

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface StockMetrics {
  // Valuation
  pe?: number
  forwardPE?: number
  pb?: number
  ps?: number
  evToEbitda?: number
  evToRevenue?: number
  peg?: number
  
  // Profitability
  grossMargin?: number
  operatingMargin?: number
  netMargin?: number
  roe?: number
  roa?: number
  roic?: number
  
  // Growth
  revenueGrowth?: number
  earningsGrowth?: number
  revenueGrowth5Y?: number
  epsGrowth5Y?: number
  
  // Financial Health
  currentRatio?: number
  quickRatio?: number
  debtToEquity?: number
  debtToEbitda?: number
  interestCoverage?: number
  
  // Efficiency
  assetTurnover?: number
  inventoryTurnover?: number
  receivablesTurnover?: number
  
  // Per Share
  eps?: number
  bookValue?: number
  fcfPerShare?: number
  
  // Dividend
  dividendYield?: number
  payoutRatio?: number
  
  // Technical
  rsi?: number
  fiftyDayMA?: number
  twoHundredDayMA?: number
  beta?: number
  
  // Cashflow
  freeCashFlow?: number
  operatingCashFlow?: number
  capex?: number
}

export interface StockContext {
  symbol: string
  name?: string
  sector?: string
  industry?: string
  description?: string
  quote?: StockQuote
  metrics?: StockMetrics
  historicalPrices?: {
    date: string
    close: number
    volume: number
  }[]
  news?: {
    title: string
    summary: string
    date: string
    sentiment?: 'positive' | 'negative' | 'neutral'
  }[]
  analystRatings?: {
    buy: number
    hold: number
    sell: number
    targetPrice?: number
  }
}

export interface MarketContext {
  indices?: MarketIndex[]
  topGainers?: { symbol: string; change: number }[]
  topLosers?: { symbol: string; change: number }[]
  marketStatus?: 'open' | 'closed' | 'pre-market' | 'after-hours'
  vix?: number
  treasuryYield10Y?: number
  sectorPerformance?: Record<string, number>
}

export interface PortfolioContext {
  holdings?: {
    symbol: string
    shares: number
    avgCost: number
    currentValue: number
    gainLoss: number
    gainLossPercent: number
    weight: number
  }[]
  totalValue?: number
  totalGainLoss?: number
  dayChange?: number
  sectorAllocation?: Record<string, number>
}

export interface UserContext {
  preferences?: UserSettings
  watchlistSymbols?: string[]
  recentSearches?: string[]
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  favoriteMetrics?: string[]
}

// News item for AI context
export interface NewsContextItem {
  headline: string
  summary: string
  category: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  source: string
  timeAgo: string
  symbol?: string
}

// Terminal/Market data context
export interface TerminalContext {
  indices?: { symbol: string; name: string; price: number; change: number; changePercent: number }[]
  sectors?: { name: string; change: number }[]
  topGainers?: { symbol: string; name: string; price: number; changePercent: number }[]
  topLosers?: { symbol: string; name: string; price: number; changePercent: number }[]
  currencies?: { symbol: string; price: number; change: number }[]
  commodities?: { symbol: string; name: string; price: number; change: number }[]
  crypto?: { symbol: string; price: number; change: number }[]
  news?: { headline: string; time: string }[]
}

// Economic Indicators context
export interface EconomicIndicatorsContext {
  gdp?: { value: number | null; change: number | null }
  unemployment?: { value: number | null; change: number | null }
  inflation?: { value: number | null; change: number | null }
  federalFundsRate?: { value: number | null; change: number | null }
  consumerConfidence?: { value: number | null; change: number | null }
  manufacturingPmi?: { value: number | null; change: number | null }
  servicesPmi?: { value: number | null; change: number | null }
}

// News page context
export interface NewsPageContext {
  recentNews: NewsContextItem[]
  newsCount: number
  sentimentBreakdown?: { bullish: number; bearish: number; neutral: number }
}

export interface AIContext {
  type: PromptContext
  stock?: StockContext
  market?: MarketContext
  portfolio?: PortfolioContext
  user?: UserContext
  // News page context
  newsContext?: NewsPageContext
  // Terminal Pro page context
  terminalContext?: TerminalContext
  // Economic indicators context
  economicIndicators?: EconomicIndicatorsContext
  pageContext?: {
    currentPage: string
    selectedTimeframe?: string
    selectedMetricCategory?: string
  }
}

// ============================================================
// CONTEXT FORMATTING
// ============================================================

/**
 * Format a number for display in AI context
 */
function formatNumber(value: number | undefined, options?: {
  decimals?: number
  percent?: boolean
  currency?: boolean
}): string {
  if (value === undefined || value === null) return 'N/A'
  
  const { decimals = 2, percent = false, currency = false } = options || {}
  
  if (percent) {
    return `${(value * 100).toFixed(decimals)}%`
  }
  
  if (currency) {
    if (Math.abs(value) >= 1e12) {
      return `$${(value / 1e12).toFixed(decimals)}T`
    }
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(decimals)}B`
    }
    if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(decimals)}M`
    }
    return `$${value.toFixed(decimals)}`
  }
  
  return value.toFixed(decimals)
}

/**
 * Format stock metrics into a readable string
 */
function formatMetrics(metrics: StockMetrics): string {
  const sections: string[] = []
  
  // Valuation metrics
  const valuation: string[] = []
  if (metrics.pe !== undefined) valuation.push(`P/E: ${formatNumber(metrics.pe)}`)
  if (metrics.forwardPE !== undefined) valuation.push(`Forward P/E: ${formatNumber(metrics.forwardPE)}`)
  if (metrics.pb !== undefined) valuation.push(`P/B: ${formatNumber(metrics.pb)}`)
  if (metrics.ps !== undefined) valuation.push(`P/S: ${formatNumber(metrics.ps)}`)
  if (metrics.evToEbitda !== undefined) valuation.push(`EV/EBITDA: ${formatNumber(metrics.evToEbitda)}`)
  if (metrics.evToRevenue !== undefined) valuation.push(`EV/Revenue: ${formatNumber(metrics.evToRevenue)}`)
  if (metrics.peg !== undefined) valuation.push(`PEG: ${formatNumber(metrics.peg)}`)
  if (valuation.length) sections.push(`**Valuation**: ${valuation.join(' | ')}`)
  
  // Profitability metrics
  const profitability: string[] = []
  if (metrics.grossMargin !== undefined) profitability.push(`Gross Margin: ${formatNumber(metrics.grossMargin, { percent: true })}`)
  if (metrics.operatingMargin !== undefined) profitability.push(`Operating Margin: ${formatNumber(metrics.operatingMargin, { percent: true })}`)
  if (metrics.netMargin !== undefined) profitability.push(`Net Margin: ${formatNumber(metrics.netMargin, { percent: true })}`)
  if (metrics.roe !== undefined) profitability.push(`ROE: ${formatNumber(metrics.roe, { percent: true })}`)
  if (metrics.roa !== undefined) profitability.push(`ROA: ${formatNumber(metrics.roa, { percent: true })}`)
  if (metrics.roic !== undefined) profitability.push(`ROIC: ${formatNumber(metrics.roic, { percent: true })}`)
  if (profitability.length) sections.push(`**Profitability**: ${profitability.join(' | ')}`)
  
  // Growth metrics
  const growth: string[] = []
  if (metrics.revenueGrowth !== undefined) growth.push(`Revenue Growth: ${formatNumber(metrics.revenueGrowth, { percent: true })}`)
  if (metrics.earningsGrowth !== undefined) growth.push(`Earnings Growth: ${formatNumber(metrics.earningsGrowth, { percent: true })}`)
  if (metrics.revenueGrowth5Y !== undefined) growth.push(`5Y Revenue CAGR: ${formatNumber(metrics.revenueGrowth5Y, { percent: true })}`)
  if (metrics.epsGrowth5Y !== undefined) growth.push(`5Y EPS CAGR: ${formatNumber(metrics.epsGrowth5Y, { percent: true })}`)
  if (growth.length) sections.push(`**Growth**: ${growth.join(' | ')}`)
  
  // Financial health
  const health: string[] = []
  if (metrics.currentRatio !== undefined) health.push(`Current Ratio: ${formatNumber(metrics.currentRatio)}`)
  if (metrics.quickRatio !== undefined) health.push(`Quick Ratio: ${formatNumber(metrics.quickRatio)}`)
  if (metrics.debtToEquity !== undefined) health.push(`Debt/Equity: ${formatNumber(metrics.debtToEquity)}`)
  if (metrics.debtToEbitda !== undefined) health.push(`Debt/EBITDA: ${formatNumber(metrics.debtToEbitda)}`)
  if (metrics.interestCoverage !== undefined) health.push(`Interest Coverage: ${formatNumber(metrics.interestCoverage)}x`)
  if (health.length) sections.push(`**Financial Health**: ${health.join(' | ')}`)
  
  // Efficiency metrics
  const efficiency: string[] = []
  if (metrics.assetTurnover !== undefined) efficiency.push(`Asset Turnover: ${formatNumber(metrics.assetTurnover)}x`)
  if (metrics.inventoryTurnover !== undefined) efficiency.push(`Inventory Turnover: ${formatNumber(metrics.inventoryTurnover)}x`)
  if (metrics.receivablesTurnover !== undefined) efficiency.push(`Receivables Turnover: ${formatNumber(metrics.receivablesTurnover)}x`)
  if (efficiency.length) sections.push(`**Efficiency**: ${efficiency.join(' | ')}`)
  
  // Cashflow
  const cashflow: string[] = []
  if (metrics.freeCashFlow !== undefined) cashflow.push(`Free Cash Flow: ${formatNumber(metrics.freeCashFlow, { currency: true })}`)
  if (metrics.operatingCashFlow !== undefined) cashflow.push(`Operating Cash Flow: ${formatNumber(metrics.operatingCashFlow, { currency: true })}`)
  if (metrics.fcfPerShare !== undefined) cashflow.push(`FCF/Share: $${formatNumber(metrics.fcfPerShare)}`)
  if (cashflow.length) sections.push(`**Cash Flow**: ${cashflow.join(' | ')}`)
  
  // Dividend
  const dividend: string[] = []
  if (metrics.dividendYield !== undefined) dividend.push(`Dividend Yield: ${formatNumber(metrics.dividendYield, { percent: true })}`)
  if (metrics.payoutRatio !== undefined) dividend.push(`Payout Ratio: ${formatNumber(metrics.payoutRatio, { percent: true })}`)
  if (dividend.length) sections.push(`**Dividend**: ${dividend.join(' | ')}`)
  
  // Technical
  const technical: string[] = []
  if (metrics.rsi !== undefined) technical.push(`RSI: ${formatNumber(metrics.rsi, { decimals: 0 })}`)
  if (metrics.fiftyDayMA !== undefined) technical.push(`50-day MA: ${formatNumber(metrics.fiftyDayMA, { currency: true })}`)
  if (metrics.twoHundredDayMA !== undefined) technical.push(`200-day MA: ${formatNumber(metrics.twoHundredDayMA, { currency: true })}`)
  if (metrics.beta !== undefined) technical.push(`Beta: ${formatNumber(metrics.beta)}`)
  if (technical.length) sections.push(`**Technical**: ${technical.join(' | ')}`)
  
  return sections.join('\n')
}

/**
 * Format stock quote into a readable string
 */
function formatQuote(quote: StockQuote): string {
  const change = quote.change >= 0 ? `+${quote.change.toFixed(2)}` : quote.change.toFixed(2)
  const changePercent = quote.changePercent >= 0 
    ? `+${quote.changePercent.toFixed(2)}%` 
    : `${quote.changePercent.toFixed(2)}%`
  
  return `**Price**: $${quote.price.toFixed(2)} (${change}, ${changePercent})
**Day Range**: $${quote.low.toFixed(2)} - $${quote.high.toFixed(2)}
**Open**: $${quote.open.toFixed(2)} | **Prev Close**: $${quote.previousClose.toFixed(2)}
**Volume**: ${(quote.volume / 1e6).toFixed(2)}M
**Market Cap**: ${formatNumber(quote.marketCap, { currency: true })}`
}

/**
 * Format market context into a readable string
 */
function formatMarketContext(market: MarketContext): string {
  const sections: string[] = []
  
  if (market.indices?.length) {
    const indexLines = market.indices.map(idx => {
      const change = idx.change >= 0 ? `+${idx.change.toFixed(2)}` : idx.change.toFixed(2)
      const pct = idx.changePercent >= 0 ? `+${idx.changePercent.toFixed(2)}%` : `${idx.changePercent.toFixed(2)}%`
      return `${idx.name}: ${idx.value.toFixed(2)} (${change}, ${pct})`
    })
    sections.push(`**Major Indices**:\n${indexLines.join('\n')}`)
  }
  
  if (market.marketStatus) {
    sections.push(`**Market Status**: ${market.marketStatus}`)
  }
  
  if (market.vix !== undefined) {
    sections.push(`**VIX**: ${market.vix.toFixed(2)}`)
  }
  
  if (market.treasuryYield10Y !== undefined) {
    sections.push(`**10Y Treasury Yield**: ${market.treasuryYield10Y.toFixed(2)}%`)
  }
  
  if (market.sectorPerformance) {
    const sectorLines = Object.entries(market.sectorPerformance)
      .sort((a, b) => b[1] - a[1])
      .map(([sector, change]) => `${sector}: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`)
    sections.push(`**Sector Performance**:\n${sectorLines.join('\n')}`)
  }
  
  return sections.join('\n\n')
}

/**
 * Format portfolio context into a readable string
 */
function formatPortfolioContext(portfolio: PortfolioContext): string {
  const sections: string[] = []
  
  if (portfolio.totalValue !== undefined) {
    sections.push(`**Total Portfolio Value**: ${formatNumber(portfolio.totalValue, { currency: true })}`)
  }
  
  if (portfolio.totalGainLoss !== undefined) {
    const sign = portfolio.totalGainLoss >= 0 ? '+' : ''
    sections.push(`**Total Gain/Loss**: ${sign}${formatNumber(portfolio.totalGainLoss, { currency: true })}`)
  }
  
  if (portfolio.dayChange !== undefined) {
    const sign = portfolio.dayChange >= 0 ? '+' : ''
    sections.push(`**Day Change**: ${sign}${formatNumber(portfolio.dayChange, { currency: true })}`)
  }
  
  if (portfolio.holdings?.length) {
    const holdingLines = portfolio.holdings
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10)
      .map(h => {
        const sign = h.gainLossPercent >= 0 ? '+' : ''
        return `${h.symbol}: ${formatNumber(h.currentValue, { currency: true })} (${sign}${h.gainLossPercent.toFixed(2)}%, ${(h.weight * 100).toFixed(1)}% of portfolio)`
      })
    sections.push(`**Top Holdings**:\n${holdingLines.join('\n')}`)
  }
  
  if (portfolio.sectorAllocation) {
    const sectorLines = Object.entries(portfolio.sectorAllocation)
      .sort((a, b) => b[1] - a[1])
      .map(([sector, weight]) => `${sector}: ${(weight * 100).toFixed(1)}%`)
    sections.push(`**Sector Allocation**:\n${sectorLines.join('\n')}`)
  }
  
  return sections.join('\n\n')
}

// ============================================================
// MAIN CONTEXT BUILDER
// ============================================================

/**
 * Build formatted context string for AI consumption
 */
export function buildContextString(context: AIContext): string {
  const sections: string[] = []
  
  // Stock context
  if (context.stock) {
    const stockSections: string[] = []
    
    // Basic info
    const stockHeader = context.stock.name 
      ? `${context.stock.symbol} - ${context.stock.name}`
      : context.stock.symbol
    stockSections.push(`## Stock: ${stockHeader}`)
    
    if (context.stock.sector || context.stock.industry) {
      stockSections.push(`**Sector**: ${context.stock.sector || 'N/A'} | **Industry**: ${context.stock.industry || 'N/A'}`)
    }
    
    if (context.stock.description) {
      stockSections.push(`**Business**: ${context.stock.description}`)
    }
    
    // Quote
    if (context.stock.quote) {
      stockSections.push('\n### Current Quote')
      stockSections.push(formatQuote(context.stock.quote))
    }
    
    // Metrics
    if (context.stock.metrics) {
      stockSections.push('\n### Key Metrics')
      stockSections.push(formatMetrics(context.stock.metrics))
    }
    
    // Analyst ratings
    if (context.stock.analystRatings) {
      const { buy, hold, sell, targetPrice } = context.stock.analystRatings
      const total = buy + hold + sell
      const ratings = [
        `Buy: ${buy} (${((buy / total) * 100).toFixed(0)}%)`,
        `Hold: ${hold} (${((hold / total) * 100).toFixed(0)}%)`,
        `Sell: ${sell} (${((sell / total) * 100).toFixed(0)}%)`
      ]
      let ratingStr = `**Analyst Ratings**: ${ratings.join(' | ')}`
      if (targetPrice) {
        ratingStr += ` | Target: $${targetPrice.toFixed(2)}`
      }
      stockSections.push('\n### Analyst Consensus')
      stockSections.push(ratingStr)
    }
    
    // Recent news
    if (context.stock.news?.length) {
      stockSections.push('\n### Recent News')
      context.stock.news.slice(0, 3).forEach(news => {
        stockSections.push(`- **${news.title}** (${news.date})${news.sentiment ? ` [${news.sentiment}]` : ''}`)
      })
    }
    
    sections.push(stockSections.join('\n'))
  }
  
  // Market context
  if (context.market) {
    sections.push('\n---\n## Market Overview')
    sections.push(formatMarketContext(context.market))
  }
  
  // Portfolio context
  if (context.portfolio) {
    sections.push('\n---\n## Portfolio Summary')
    sections.push(formatPortfolioContext(context.portfolio))
  }
  
  // Terminal context (Terminal Pro page)
  if (context.terminalContext) {
    sections.push('\n---\n## Terminal Pro - Live Market Data')
    const tc = context.terminalContext
    
    if (tc.indices?.length) {
      sections.push('\n### Market Indices')
      tc.indices.forEach(idx => {
        const sign = idx.changePercent >= 0 ? '+' : ''
        sections.push(`- **${idx.name}** (${idx.symbol.replace('^', '')}): $${idx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${sign}${idx.changePercent.toFixed(2)}%)`)
      })
    }
    
    if (tc.sectors?.length) {
      sections.push('\n### Sector Performance')
      tc.sectors.forEach(s => {
        const sign = s.change >= 0 ? '+' : ''
        sections.push(`- **${s.name}**: ${sign}${s.change.toFixed(2)}%`)
      })
    }
    
    if (tc.topGainers?.length) {
      sections.push('\n### Top Gainers')
      tc.topGainers.forEach(g => {
        sections.push(`- **${g.symbol}** (${g.name}): $${g.price.toFixed(2)} (+${g.changePercent.toFixed(2)}%)`)
      })
    }
    
    if (tc.topLosers?.length) {
      sections.push('\n### Top Losers')
      tc.topLosers.forEach(l => {
        sections.push(`- **${l.symbol}** (${l.name}): $${l.price.toFixed(2)} (${l.changePercent.toFixed(2)}%)`)
      })
    }
    
    if (tc.news?.length) {
      sections.push('\n### Latest Headlines')
      tc.news.forEach(n => {
        sections.push(`- ${n.headline} (${n.time})`)
      })
    }
  }
  
  // Economic Indicators context
  if (context.economicIndicators) {
    sections.push('\n---\n## Economic Indicators')
    const econ = context.economicIndicators
    
    const indicators: string[] = []
    
    if (econ.gdp?.value !== null && econ.gdp?.value !== undefined) {
      const change = econ.gdp.change ? ` (${econ.gdp.change >= 0 ? '+' : ''}${econ.gdp.change.toFixed(1)} from prev)` : ''
      indicators.push(`- **GDP Growth**: ${econ.gdp.value.toFixed(1)}%${change}`)
    }
    
    if (econ.unemployment?.value !== null && econ.unemployment?.value !== undefined) {
      const change = econ.unemployment.change ? ` (${econ.unemployment.change >= 0 ? '+' : ''}${econ.unemployment.change.toFixed(1)} from prev)` : ''
      indicators.push(`- **Unemployment Rate**: ${econ.unemployment.value.toFixed(1)}%${change}`)
    }
    
    if (econ.inflation?.value !== null && econ.inflation?.value !== undefined) {
      const change = econ.inflation.change ? ` (${econ.inflation.change >= 0 ? '+' : ''}${econ.inflation.change.toFixed(1)} from prev)` : ''
      indicators.push(`- **Inflation (CPI YoY)**: ${econ.inflation.value.toFixed(1)}%${change}`)
    }
    
    if (econ.federalFundsRate?.value !== null && econ.federalFundsRate?.value !== undefined) {
      indicators.push(`- **Federal Funds Rate**: ${econ.federalFundsRate.value.toFixed(2)}%`)
    }
    
    if (econ.consumerConfidence?.value !== null && econ.consumerConfidence?.value !== undefined) {
      const change = econ.consumerConfidence.change ? ` (${econ.consumerConfidence.change >= 0 ? '+' : ''}${econ.consumerConfidence.change.toFixed(1)} from prev)` : ''
      indicators.push(`- **Consumer Confidence Index**: ${econ.consumerConfidence.value.toFixed(1)}${change}`)
    }
    
    if (econ.manufacturingPmi?.value !== null && econ.manufacturingPmi?.value !== undefined) {
      const status = econ.manufacturingPmi.value >= 50 ? 'Expansion' : 'Contraction'
      const change = econ.manufacturingPmi.change ? ` (${econ.manufacturingPmi.change >= 0 ? '+' : ''}${econ.manufacturingPmi.change.toFixed(1)})` : ''
      indicators.push(`- **Manufacturing PMI**: ${econ.manufacturingPmi.value.toFixed(1)} [${status}]${change}`)
    }
    
    if (econ.servicesPmi?.value !== null && econ.servicesPmi?.value !== undefined) {
      const status = econ.servicesPmi.value >= 50 ? 'Expansion' : 'Contraction'
      const change = econ.servicesPmi.change ? ` (${econ.servicesPmi.change >= 0 ? '+' : ''}${econ.servicesPmi.change.toFixed(1)})` : ''
      indicators.push(`- **Services PMI**: ${econ.servicesPmi.value.toFixed(1)} [${status}]${change}`)
    }
    
    if (indicators.length > 0) {
      sections.push(indicators.join('\n'))
    } else {
      sections.push('No economic indicator data available')
    }
  }
  
  // News context (News page)
  if (context.newsContext) {
    sections.push('\n---\n## Market News')
    const nc = context.newsContext
    
    if (nc.sentimentBreakdown) {
      const total = nc.sentimentBreakdown.bullish + nc.sentimentBreakdown.bearish + nc.sentimentBreakdown.neutral
      sections.push(`**Sentiment Overview**: Bullish: ${nc.sentimentBreakdown.bullish}/${total} | Bearish: ${nc.sentimentBreakdown.bearish}/${total} | Neutral: ${nc.sentimentBreakdown.neutral}/${total}`)
    }
    
    if (nc.recentNews?.length) {
      sections.push('\n### Recent News Headlines')
      nc.recentNews.forEach(news => {
        const sentimentEmoji = news.sentiment === 'bullish' ? '🟢' : news.sentiment === 'bearish' ? '🔴' : '⚪'
        const symbolTag = news.symbol ? ` [${news.symbol}]` : ''
        sections.push(`- ${sentimentEmoji} **${news.headline}**${symbolTag} (${news.category}, ${news.timeAgo})`)
        sections.push(`  ${news.summary.substring(0, 150)}${news.summary.length > 150 ? '...' : ''}`)
      })
    }
  }
  
  // Page context
  if (context.pageContext) {
    const pageInfo: string[] = []
    if (context.pageContext.currentPage) {
      pageInfo.push(`Page: ${context.pageContext.currentPage}`)
    }
    if (context.pageContext.selectedTimeframe) {
      pageInfo.push(`Timeframe: ${context.pageContext.selectedTimeframe}`)
    }
    if (context.pageContext.selectedMetricCategory) {
      pageInfo.push(`Viewing: ${context.pageContext.selectedMetricCategory} metrics`)
    }
    if (pageInfo.length) {
      sections.push('\n---\n## Current View')
      sections.push(pageInfo.join(' | '))
    }
  }
  
  return sections.join('\n')
}

/**
 * Determine the best prompt context based on available data
 */
export function inferPromptContext(context: AIContext, userMessage?: string): PromptContext {
  // If explicitly set, use that
  if (context.type && context.type !== 'general') {
    return context.type
  }
  
  // Infer from user message keywords
  if (userMessage) {
    const msg = userMessage.toLowerCase()
    
    if (msg.includes('portfolio') || msg.includes('holdings') || msg.includes('allocation')) {
      return 'portfolio'
    }
    if (msg.includes('market') || msg.includes('indices') || msg.includes('s&p') || msg.includes('dow')) {
      return 'market'
    }
    if (msg.includes('technical') || msg.includes('chart') || msg.includes('support') || msg.includes('resistance') || msg.includes('rsi')) {
      return 'technical'
    }
    if (msg.includes('news') || msg.includes('headline') || msg.includes('announcement')) {
      return 'news'
    }
    if (msg.includes('what is') || msg.includes('explain') || msg.includes('metric') || msg.includes('ratio')) {
      if (context.stock) return 'metric'
    }
  }
  
  // Infer from available context
  if (context.stock && !context.portfolio && !context.market) {
    return 'stock'
  }
  if (context.portfolio && !context.stock) {
    return 'portfolio'
  }
  if (context.market && !context.stock) {
    return 'market'
  }
  if (context.newsContext) {
    return 'news'
  }
  if (context.terminalContext) {
    return 'market'
  }
  
  return 'general'
}

/**
 * Build the complete context for AI including user message context hints
 */
export function buildFullContext(
  context: AIContext,
  userMessage?: string
): {
  promptContext: PromptContext
  contextString: string
  chatContext: ChatContext
} {
  const promptContext = inferPromptContext(context, userMessage)
  const contextString = buildContextString(context)
  
  // Build ChatContext for storage
  const chatContext: ChatContext = {
    symbols: context.stock ? [context.stock.symbol] : undefined,
    metrics: context.stock?.metrics 
      ? Object.keys(context.stock.metrics).filter(k => context.stock?.metrics?.[k as keyof StockMetrics] !== undefined)
      : undefined,
    timeframe: context.pageContext?.selectedTimeframe,
  }
  
  return {
    promptContext,
    contextString,
    chatContext,
  }
}
