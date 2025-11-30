/**
 * AI Comparison Analysis
 * 
 * Generates intelligent comparisons between multiple stocks.
 * Provides pros/cons, relative strengths, and investment style matching.
 */

import { buildContextSystemPrompt } from './context-prompts';
import type { StockContext } from './context-builder';
import { triggerCreditRefresh } from '@/lib/hooks/use-credits';

// ============================================================
// TYPES
// ============================================================

export interface ComparisonAnalysis {
  summary: string;
  winner?: {
    symbol: string;
    reason: string;
  };
  stockAnalyses: StockAnalysis[];
  relativeComparison: string;
  investorTypeMatch: InvestorTypeMatch[];
  keyDifferences: string[];
  considerations: string[];
  generatedAt: string;
}

export interface StockAnalysis {
  symbol: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string;
  concernFlags: string[];
}

export interface InvestorTypeMatch {
  type: 'value' | 'growth' | 'dividend' | 'momentum' | 'quality';
  bestFit: string; // stock symbol
  reasoning: string;
}

// ============================================================
// CACHE MANAGEMENT
// ============================================================

const comparisonCache = new Map<string, ComparisonAnalysis>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  analysis: ComparisonAnalysis;
  timestamp: number;
}

const comparisonCacheWithTTL = new Map<string, CacheEntry>();

function getCacheKey(symbols: string[]): string {
  return symbols.sort().join(',');
}

function getCachedComparison(symbols: string[]): ComparisonAnalysis | null {
  const key = getCacheKey(symbols);
  const entry = comparisonCacheWithTTL.get(key);
  
  if (!entry) return null;
  
  const age = Date.now() - entry.timestamp;
  if (age > CACHE_TTL) {
    comparisonCacheWithTTL.delete(key);
    return null;
  }
  
  return entry.analysis;
}

function setCachedComparison(symbols: string[], analysis: ComparisonAnalysis) {
  const key = getCacheKey(symbols);
  comparisonCacheWithTTL.set(key, {
    analysis,
    timestamp: Date.now(),
  });
}

export function clearComparisonCache(symbols?: string[]) {
  if (symbols) {
    const key = getCacheKey(symbols);
    comparisonCacheWithTTL.delete(key);
  } else {
    comparisonCacheWithTTL.clear();
  }
}

// ============================================================
// PROMPT GENERATION
// ============================================================

function buildComparisonPrompt(stocks: StockContext[]): string {
  const symbols = stocks.map(s => s.symbol).join(', ');
  
  let prompt = `You are a financial analyst comparing stocks for investment decisions.

CRITICAL INSTRUCTIONS:
1. Use ONLY the data provided below - do NOT make up or assume any values
2. Provide balanced analysis - every stock has strengths AND weaknesses
3. Be specific - reference actual numbers from the data
4. Consider different investor types (value, growth, dividend, momentum, quality)
5. Acknowledge limitations - if data is missing, say so

You are comparing ${stocks.length} stocks: ${symbols}

Please provide a comprehensive comparison using this EXACT structure:

## SUMMARY
[2-3 sentence overview comparing these stocks at a high level]

## WINNER
[If there's a clear winner for most investors, state which stock and why in 1-2 sentences. If it depends on investor type, say "It depends on your investment style" and explain briefly]

## INDIVIDUAL ANALYSES

`;

  stocks.forEach((stock, index) => {
    prompt += `### ${stock.symbol}\n`;
    prompt += `**Strengths:** [List 3-5 key strengths based on the data]\n`;
    prompt += `**Weaknesses:** [List 3-5 key weaknesses or concerns based on the data]\n`;
    prompt += `**Best For:** [What type of investor would prefer this stock?]\n`;
    prompt += `**Red Flags:** [Any concerning metrics or missing data points]\n\n`;
  });

  prompt += `## RELATIVE COMPARISON
[Compare the stocks directly on key dimensions: valuation, growth, profitability, financial health, momentum. Use actual numbers.]

## INVESTOR TYPE MATCHING

**Value Investors:** [Which stock is best for value investors and why?]
**Growth Investors:** [Which stock is best for growth investors and why?]
**Dividend Investors:** [Which stock is best for dividend investors and why?]
**Momentum Traders:** [Which stock has best momentum and why?]
**Quality Focused:** [Which stock has best quality metrics and why?]

## KEY DIFFERENCES
[List 4-6 most important differences between these stocks that would affect investment decisions]

## IMPORTANT CONSIDERATIONS
[List 3-5 things investors should consider before choosing, including data limitations or missing information]

---

DATA PROVIDED:

`;

  // Add detailed stock data
  stocks.forEach((stock, index) => {
    prompt += `\n${'='.repeat(50)}\n`;
    prompt += `STOCK ${index + 1}: ${stock.symbol} - ${stock.name}\n`;
    prompt += `${'='.repeat(50)}\n\n`;
    
    if (stock.sector) prompt += `Sector: ${stock.sector}\n`;
    if (stock.industry) prompt += `Industry: ${stock.industry}\n\n`;
    
    // Quote data
    if (stock.quote) {
      prompt += `PRICE DATA:\n`;
      if (stock.quote.price) prompt += `Current Price: $${stock.quote.price}\n`;
      if (stock.quote.change) prompt += `Change: $${stock.quote.change}\n`;
      if (stock.quote.changePercent) prompt += `Change %: ${stock.quote.changePercent}%\n`;
      if (stock.quote.marketCap) prompt += `Market Cap: $${(stock.quote.marketCap / 1e9).toFixed(2)}B\n`;
      if (stock.quote.volume) prompt += `Volume: ${stock.quote.volume.toLocaleString()}\n`;
      prompt += '\n';
    }
    
    // Metrics
    if (stock.metrics) {
      prompt += `FINANCIAL METRICS:\n`;
      
      // Valuation
      prompt += `\nValuation:\n`;
      if (stock.metrics.pe) prompt += `  P/E Ratio: ${stock.metrics.pe}\n`;
      if (stock.metrics.forwardPE) prompt += `  Forward P/E: ${stock.metrics.forwardPE}\n`;
      if (stock.metrics.pb) prompt += `  P/B Ratio: ${stock.metrics.pb}\n`;
      if (stock.metrics.ps) prompt += `  P/S Ratio: ${stock.metrics.ps}\n`;
      if (stock.metrics.evToEbitda) prompt += `  EV/EBITDA: ${stock.metrics.evToEbitda}\n`;
      
      // Profitability
      prompt += `\nProfitability:\n`;
      if (stock.metrics.roe !== undefined) prompt += `  ROE: ${(stock.metrics.roe * 100).toFixed(2)}%\n`;
      if (stock.metrics.roa !== undefined) prompt += `  ROA: ${(stock.metrics.roa * 100).toFixed(2)}%\n`;
      if (stock.metrics.roic !== undefined) prompt += `  ROIC: ${(stock.metrics.roic * 100).toFixed(2)}%\n`;
      if (stock.metrics.grossMargin !== undefined) prompt += `  Gross Margin: ${(stock.metrics.grossMargin * 100).toFixed(2)}%\n`;
      if (stock.metrics.operatingMargin !== undefined) prompt += `  Operating Margin: ${(stock.metrics.operatingMargin * 100).toFixed(2)}%\n`;
      if (stock.metrics.netMargin !== undefined) prompt += `  Net Margin: ${(stock.metrics.netMargin * 100).toFixed(2)}%\n`;
      
      // Growth
      prompt += `\nGrowth:\n`;
      if (stock.metrics.revenueGrowth !== undefined) prompt += `  Revenue Growth: ${(stock.metrics.revenueGrowth * 100).toFixed(2)}%\n`;
      if (stock.metrics.earningsGrowth !== undefined) prompt += `  Earnings Growth: ${(stock.metrics.earningsGrowth * 100).toFixed(2)}%\n`;
      
      // Financial Health
      prompt += `\nFinancial Health:\n`;
      if (stock.metrics.debtToEquity !== undefined) prompt += `  Debt/Equity: ${stock.metrics.debtToEquity}\n`;
      if (stock.metrics.currentRatio !== undefined) prompt += `  Current Ratio: ${stock.metrics.currentRatio}\n`;
      if (stock.metrics.quickRatio !== undefined) prompt += `  Quick Ratio: ${stock.metrics.quickRatio}\n`;
      
      // Dividends
      prompt += `\nDividends:\n`;
      if (stock.metrics.dividendYield !== undefined) prompt += `  Dividend Yield: ${(stock.metrics.dividendYield * 100).toFixed(2)}%\n`;
      if (stock.metrics.payoutRatio !== undefined) prompt += `  Payout Ratio: ${(stock.metrics.payoutRatio * 100).toFixed(2)}%\n`;
      
      // Technical
      prompt += `\nTechnical Indicators:\n`;
      if (stock.metrics.rsi) prompt += `  RSI (14): ${stock.metrics.rsi}\n`;
      if (stock.metrics.beta) prompt += `  Beta: ${stock.metrics.beta}\n`;
      
      // Quality Scores (if available from metrics library)
      // Note: These would come from calculated metrics, not direct API
    }
    
    prompt += '\n';
  });

  prompt += '\n\nRemember: Base your analysis ONLY on the data above. Be specific, balanced, and acknowledge any data limitations.';

  return prompt;
}

// ============================================================
// COMPARISON GENERATION
// ============================================================

export async function compareStocks(
  stocks: StockContext[],
  options: {
    useCache?: boolean;
  } = {}
): Promise<ComparisonAnalysis> {
  const { useCache = true } = options;

  if (stocks.length < 2) {
    throw new Error('Need at least 2 stocks to compare');
  }

  if (stocks.length > 5) {
    throw new Error('Cannot compare more than 5 stocks at once');
  }

  const symbols = stocks.map(s => s.symbol);

  // Check cache
  if (useCache) {
    const cached = getCachedComparison(symbols);
    if (cached) {
      return cached;
    }
  }

  try {
    const prompt = buildComparisonPrompt(stocks);

    // Call OpenRouter API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false,
        context: {
          type: 'comparison',
          stocks,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content || data.message?.content || '';

    // Refresh credit balance after API call
    triggerCreditRefresh();

    // Parse response
    const analysis = parseComparison(symbols, content);

    // Cache result
    if (useCache) {
      setCachedComparison(symbols, analysis);
    }

    return analysis;
  } catch (error) {
    console.error('Error comparing stocks:', error);
    throw new Error('Failed to generate comparison. Please try again.');
  }
}

// ============================================================
// RESPONSE PARSING
// ============================================================

function parseComparison(symbols: string[], content: string): ComparisonAnalysis {
  return {
    summary: extractSection(content, 'SUMMARY'),
    winner: extractWinner(content, symbols),
    stockAnalyses: extractStockAnalyses(content, symbols),
    relativeComparison: extractSection(content, 'RELATIVE COMPARISON'),
    investorTypeMatch: extractInvestorMatches(content),
    keyDifferences: extractList(content, 'KEY DIFFERENCES'),
    considerations: extractList(content, 'IMPORTANT CONSIDERATIONS'),
    generatedAt: new Date().toISOString(),
  };
}

function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`##\\s*${sectionName}\\s*\\n([^#]+)`, 'i');
  const match = content.match(regex);
  
  if (match && match[1]) {
    return match[1].trim();
  }

  return 'Information not available.';
}

function extractWinner(content: string, symbols: string[]): { symbol: string; reason: string } | undefined {
  const winnerSection = extractSection(content, 'WINNER');
  
  // Look for a symbol mentioned
  for (const symbol of symbols) {
    if (winnerSection.toLowerCase().includes(symbol.toLowerCase())) {
      return {
        symbol,
        reason: winnerSection,
      };
    }
  }
  
  return undefined;
}

function extractStockAnalyses(content: string, symbols: string[]): StockAnalysis[] {
  const analyses: StockAnalysis[] = [];
  
  for (const symbol of symbols) {
    const regex = new RegExp(`###\\s*${symbol}([^#]+)`, 'i');
    const match = content.match(regex);
    
    if (match && match[1]) {
      const section = match[1];
      
      analyses.push({
        symbol,
        strengths: extractBulletPoints(section, 'Strengths'),
        weaknesses: extractBulletPoints(section, 'Weaknesses'),
        bestFor: extractFieldValue(section, 'Best For'),
        concernFlags: extractBulletPoints(section, 'Red Flags'),
      });
    }
  }
  
  return analyses;
}

function extractInvestorMatches(content: string): InvestorTypeMatch[] {
  const types: Array<InvestorTypeMatch['type']> = ['value', 'growth', 'dividend', 'momentum', 'quality'];
  const matches: InvestorTypeMatch[] = [];
  
  for (const type of types) {
    const pattern = new RegExp(`\\*\\*${type}[^:]*:\\*\\*\\s*([^\\n]+)`, 'i');
    const match = content.match(pattern);
    
    if (match && match[1]) {
      // Try to extract symbol from the text
      const text = match[1];
      const symbolMatch = text.match(/\b([A-Z]{1,5})\b/);
      
      matches.push({
        type,
        bestFit: symbolMatch ? symbolMatch[1] : '',
        reasoning: text.trim(),
      });
    }
  }
  
  return matches;
}

function extractBulletPoints(text: string, label: string): string[] {
  const regex = new RegExp(`\\*\\*${label}:\\*\\*([^*]+)`, 'i');
  const match = text.match(regex);
  
  if (!match || !match[1]) return [];
  
  const section = match[1];
  const points: string[] = [];
  
  // Look for list items (-, *, numbers)
  const lines = section.split('\n');
  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned.match(/^[-*•]\s+/) || cleaned.match(/^\d+\.\s+/)) {
      points.push(cleaned.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim());
    }
  }
  
  return points;
}

function extractFieldValue(text: string, label: string): string {
  const regex = new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n*]+)`, 'i');
  const match = text.match(regex);
  return match && match[1] ? match[1].trim() : 'Not specified';
}

function extractList(content: string, sectionName: string): string[] {
  const section = extractSection(content, sectionName);
  const points: string[] = [];
  
  const lines = section.split('\n');
  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned.match(/^[-*•]\s+/) || cleaned.match(/^\d+\.\s+/)) {
      points.push(cleaned.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim());
    }
  }
  
  return points;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get cache status for comparison
 */
export function getComparisonCacheStatus(symbols: string[]): {
  cached: boolean;
  age?: number;
} {
  const key = getCacheKey(symbols);
  const entry = comparisonCacheWithTTL.get(key);
  
  if (!entry) {
    return { cached: false };
  }
  
  return {
    cached: true,
    age: Date.now() - entry.timestamp,
  };
}

/**
 * Check if comparison is cached
 */
export function hasComparison(symbols: string[]): boolean {
  return getCachedComparison(symbols) !== null;
}

/**
 * Quick comparison for 2 stocks (simplified)
 */
export async function quickCompare(
  stock1: StockContext,
  stock2: StockContext
): Promise<string> {
  const analysis = await compareStocks([stock1, stock2]);
  
  return `${analysis.summary}\n\n${analysis.winner ? `Winner: ${analysis.winner.symbol} - ${analysis.winner.reason}` : analysis.relativeComparison}`;
}
