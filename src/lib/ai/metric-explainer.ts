/**
 * AI Metric Explainer
 * 
 * Provides simple, clear explanations of financial metrics.
 * Uses real-world examples and explains why metrics matter.
 */

import { buildContextSystemPrompt } from './context-prompts';
import type { StockContext } from './context-builder';

// ============================================================
// TYPES
// ============================================================

export interface MetricExplanation {
  metricName: string;
  definition: string;
  calculation?: string;
  interpretation: string;
  whyItMatters: string;
  example: string;
  goodRange?: string;
  limitations: string;
  generatedAt: string;
}

interface MetricContext {
  metricName: string;
  currentValue?: number | null;
  stock?: StockContext;
}

// ============================================================
// CACHE MANAGEMENT
// ============================================================

const explanationCache = new Map<string, MetricExplanation>();

function getCacheKey(metricName: string, stockSymbol?: string): string {
  return stockSymbol ? `${metricName}:${stockSymbol}` : metricName;
}

function getCachedExplanation(metricName: string, stockSymbol?: string): MetricExplanation | null {
  const key = getCacheKey(metricName, stockSymbol);
  return explanationCache.get(key) || null;
}

function setCachedExplanation(explanation: MetricExplanation, stockSymbol?: string) {
  const key = getCacheKey(explanation.metricName, stockSymbol);
  explanationCache.set(key, explanation);
}

export function clearExplanationCache(metricName?: string, stockSymbol?: string) {
  if (metricName) {
    const key = getCacheKey(metricName, stockSymbol);
    explanationCache.delete(key);
  } else {
    explanationCache.clear();
  }
}

// ============================================================
// PROMPT GENERATION
// ============================================================

function buildExplainerPrompt(context: MetricContext): string {
  const { metricName, currentValue, stock } = context;

  let prompt = `You are a financial educator explaining investment metrics in simple, clear terms.

CRITICAL INSTRUCTIONS:
1. Explain concepts using simple language first, then introduce technical terms
2. Use real-world analogies to make concepts relatable
3. ${currentValue !== undefined && currentValue !== null ? `Reference the actual value of ${currentValue} when relevant` : 'Provide general explanations without specific values'}
4. ${stock ? `When discussing ${stock.symbol}, use ONLY the data provided about this stock` : 'Give general examples'}
5. Be concise - aim for clarity over comprehensiveness

Please explain the "${metricName}" metric using this EXACT structure:

## DEFINITION
[One clear sentence defining what this metric is]

## CALCULATION
[How is this metric calculated? Write the formula in plain English, then show the mathematical formula if applicable]

## INTERPRETATION
[What do different values mean? What's considered good vs bad? Include typical ranges for different industries if relevant]

## WHY IT MATTERS
[Why should investors care about this metric? What decisions does it help with?]

## EXAMPLE
[Provide a real-world example or analogy that makes this concept easy to understand. ${currentValue !== undefined && currentValue !== null ? `Use the actual value of ${currentValue} if helpful` : 'Use relatable numbers'}]

## LIMITATIONS
[When is this metric NOT useful? What are its weaknesses? When might it be misleading?]

`;

  if (stock) {
    prompt += `\n\nCONTEXT - ${stock.symbol} DATA:\n`;
    
    if (stock.sector) prompt += `Sector: ${stock.sector}\n`;
    if (stock.industry) prompt += `Industry: ${stock.industry}\n`;
    
    if (stock.metrics) {
      prompt += '\nAvailable Metrics:\n';
      Object.entries(stock.metrics).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          prompt += `${key}: ${value}\n`;
        }
      });
    }
  }

  prompt += '\n\nRemember: Use simple language, provide concrete examples, and acknowledge limitations.';

  return prompt;
}

// ============================================================
// EXPLANATION GENERATION
// ============================================================

export async function explainMetric(
  metricName: string,
  options: {
    currentValue?: number | null;
    stock?: StockContext;
    useCache?: boolean;
  } = {}
): Promise<MetricExplanation> {
  const { currentValue, stock, useCache = true } = options;

  // Check cache
  if (useCache) {
    const cached = getCachedExplanation(metricName, stock?.symbol);
    if (cached) {
      return cached;
    }
  }

  try {
    const prompt = buildExplainerPrompt({ metricName, currentValue, stock });

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
          type: 'metric',
          stock,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content || data.message?.content || '';

    // Parse response
    const explanation = parseExplanation(metricName, content);

    // Cache result
    if (useCache) {
      setCachedExplanation(explanation, stock?.symbol);
    }

    return explanation;
  } catch (error) {
    console.error('Error explaining metric:', error);
    throw new Error('Failed to generate explanation. Please try again.');
  }
}

// ============================================================
// RESPONSE PARSING
// ============================================================

function parseExplanation(metricName: string, content: string): MetricExplanation {
  return {
    metricName,
    definition: extractSection(content, 'DEFINITION'),
    calculation: extractSection(content, 'CALCULATION'),
    interpretation: extractSection(content, 'INTERPRETATION'),
    whyItMatters: extractSection(content, 'WHY IT MATTERS'),
    example: extractSection(content, 'EXAMPLE'),
    limitations: extractSection(content, 'LIMITATIONS'),
    goodRange: extractGoodRange(content),
    generatedAt: new Date().toISOString(),
  };
}

function extractSection(content: string, sectionName: string): string {
  // Try to find section with ## header
  const regex = new RegExp(`##\\s*${sectionName}\\s*\\n([^#]+)`, 'i');
  const match = content.match(regex);
  
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback
  return 'Information not available.';
}

function extractGoodRange(content: string): string | undefined {
  // Look for common patterns indicating "good" ranges
  const rangePatterns = [
    /good(?:.*?):\s*([^\n.]+)/i,
    /healthy(?:.*?):\s*([^\n.]+)/i,
    /typical(?:ly)?(?:.*?):\s*([^\n.]+)/i,
    /range(?:.*?):\s*([^\n.]+)/i,
  ];

  for (const pattern of rangePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

// ============================================================
// COMMON METRICS WITH QUICK EXPLANATIONS
// ============================================================

/**
 * Quick explanation templates for common metrics
 * Used when AI explanation fails or for instant tooltips
 */
export const QUICK_EXPLANATIONS: Record<string, string> = {
  'peRatio': 'Price-to-Earnings ratio shows how much investors are paying for each dollar of earnings. Lower is generally cheaper.',
  'pbRatio': 'Price-to-Book ratio compares stock price to book value. Useful for value investing.',
  'psRatio': 'Price-to-Sales ratio shows valuation relative to revenue. Useful for growth stocks.',
  'roe': 'Return on Equity measures how efficiently a company uses shareholder equity to generate profit.',
  'roa': 'Return on Assets shows how efficiently a company uses its assets to generate profit.',
  'roic': 'Return on Invested Capital measures returns generated from all capital invested in the business.',
  'debtToEquity': 'Debt-to-Equity ratio shows how much debt a company has relative to shareholder equity.',
  'currentRatio': 'Current Ratio measures ability to pay short-term obligations. Above 1.0 is generally good.',
  'quickRatio': 'Quick Ratio is like Current Ratio but excludes inventory. More conservative liquidity measure.',
  'grossMargin': 'Gross Margin shows profit after cost of goods sold. Higher is better.',
  'operatingMargin': 'Operating Margin shows profit after operating expenses. Indicates operational efficiency.',
  'netMargin': 'Net Margin shows bottom-line profit as percentage of revenue. Higher is better.',
  'revenueGrowth': 'Revenue Growth shows how fast sales are increasing year-over-year.',
  'epsGrowth': 'EPS Growth shows how fast earnings per share are increasing year-over-year.',
  'dividendYield': 'Dividend Yield shows annual dividend as percentage of stock price.',
  'payoutRatio': 'Payout Ratio shows what percentage of earnings is paid as dividends.',
  'rsi': 'RSI (Relative Strength Index) measures momentum. Above 70 is overbought, below 30 is oversold.',
  'beta': 'Beta measures volatility compared to the market. 1.0 = same as market, >1.0 = more volatile.',
  'marketCap': 'Market Capitalization is total value of all shares. Market cap = share price × shares outstanding.',
  'evToEbitda': 'EV/EBITDA shows enterprise value relative to earnings before interest, taxes, depreciation & amortization.',
  'freeCashFlow': 'Free Cash Flow is cash generated after capital expenditures. Available for dividends, buybacks, or growth.',
  'piotroskiScore': 'Piotroski F-Score (0-9) measures financial strength. 8-9 is very strong, 0-2 is weak.',
  'altmanZ': 'Altman Z-Score predicts bankruptcy risk. >3.0 is safe, <1.8 is distress zone.',
};

/**
 * Get a quick tooltip explanation
 */
export function getQuickExplanation(metricKey: string): string {
  return QUICK_EXPLANATIONS[metricKey] || 'Financial metric used in analysis.';
}

/**
 * Check if metric has cached explanation
 */
export function hasExplanation(metricName: string, stockSymbol?: string): boolean {
  return getCachedExplanation(metricName, stockSymbol) !== null;
}

/**
 * Batch explain multiple metrics
 */
export async function batchExplainMetrics(
  metricNames: string[],
  options: {
    stock?: StockContext;
    concurrency?: number;
  } = {}
): Promise<Map<string, MetricExplanation | Error>> {
  const { stock, concurrency = 2 } = options;
  const results = new Map<string, MetricExplanation | Error>();

  for (let i = 0; i < metricNames.length; i += concurrency) {
    const batch = metricNames.slice(i, i + concurrency);
    
    const batchResults = await Promise.allSettled(
      batch.map(name => explainMetric(name, { stock, useCache: true }))
    );

    batchResults.forEach((result, index) => {
      const metricName = batch[index];
      if (result.status === 'fulfilled') {
        results.set(metricName, result.value);
      } else {
        results.set(metricName, result.reason);
      }
    });

    // Small delay between batches
    if (i + concurrency < metricNames.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}
