import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ 
  suppressNotices: ['yahooSurvey', 'ripHistorical'] 
});

interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  type: 'news' | 'earnings' | 'press' | 'sec';
  ticker?: string;
}

interface EarningsCall {
  id: string;
  title: string;
  date: string;
  quarter: string;
  year: number;
  transcriptUrl?: string;
  audioUrl?: string;
  type: 'upcoming' | 'past';
}

interface SECFiling {
  id: string;
  formType: string;
  filingDate: string;
  acceptedDate: string;
  description: string;
  url: string;
}

// Simple sentiment analysis based on keywords
function analyzeSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const lowerText = text.toLowerCase();
  
  const bullishKeywords = [
    'beat', 'beats', 'exceeds', 'exceeded', 'growth', 'surge', 'surges', 
    'rally', 'gain', 'gains', 'profit', 'profits', 'positive', 'upgrade',
    'outperform', 'strong', 'record', 'high', 'jump', 'jumps', 'soar', 'soars',
    'bullish', 'buy', 'optimistic', 'boost', 'boosted', 'rise', 'rises'
  ];
  
  const bearishKeywords = [
    'miss', 'misses', 'missed', 'decline', 'declines', 'fall', 'falls',
    'drop', 'drops', 'loss', 'losses', 'negative', 'downgrade', 'weak',
    'underperform', 'low', 'plunge', 'plunges', 'crash', 'bearish', 'sell',
    'pessimistic', 'cut', 'cuts', 'slump', 'slumps', 'tumble', 'tumbles'
  ];

  let bullishScore = 0;
  let bearishScore = 0;

  for (const keyword of bullishKeywords) {
    if (lowerText.includes(keyword)) bullishScore++;
  }
  
  for (const keyword of bearishKeywords) {
    if (lowerText.includes(keyword)) bearishScore++;
  }

  if (bullishScore > bearishScore) return 'bullish';
  if (bearishScore > bullishScore) return 'bearish';
  return 'neutral';
}

// Categorize news type
function categorizeNews(title: string, summary?: string): 'news' | 'press' | 'earnings' | 'sec' {
  const text = (title + ' ' + (summary || '')).toLowerCase();
  
  if (text.includes('earnings') || text.includes('quarterly results') || 
      text.includes('q1') || text.includes('q2') || text.includes('q3') || text.includes('q4') ||
      text.includes('fiscal year') || text.includes('conference call')) {
    return 'earnings';
  }
  
  if (text.includes('announces') || text.includes('announced') || 
      text.includes('press release') || text.includes('unveils') ||
      text.includes('launches') || text.includes('partnership') ||
      text.includes('acquisition') || text.includes('merger')) {
    return 'press';
  }
  
  if (text.includes('sec filing') || text.includes('10-k') || 
      text.includes('10-q') || text.includes('8-k') ||
      text.includes('form 4') || text.includes('form 13')) {
    return 'sec';
  }
  
  return 'news';
}

// Fetch SEC filings from SEC EDGAR API
async function fetchSECFilings(symbol: string): Promise<SECFiling[]> {
  try {
    // First get the CIK number for the company
    const cikResponse = await fetch(
      `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${symbol}&type=&dateb=&owner=include&count=40&output=atom`,
      {
        headers: {
          'User-Agent': 'StockAnalysis/1.0 (contact@example.com)',
          'Accept': 'application/atom+xml'
        }
      }
    );

    if (!cikResponse.ok) {
      console.log('SEC EDGAR response not ok:', cikResponse.status);
      return generateMockSECFilings(symbol);
    }

    const text = await cikResponse.text();
    
    // Parse the atom feed for filings
    const filings: SECFiling[] = [];
    const entries = text.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
    
    for (let i = 0; i < Math.min(entries.length, 15); i++) {
      const entry = entries[i];
      const titleMatch = entry.match(/<title[^>]*>([^<]+)<\/title>/);
      const linkMatch = entry.match(/<link[^>]*href="([^"]+)"/);
      const updatedMatch = entry.match(/<updated>([^<]+)<\/updated>/);
      
      if (titleMatch && linkMatch) {
        const title = titleMatch[1];
        const formTypeMatch = title.match(/^([^\s-]+)/);
        const formType = formTypeMatch ? formTypeMatch[1] : 'Other';
        
        filings.push({
          id: `sec-${i}-${Date.now()}`,
          formType: formType.replace(/[^a-zA-Z0-9-]/g, ''),
          filingDate: updatedMatch ? updatedMatch[1].split('T')[0] : new Date().toISOString().split('T')[0],
          acceptedDate: updatedMatch ? updatedMatch[1].split('T')[0] : new Date().toISOString().split('T')[0],
          description: getFilingDescription(formType, symbol),
          url: linkMatch[1]
        });
      }
    }
    
    return filings.length > 0 ? filings : generateMockSECFilings(symbol);
  } catch (error) {
    console.error('Error fetching SEC filings:', error);
    return generateMockSECFilings(symbol);
  }
}

function getFilingDescription(formType: string, symbol: string): string {
  const descriptions: Record<string, string> = {
    '10-K': `Annual Report - ${symbol}`,
    '10-Q': `Quarterly Report - ${symbol}`,
    '8-K': `Current Report - ${symbol}`,
    '4': `Statement of Changes in Beneficial Ownership`,
    'DEF14A': `Proxy Statement`,
    '13F': `Institutional Investment Report`,
    'SC13G': `Statement of Beneficial Ownership`,
    '424B': `Prospectus Filing`,
    'S-1': `Registration Statement`,
    'S-3': `Registration Statement`,
  };
  
  return descriptions[formType] || `${formType} Filing - ${symbol}`;
}

function generateMockSECFilings(symbol: string): SECFiling[] {
  const filingTypes = [
    { form: '10-Q', desc: 'Quarterly Report' },
    { form: '8-K', desc: 'Current Report' },
    { form: '4', desc: 'Statement of Changes in Beneficial Ownership' },
    { form: '10-K', desc: 'Annual Report' },
    { form: 'DEF14A', desc: 'Proxy Statement' },
  ];

  const now = new Date();
  return filingTypes.map((filing, index) => {
    const filingDate = new Date(now);
    filingDate.setDate(filingDate.getDate() - (index * 15 + Math.floor(Math.random() * 10)));
    
    return {
      id: `sec-mock-${index}`,
      formType: filing.form,
      filingDate: filingDate.toISOString(),
      acceptedDate: filingDate.toISOString(),
      description: `${filing.desc} - ${symbol}`,
      url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${symbol}&type=${filing.form}`
    };
  });
}

function generateMockEarningsCalls(symbol: string, companyName: string): EarningsCall[] {
  const now = new Date();
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
  const currentYear = now.getFullYear();

  const calls: EarningsCall[] = [];

  // Add upcoming earnings call (next quarter)
  const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
  const nextYear = currentQuarter === 4 ? currentYear + 1 : currentYear;
  const upcomingDate = new Date(nextYear, nextQuarter * 3 - 2, 15 + Math.floor(Math.random() * 15));

  calls.push({
    id: `earnings-upcoming-${symbol}`,
    title: `${companyName || symbol} Q${nextQuarter} ${nextYear} Earnings Call`,
    date: upcomingDate.toISOString(),
    quarter: `Q${nextQuarter}`,
    year: nextYear,
    type: 'upcoming'
  });

  // Add past earnings calls
  for (let i = 0; i < 4; i++) {
    let q = currentQuarter - i;
    let y = currentYear;
    if (q <= 0) {
      q += 4;
      y -= 1;
    }
    
    const pastDate = new Date(y, q * 3 - 2, 15 + Math.floor(Math.random() * 15));
    if (pastDate < now) {
      calls.push({
        id: `earnings-past-${i}-${symbol}`,
        title: `${companyName || symbol} Q${q} ${y} Earnings Call`,
        date: pastDate.toISOString(),
        quarter: `Q${q}`,
        year: y,
        transcriptUrl: `https://seekingalpha.com/symbol/${symbol}/earnings/transcripts`,
        type: 'past'
      });
    }
  }

  return calls;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    let news: NewsItem[] = [];
    let earningsCalls: EarningsCall[] = [];
    let secFilings: SECFiling[] = [];
    let companyName = upperSymbol;

    // Get company name from quote
    try {
      const quote = await yahooFinance.quote(upperSymbol);
      companyName = quote?.shortName || quote?.longName || upperSymbol;
    } catch (e) {
      console.log('Could not get company name:', e);
    }

    // Fetch news from Yahoo Finance
    try {
      const searchResult = await yahooFinance.search(upperSymbol, { newsCount: 20 });
      
      if (searchResult.news && searchResult.news.length > 0) {
        news = searchResult.news.map((item, index) => {
          let publishedAt = new Date().toISOString();
          if (item.providerPublishTime) {
            const timestamp = typeof item.providerPublishTime === 'number' 
              ? item.providerPublishTime * 1000 
              : new Date(item.providerPublishTime).getTime();
            publishedAt = new Date(timestamp).toISOString();
          }
          
          return {
            id: `news-${index}-${Date.now()}`,
            title: item.title || 'Untitled',
            summary: undefined,
            source: item.publisher || 'Unknown Source',
            url: item.link || '#',
            publishedAt,
            sentiment: analyzeSentiment(item.title || ''),
            type: categorizeNews(item.title || '', undefined),
            ticker: upperSymbol
          };
        });
      }
    } catch (error) {
      console.error('Error fetching Yahoo news:', error);
    }

    // If no news from Yahoo, try alternative sources
    if (news.length === 0) {
      // Generate placeholder news items
      news = [
        {
          id: 'placeholder-1',
          title: `Latest market analysis for ${companyName}`,
          source: 'Market Watch',
          url: `https://www.marketwatch.com/investing/stock/${upperSymbol}`,
          publishedAt: new Date().toISOString(),
          sentiment: 'neutral',
          type: 'news',
          ticker: upperSymbol
        },
        {
          id: 'placeholder-2',
          title: `${companyName} stock performance update`,
          source: 'Yahoo Finance',
          url: `https://finance.yahoo.com/quote/${upperSymbol}`,
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          sentiment: 'neutral',
          type: 'news',
          ticker: upperSymbol
        }
      ];
    }

    // Fetch SEC filings
    secFilings = await fetchSECFilings(upperSymbol);

    // Generate earnings calls data
    earningsCalls = generateMockEarningsCalls(upperSymbol, companyName);

    return NextResponse.json({
      news,
      earningsCalls,
      secFilings,
      symbol: upperSymbol,
      companyName
    });
  } catch (error) {
    console.error('Error in stock news API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock news' },
      { status: 500 }
    );
  }
}
