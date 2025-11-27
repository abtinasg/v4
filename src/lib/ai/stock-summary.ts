/**
 * AI Stock Summary Generator
 * 
 * Generates comprehensive stock analysis summaries based on provided data.
 * Uses only real data from Yahoo Finance and our metrics library.
 * Caches results for 1 hour to reduce API costs.
 */

import type { StockContext } from './context-builder';
import { buildContextSystemPrompt } from './context-prompts';

// ============================================================
// TYPES
// ============================================================

export interface StockSummary {
  symbol: string;
  generatedAt: string;
  sections: {
    businessOverview: string;
    recentPerformance: string;
    valuationAssessment: string;
    risksAndOpportunities: string;
    technicalSetup: string;
  };
  keyTakeaways: string[];
  disclaimer: string;
}

interface GenerateOptions {
  useCache?: boolean;
  cacheTTL?: number; // in milliseconds
}

// ============================================================
// CACHE MANAGEMENT
// ============================================================

interface CacheEntry {
  summary: StockSummary;
  expiresAt: number;
}

const summaryCache = new Map<string, CacheEntry>();

function getCachedSummary(symbol: string): StockSummary | null {
  const entry = summaryCache.get(symbol);
  if (!entry) return null;
  
  const now = Date.now();
  if (now > entry.expiresAt) {
    summaryCache.delete(symbol);
    return null;
  }
  
  return entry.summary;
}

function setCachedSummary(symbol: string, summary: StockSummary, ttl: number) {
  summaryCache.set(symbol, {
    summary,
    expiresAt: Date.now() + ttl,
  });
}

export function clearSummaryCache(symbol?: string) {
  if (symbol) {
    summaryCache.delete(symbol);
  } else {
    summaryCache.clear();
  }
}

// ============================================================
// PROMPT GENERATION
// ============================================================

function buildSummaryPrompt(stock: StockContext): string {
  const systemPrompt = buildContextSystemPrompt({
    type: 'stock-analysis',
    stock,
  });

  const userPrompt = `Generate a comprehensive stock analysis summary for ${stock.symbol}.

Structure your response EXACTLY as follows (use these exact section headers):

## BUSINESS OVERVIEW
[Write 2-3 sentences about the company's business model, sector position, and what they do. Use the description and sector/industry data provided.]

## RECENT PERFORMANCE
[Write 2-3 sentences about recent price movement, volume trends, and key metrics. Reference the specific price data and changes provided.]

## VALUATION ASSESSMENT
[Write 2-3 sentences about whether the stock appears expensive or cheap based on P/E, P/B, and other valuation metrics provided. Compare to typical ranges for the sector if possible.]

## RISKS AND OPPORTUNITIES
[Write 2-3 sentences covering both the main risks (high debt, slowing growth, etc.) and opportunities (strong margins, growth potential, etc.) based on the metrics provided.]

## TECHNICAL SETUP
[Write 2-3 sentences about the technical picture: trend, moving averages, RSI levels, support/resistance. Only use the technical data provided.]

## KEY TAKEAWAYS
[Provide 3-4 bullet points summarizing the most important insights]

CRITICAL RULES:
- ONLY use the data provided in the context above
- Cite specific numbers from the data (e.g., "with a P/E of 25.3")
- If a data point is missing, skip that analysis, don't guess
- Be balanced: mention both positives and negatives
- Keep each section to 2-3 sentences maximum
- End with the standard disclaimer`;

  return `${systemPrompt}\n\n---\n\n${userPrompt}`;
}

// ============================================================
// SUMMARY GENERATION
// ============================================================

export async function generateStockSummary(
  stock: StockContext,
  options: GenerateOptions = {}
): Promise<StockSummary> {
  const { useCache = true, cacheTTL = 60 * 60 * 1000 } = options; // 1 hour default

  // Check cache first
  if (useCache) {
    const cached = getCachedSummary(stock.symbol);
    if (cached) {
      return cached;
    }
  }

  // Generate new summary
  try {
    const prompt = buildSummaryPrompt(stock);
    
    // Call OpenRouter API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: `Generate the stock analysis summary for ${stock.symbol} now.`,
          },
        ],
        stream: false,
        context: {
          type: 'stock',
          stock,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content || data.message?.content || '';

    // Parse the response into sections
    const summary = parseAISummary(stock.symbol, content);

    // Cache the result
    if (useCache) {
      setCachedSummary(stock.symbol, summary, cacheTTL);
    }

    return summary;
  } catch (error) {
    console.error('Error generating stock summary:', error);
    throw new Error('Failed to generate stock summary. Please try again.');
  }
}

// ============================================================
// RESPONSE PARSING
// ============================================================

function parseAISummary(symbol: string, content: string): StockSummary {
  const sections = {
    businessOverview: extractSection(content, 'BUSINESS OVERVIEW'),
    recentPerformance: extractSection(content, 'RECENT PERFORMANCE'),
    valuationAssessment: extractSection(content, 'VALUATION ASSESSMENT'),
    risksAndOpportunities: extractSection(content, 'RISKS AND OPPORTUNITIES'),
    technicalSetup: extractSection(content, 'TECHNICAL SETUP'),
  };

  const keyTakeaways = extractKeyTakeaways(content);

  return {
    symbol,
    generatedAt: new Date().toISOString(),
    sections,
    keyTakeaways,
    disclaimer: '⚠️ This AI-generated analysis is for educational purposes only and should not be considered financial advice. Always conduct your own research and consult with qualified financial advisors before making investment decisions.',
  };
}

function extractSection(content: string, sectionName: string): string {
  // Try to find section with ## header
  const regex = new RegExp(`##\\s*${sectionName}\\s*\\n([^#]+)`, 'i');
  const match = content.match(regex);
  
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback: try without ## header
  const lines = content.split('\n');
  const sectionIndex = lines.findIndex(line => 
    line.toLowerCase().includes(sectionName.toLowerCase())
  );

  if (sectionIndex !== -1) {
    // Get text until next section or end
    const nextSectionIndex = lines.findIndex((line, idx) => 
      idx > sectionIndex && line.match(/^##\s+[A-Z]/)
    );
    
    const endIndex = nextSectionIndex !== -1 ? nextSectionIndex : lines.length;
    const sectionContent = lines.slice(sectionIndex + 1, endIndex).join('\n').trim();
    
    return sectionContent;
  }

  return 'Analysis not available for this section.';
}

function extractKeyTakeaways(content: string): string[] {
  const takeaways: string[] = [];
  
  // Find the key takeaways section
  const regex = /##\s*KEY TAKEAWAYS\s*\n([\s\S]+?)(?=##|$)/i;
  const match = content.match(regex);
  
  if (match && match[1]) {
    const takeawaySection = match[1];
    
    // Extract bullet points (-, *, •, or numbered)
    const bulletRegex = /(?:^|\n)\s*(?:[-*•]|\d+\.)\s*(.+)/g;
    let bulletMatch;
    
    while ((bulletMatch = bulletRegex.exec(takeawaySection)) !== null) {
      if (bulletMatch[1]) {
        takeaways.push(bulletMatch[1].trim());
      }
    }
  }

  // If no takeaways found, return default
  if (takeaways.length === 0) {
    return [
      'Comprehensive analysis based on current financial data',
      'Review all sections for detailed insights',
      'Always verify with additional research',
    ];
  }

  return takeaways.slice(0, 4); // Max 4 takeaways
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Check if summary is available in cache
 */
export function hasCachedSummary(symbol: string): boolean {
  return getCachedSummary(symbol) !== null;
}

/**
 * Get cache status for a symbol
 */
export function getCacheStatus(symbol: string): {
  cached: boolean;
  expiresIn?: number; // milliseconds
} {
  const entry = summaryCache.get(symbol);
  
  if (!entry) {
    return { cached: false };
  }

  const now = Date.now();
  if (now > entry.expiresAt) {
    summaryCache.delete(symbol);
    return { cached: false };
  }

  return {
    cached: true,
    expiresIn: entry.expiresAt - now,
  };
}

/**
 * Pre-generate summary for a symbol (useful for background jobs)
 */
export async function prefetchSummary(stock: StockContext): Promise<void> {
  try {
    await generateStockSummary(stock, { useCache: true });
  } catch (error) {
    console.error(`Failed to prefetch summary for ${stock.symbol}:`, error);
  }
}

/**
 * Batch generate summaries for multiple stocks
 */
export async function batchGenerateSummaries(
  stocks: StockContext[],
  options: { concurrency?: number } = {}
): Promise<Map<string, StockSummary | Error>> {
  const { concurrency = 3 } = options;
  const results = new Map<string, StockSummary | Error>();

  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < stocks.length; i += concurrency) {
    const batch = stocks.slice(i, i + concurrency);
    
    const batchResults = await Promise.allSettled(
      batch.map(stock => generateStockSummary(stock))
    );

    batchResults.forEach((result, index) => {
      const stock = batch[index];
      if (result.status === 'fulfilled') {
        results.set(stock.symbol, result.value);
      } else {
        results.set(stock.symbol, result.reason);
      }
    });

    // Small delay between batches
    if (i + concurrency < stocks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
