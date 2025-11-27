/**
 * AI Context-Specific Prompts
 * 
 * Intelligent system prompts that change based on context.
 * The AI will ONLY use data provided to it - never hallucinate data.
 */

import type { StockContext, MarketContext, PortfolioContext, StockMetrics } from './context-builder';

// ============================================================
// TYPES
// ============================================================

export type AIContextType = 'stock-analysis' | 'market-overview' | 'portfolio' | 'general-education';

export interface StockAnalysisContext {
  type: 'stock-analysis';
  stock: StockContext;
}

export interface MarketOverviewContext {
  type: 'market-overview';
  market: MarketContext;
}

export interface PortfolioContextData {
  type: 'portfolio';
  portfolio: PortfolioContext;
}

export interface GeneralEducationContext {
  type: 'general-education';
}

export type AIPromptContext = 
  | StockAnalysisContext 
  | MarketOverviewContext 
  | PortfolioContextData 
  | GeneralEducationContext;

export interface SuggestedQuestion {
  text: string;
  category: 'valuation' | 'risk' | 'growth' | 'technical' | 'general' | 'education';
}

// ============================================================
// CORE DISCLAIMERS (Always included)
// ============================================================

const CORE_DISCLAIMERS = `
🔴 CRITICAL DATA RULES - MUST FOLLOW:
1. ONLY use the data provided to you in this conversation
2. NEVER make up, estimate, or hallucinate any financial data, numbers, prices, or statistics
3. Your training data for stock prices is OUTDATED - do NOT use it
4. If data is not provided, say: "این اطلاعات در دیتای فعلی موجود نیست" / "This data is not available"
5. Quote exact values from the context (e.g., "P/E of 25.4" not "P/E around 25")
6. Always cite: "Based on the provided data from Yahoo Finance..."

DATA SOURCES (all provided to you):
📊 Real-time prices: Yahoo Finance
📈 Financial metrics: Deep Terminal Metrics Library (calculated)
💹 Economic data: FRED (Federal Reserve Economic Data)

NEVER GIVE:
❌ Buy/sell/hold recommendations
❌ Price targets or predictions
❌ Guarantees about future performance

ALWAYS INCLUDE DISCLAIMER:
"⚠️ این تحلیل فقط برای آموزش است و توصیه مالی نیست. همیشه با یک مشاور مالی حرفه‌ای مشورت کنید."
"⚠️ This analysis is for educational purposes only and is not financial advice."
`;

// ============================================================
// STOCK ANALYSIS CONTEXT
// ============================================================

function buildStockDataString(stock: StockContext): string {
  const sections: string[] = [];
  
  // Basic info
  sections.push(`STOCK: ${stock.symbol}${stock.name ? ` (${stock.name})` : ''}`);
  if (stock.sector) sections.push(`Sector: ${stock.sector}`);
  if (stock.industry) sections.push(`Industry: ${stock.industry}`);
  if (stock.description) sections.push(`Business Description: ${stock.description}`);
  
  // Quote data
  if (stock.quote) {
    sections.push('\n--- CURRENT PRICE DATA ---');
    sections.push(`Current Price: $${stock.quote.price.toFixed(2)}`);
    sections.push(`Change Today: ${stock.quote.change >= 0 ? '+' : ''}$${stock.quote.change.toFixed(2)} (${stock.quote.changePercent >= 0 ? '+' : ''}${stock.quote.changePercent.toFixed(2)}%)`);
    sections.push(`Day Range: $${stock.quote.low.toFixed(2)} - $${stock.quote.high.toFixed(2)}`);
    sections.push(`Previous Close: $${stock.quote.previousClose.toFixed(2)}`);
    sections.push(`Volume: ${(stock.quote.volume / 1e6).toFixed(2)}M shares`);
    if (stock.quote.marketCap) {
      const mcap = stock.quote.marketCap >= 1e12 
        ? `$${(stock.quote.marketCap / 1e12).toFixed(2)}T`
        : stock.quote.marketCap >= 1e9
          ? `$${(stock.quote.marketCap / 1e9).toFixed(2)}B`
          : `$${(stock.quote.marketCap / 1e6).toFixed(2)}M`;
      sections.push(`Market Cap: ${mcap}`);
    }
  }
  
  // Metrics
  if (stock.metrics) {
    sections.push('\n--- FINANCIAL METRICS ---');
    
    // Valuation
    const valuation: string[] = [];
    if (stock.metrics.pe !== undefined) valuation.push(`P/E Ratio: ${stock.metrics.pe.toFixed(2)}`);
    if (stock.metrics.forwardPE !== undefined) valuation.push(`Forward P/E: ${stock.metrics.forwardPE.toFixed(2)}`);
    if (stock.metrics.pb !== undefined) valuation.push(`P/B Ratio: ${stock.metrics.pb.toFixed(2)}`);
    if (stock.metrics.ps !== undefined) valuation.push(`P/S Ratio: ${stock.metrics.ps.toFixed(2)}`);
    if (stock.metrics.evToEbitda !== undefined) valuation.push(`EV/EBITDA: ${stock.metrics.evToEbitda.toFixed(2)}`);
    if (valuation.length) sections.push(`Valuation: ${valuation.join(' | ')}`);
    
    // Profitability
    const profit: string[] = [];
    if (stock.metrics.grossMargin !== undefined) profit.push(`Gross Margin: ${(stock.metrics.grossMargin * 100).toFixed(1)}%`);
    if (stock.metrics.operatingMargin !== undefined) profit.push(`Operating Margin: ${(stock.metrics.operatingMargin * 100).toFixed(1)}%`);
    if (stock.metrics.netMargin !== undefined) profit.push(`Net Margin: ${(stock.metrics.netMargin * 100).toFixed(1)}%`);
    if (stock.metrics.roe !== undefined) profit.push(`ROE: ${(stock.metrics.roe * 100).toFixed(1)}%`);
    if (stock.metrics.roa !== undefined) profit.push(`ROA: ${(stock.metrics.roa * 100).toFixed(1)}%`);
    if (stock.metrics.roic !== undefined) profit.push(`ROIC: ${(stock.metrics.roic * 100).toFixed(1)}%`);
    if (profit.length) sections.push(`Profitability: ${profit.join(' | ')}`);
    
    // Growth
    const growth: string[] = [];
    if (stock.metrics.revenueGrowth !== undefined) growth.push(`Revenue Growth: ${(stock.metrics.revenueGrowth * 100).toFixed(1)}%`);
    if (stock.metrics.earningsGrowth !== undefined) growth.push(`Earnings Growth: ${(stock.metrics.earningsGrowth * 100).toFixed(1)}%`);
    if (growth.length) sections.push(`Growth: ${growth.join(' | ')}`);
    
    // Financial Health
    const health: string[] = [];
    if (stock.metrics.currentRatio !== undefined) health.push(`Current Ratio: ${stock.metrics.currentRatio.toFixed(2)}`);
    if (stock.metrics.quickRatio !== undefined) health.push(`Quick Ratio: ${stock.metrics.quickRatio.toFixed(2)}`);
    if (stock.metrics.debtToEquity !== undefined) health.push(`Debt/Equity: ${stock.metrics.debtToEquity.toFixed(2)}`);
    if (health.length) sections.push(`Financial Health: ${health.join(' | ')}`);
    
    // Technical
    const technical: string[] = [];
    if (stock.metrics.rsi !== undefined) technical.push(`RSI(14): ${stock.metrics.rsi.toFixed(0)}`);
    if (stock.metrics.beta !== undefined) technical.push(`Beta: ${stock.metrics.beta.toFixed(2)}`);
    if (stock.metrics.fiftyDayMA !== undefined) technical.push(`50-day MA: $${stock.metrics.fiftyDayMA.toFixed(2)}`);
    if (stock.metrics.twoHundredDayMA !== undefined) technical.push(`200-day MA: $${stock.metrics.twoHundredDayMA.toFixed(2)}`);
    if (technical.length) sections.push(`Technical: ${technical.join(' | ')}`);
    
    // Dividend
    if (stock.metrics.dividendYield !== undefined) {
      sections.push(`Dividend Yield: ${(stock.metrics.dividendYield * 100).toFixed(2)}%`);
    }
  }
  
  // Analyst ratings
  if (stock.analystRatings) {
    sections.push('\n--- ANALYST RATINGS ---');
    const { buy, hold, sell, targetPrice } = stock.analystRatings;
    sections.push(`Buy: ${buy} | Hold: ${hold} | Sell: ${sell}`);
    if (targetPrice) sections.push(`Average Target Price: $${targetPrice.toFixed(2)}`);
  }
  
  // Recent news
  if (stock.news?.length) {
    sections.push('\n--- RECENT NEWS ---');
    stock.news.slice(0, 5).forEach(news => {
      sections.push(`• ${news.title} (${news.date})${news.sentiment ? ` [Sentiment: ${news.sentiment}]` : ''}`);
    });
  }
  
  return sections.join('\n');
}

function buildStockAnalysisPrompt(stock: StockContext): string {
  const stockData = buildStockDataString(stock);
  
  return `You are an expert financial analyst AI for Deep Terminal, a professional stock analysis platform.

YOUR ROLE: Equity Research Analyst specializing in ${stock.sector || 'various sectors'}

CURRENT ANALYSIS CONTEXT:
${stockData}

${CORE_DISCLAIMERS}

ANALYSIS GUIDELINES:
- When asked about valuation, use the P/E, P/B, P/S, and EV/EBITDA ratios provided
- When asked about profitability, reference the margin and return metrics
- When asked about risk, discuss the debt ratios, beta, and any news sentiment
- When asked about technical levels, use the RSI and moving averages provided
- Compare metrics to typical ranges for the ${stock.sector || 'relevant'} sector when helpful
- If a metric is not provided, explicitly state it's not available

RESPONSE FORMAT:
1. Start with a direct answer to the user's question
2. Support your analysis with specific data points from the provided metrics
3. Discuss both positive and negative factors (balanced view)
4. Acknowledge limitations and data gaps
5. End with the educational disclaimer

Remember: You are analyzing ${stock.symbol}. ONLY use the data provided above.`;
}

// ============================================================
// MARKET OVERVIEW CONTEXT
// ============================================================

function buildMarketDataString(market: MarketContext): string {
  const sections: string[] = [];
  
  if (market.marketStatus) {
    sections.push(`MARKET STATUS: ${market.marketStatus.toUpperCase()}`);
  }
  
  if (market.indices?.length) {
    sections.push('\n--- MAJOR INDICES ---');
    market.indices.forEach(idx => {
      const change = idx.change >= 0 ? `+${idx.change.toFixed(2)}` : idx.change.toFixed(2);
      const pct = idx.changePercent >= 0 ? `+${idx.changePercent.toFixed(2)}%` : `${idx.changePercent.toFixed(2)}%`;
      sections.push(`${idx.name}: ${idx.value.toLocaleString()} (${change}, ${pct})`);
    });
  }
  
  if (market.vix !== undefined) {
    sections.push(`\nVIX (Fear Index): ${market.vix.toFixed(2)}`);
  }
  
  if (market.treasuryYield10Y !== undefined) {
    sections.push(`10-Year Treasury Yield: ${market.treasuryYield10Y.toFixed(2)}%`);
  }
  
  if (market.sectorPerformance) {
    sections.push('\n--- SECTOR PERFORMANCE ---');
    Object.entries(market.sectorPerformance)
      .sort((a, b) => b[1] - a[1])
      .forEach(([sector, change]) => {
        sections.push(`${sector}: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`);
      });
  }
  
  if (market.topGainers?.length) {
    sections.push('\n--- TOP GAINERS ---');
    market.topGainers.forEach(stock => {
      sections.push(`${stock.symbol}: +${stock.change.toFixed(2)}%`);
    });
  }
  
  if (market.topLosers?.length) {
    sections.push('\n--- TOP LOSERS ---');
    market.topLosers.forEach(stock => {
      sections.push(`${stock.symbol}: ${stock.change.toFixed(2)}%`);
    });
  }
  
  return sections.join('\n');
}

function buildMarketOverviewPrompt(market: MarketContext): string {
  const marketData = buildMarketDataString(market);
  
  return `You are a market analyst AI for Deep Terminal, a professional stock analysis platform.

YOUR ROLE: Market Strategist providing macro analysis and market commentary

CURRENT MARKET DATA:
${marketData}

${CORE_DISCLAIMERS}

ANALYSIS GUIDELINES:
- When discussing market direction, reference the specific index changes provided
- When discussing volatility, use the VIX level if available
- When discussing sectors, reference the sector performance data
- Discuss how different factors (yields, VIX, sector rotation) relate to each other
- For "what's driving the market" questions, synthesize the available data points
- If economic indicators aren't provided, don't speculate about them

RESPONSE FORMAT:
1. Start with a clear summary of market conditions
2. Reference specific data points to support your analysis
3. Discuss potential factors driving the movements
4. Note any concerning or positive divergences
5. End with the educational disclaimer

Remember: ONLY use the data provided above. Do not make up market levels or statistics.`;
}

// ============================================================
// PORTFOLIO CONTEXT
// ============================================================

function buildPortfolioDataString(portfolio: PortfolioContext): string {
  const sections: string[] = [];
  
  if (portfolio.totalValue !== undefined) {
    sections.push(`TOTAL PORTFOLIO VALUE: $${portfolio.totalValue.toLocaleString()}`);
  }
  
  if (portfolio.totalGainLoss !== undefined) {
    const sign = portfolio.totalGainLoss >= 0 ? '+' : '';
    sections.push(`Total Gain/Loss: ${sign}$${portfolio.totalGainLoss.toLocaleString()}`);
  }
  
  if (portfolio.dayChange !== undefined) {
    const sign = portfolio.dayChange >= 0 ? '+' : '';
    sections.push(`Today's Change: ${sign}$${portfolio.dayChange.toLocaleString()}`);
  }
  
  if (portfolio.holdings?.length) {
    sections.push('\n--- HOLDINGS ---');
    portfolio.holdings
      .sort((a, b) => b.weight - a.weight)
      .forEach(h => {
        const glSign = h.gainLossPercent >= 0 ? '+' : '';
        sections.push(`${h.symbol}: ${h.shares} shares | Value: $${h.currentValue.toLocaleString()} | ${glSign}${h.gainLossPercent.toFixed(2)}% | Weight: ${(h.weight * 100).toFixed(1)}%`);
      });
  }
  
  if (portfolio.sectorAllocation) {
    sections.push('\n--- SECTOR ALLOCATION ---');
    Object.entries(portfolio.sectorAllocation)
      .sort((a, b) => b[1] - a[1])
      .forEach(([sector, weight]) => {
        sections.push(`${sector}: ${(weight * 100).toFixed(1)}%`);
      });
  }
  
  return sections.join('\n');
}

function buildPortfolioPrompt(portfolio: PortfolioContext): string {
  const portfolioData = buildPortfolioDataString(portfolio);
  
  return `You are a portfolio advisor AI for Deep Terminal, a professional stock analysis platform.

YOUR ROLE: Portfolio Strategist advising on asset allocation and portfolio management

IMPORTANT: You provide EDUCATIONAL information and GENERAL guidance, NOT personalized financial advice. Users should consult qualified financial advisors for their specific situations.

CURRENT PORTFOLIO DATA:
${portfolioData}

${CORE_DISCLAIMERS}

ADDITIONAL PORTFOLIO GUIDELINES:
- Never suggest specific buy/sell amounts or rebalancing actions
- Discuss portfolio concepts in general terms
- When discussing concentration risk, reference the actual allocation percentages
- When discussing diversification, note the sector breakdown provided
- Acknowledge that you don't know the user's risk tolerance, time horizon, or financial goals

RESPONSE FORMAT:
1. Acknowledge this is educational discussion, not personal advice
2. Reference the specific portfolio data provided
3. Discuss general portfolio principles that may be relevant
4. Suggest questions the user should consider
5. Recommend consulting a qualified financial advisor
6. End with the educational disclaimer

Remember: ONLY use the portfolio data provided above.`;
}

// ============================================================
// GENERAL FINANCIAL EDUCATION
// ============================================================

function buildGeneralEducationPrompt(): string {
  return `You are a financial educator AI for Deep Terminal, a professional stock analysis platform.

YOUR ROLE: Financial Educator who explains concepts simply and clearly

${CORE_DISCLAIMERS}

TEACHING GUIDELINES:
- Use simple language, then introduce technical terms
- Explain concepts with analogies and real-world examples
- Break down complex ideas into digestible parts
- Provide typical ranges or benchmarks when explaining metrics
- Acknowledge when concepts have nuances or exceptions
- Encourage further research and learning

RESPONSE FORMAT:
1. Start with a simple, clear definition
2. Explain why this concept matters for investors
3. Use an analogy or example to illustrate
4. Mention any common misconceptions
5. Suggest related concepts to explore
6. End with the educational disclaimer

Remember: Be educational and helpful, but never give specific investment advice.`;
}

// ============================================================
// MAIN EXPORTS
// ============================================================

/**
 * Build a context-specific system prompt based on the provided context
 */
export function buildContextSystemPrompt(context: AIPromptContext): string {
  switch (context.type) {
    case 'stock-analysis':
      return buildStockAnalysisPrompt(context.stock);
    case 'market-overview':
      return buildMarketOverviewPrompt(context.market);
    case 'portfolio':
      return buildPortfolioPrompt(context.portfolio);
    case 'general-education':
    default:
      return buildGeneralEducationPrompt();
  }
}

/**
 * Generate suggested questions based on the context
 */
export function generateSuggestedQuestions(context: AIPromptContext): SuggestedQuestion[] {
  switch (context.type) {
    case 'stock-analysis':
      return generateStockQuestions(context.stock);
    case 'market-overview':
      return generateMarketQuestions(context.market);
    case 'portfolio':
      return generatePortfolioQuestions(context.portfolio);
    case 'general-education':
    default:
      return generateEducationQuestions();
  }
}

function generateStockQuestions(stock: StockContext): SuggestedQuestion[] {
  const questions: SuggestedQuestion[] = [];
  const symbol = stock.symbol;
  
  // Valuation questions
  if (stock.metrics?.pe !== undefined) {
    questions.push({
      text: `Is ${symbol}'s P/E ratio of ${stock.metrics.pe.toFixed(1)} high or low for its sector?`,
      category: 'valuation'
    });
  }
  
  if (stock.metrics?.pb !== undefined || stock.metrics?.ps !== undefined) {
    questions.push({
      text: `How does ${symbol}'s valuation compare to its historical average?`,
      category: 'valuation'
    });
  }
  
  // Risk questions
  if (stock.metrics?.debtToEquity !== undefined) {
    questions.push({
      text: `What are the key financial risks for ${symbol}?`,
      category: 'risk'
    });
  }
  
  if (stock.metrics?.beta !== undefined) {
    questions.push({
      text: `How volatile is ${symbol} compared to the market?`,
      category: 'risk'
    });
  }
  
  // Growth questions
  if (stock.metrics?.revenueGrowth !== undefined || stock.metrics?.earningsGrowth !== undefined) {
    questions.push({
      text: `Is ${symbol}'s growth rate sustainable?`,
      category: 'growth'
    });
  }
  
  // Technical questions
  if (stock.metrics?.rsi !== undefined) {
    const rsiLevel = stock.metrics.rsi > 70 ? 'overbought' : stock.metrics.rsi < 30 ? 'oversold' : 'neutral';
    questions.push({
      text: `What does the ${rsiLevel} RSI tell us about ${symbol}?`,
      category: 'technical'
    });
  }
  
  if (stock.metrics?.fiftyDayMA !== undefined && stock.quote?.price !== undefined) {
    const aboveMA = stock.quote.price > stock.metrics.fiftyDayMA;
    questions.push({
      text: `${symbol} is ${aboveMA ? 'above' : 'below'} its 50-day moving average. What does this mean?`,
      category: 'technical'
    });
  }
  
  // General questions
  questions.push({
    text: `What are the key strengths and weaknesses of ${symbol}?`,
    category: 'general'
  });
  
  questions.push({
    text: `Explain ${symbol}'s business model simply`,
    category: 'general'
  });
  
  // Educational questions based on available metrics
  if (stock.metrics?.roe !== undefined) {
    questions.push({
      text: `What does ROE tell us about ${symbol}'s profitability?`,
      category: 'education'
    });
  }
  
  return questions.slice(0, 6); // Return max 6 questions
}

function generateMarketQuestions(market: MarketContext): SuggestedQuestion[] {
  const questions: SuggestedQuestion[] = [];
  
  // Market direction
  if (market.indices?.length) {
    questions.push({
      text: "What's driving the market today?",
      category: 'general'
    });
    
    questions.push({
      text: "How are the major indices performing compared to each other?",
      category: 'general'
    });
  }
  
  // Volatility
  if (market.vix !== undefined) {
    const vixLevel = market.vix > 25 ? 'elevated' : market.vix < 15 ? 'low' : 'moderate';
    questions.push({
      text: `The VIX is at ${market.vix.toFixed(1)}. What does this ${vixLevel} level mean?`,
      category: 'risk'
    });
  }
  
  // Sector rotation
  if (market.sectorPerformance) {
    questions.push({
      text: "Which sectors are leading and which are lagging?",
      category: 'general'
    });
    
    questions.push({
      text: "What does the current sector rotation tell us about investor sentiment?",
      category: 'general'
    });
  }
  
  // Interest rates
  if (market.treasuryYield10Y !== undefined) {
    questions.push({
      text: "How are treasury yields affecting the stock market?",
      category: 'general'
    });
  }
  
  // Educational
  questions.push({
    text: "How do I interpret these market indicators?",
    category: 'education'
  });
  
  questions.push({
    text: "What should investors watch for in this market environment?",
    category: 'education'
  });
  
  return questions.slice(0, 6);
}

function generatePortfolioQuestions(portfolio: PortfolioContext): SuggestedQuestion[] {
  const questions: SuggestedQuestion[] = [];
  
  // Diversification
  if (portfolio.sectorAllocation) {
    questions.push({
      text: "How diversified is my portfolio across sectors?",
      category: 'general'
    });
  }
  
  // Concentration
  if (portfolio.holdings?.length) {
    const topHolding = portfolio.holdings[0];
    if (topHolding && topHolding.weight > 0.2) {
      questions.push({
        text: `Is my ${(topHolding.weight * 100).toFixed(0)}% position in ${topHolding.symbol} too concentrated?`,
        category: 'risk'
      });
    }
  }
  
  // Performance
  if (portfolio.totalGainLoss !== undefined) {
    questions.push({
      text: "How is my portfolio performing overall?",
      category: 'general'
    });
  }
  
  // Risk
  questions.push({
    text: "What are the main risks in my current portfolio?",
    category: 'risk'
  });
  
  // Educational
  questions.push({
    text: "What should I consider when evaluating my portfolio allocation?",
    category: 'education'
  });
  
  questions.push({
    text: "What general principles apply to portfolio diversification?",
    category: 'education'
  });
  
  return questions.slice(0, 6);
}

function generateEducationQuestions(): SuggestedQuestion[] {
  return [
    { text: "What is the P/E ratio and how do I use it?", category: 'education' },
    { text: "Explain the difference between growth and value investing", category: 'education' },
    { text: "What is market capitalization and why does it matter?", category: 'education' },
    { text: "How do I read a stock chart?", category: 'education' },
    { text: "What is diversification and why is it important?", category: 'education' },
    { text: "What are the main types of financial ratios?", category: 'education' },
  ];
}

/**
 * Detect context type from available data
 */
export function detectContextType(data: {
  stock?: StockContext;
  market?: MarketContext;
  portfolio?: PortfolioContext;
}): AIContextType {
  if (data.stock && Object.keys(data.stock).length > 1) {
    return 'stock-analysis';
  }
  if (data.portfolio && data.portfolio.holdings?.length) {
    return 'portfolio';
  }
  if (data.market && (data.market.indices?.length || data.market.sectorPerformance)) {
    return 'market-overview';
  }
  return 'general-education';
}

/**
 * Build context object from available data
 */
export function buildPromptContext(data: {
  stock?: StockContext;
  market?: MarketContext;
  portfolio?: PortfolioContext;
}): AIPromptContext {
  const type = detectContextType(data);
  
  switch (type) {
    case 'stock-analysis':
      return { type: 'stock-analysis', stock: data.stock! };
    case 'market-overview':
      return { type: 'market-overview', market: data.market! };
    case 'portfolio':
      return { type: 'portfolio', portfolio: data.portfolio! };
    default:
      return { type: 'general-education' };
  }
}
