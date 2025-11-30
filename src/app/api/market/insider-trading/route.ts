import { NextResponse } from 'next/server'

// Insider Trading API - Using Yahoo Finance
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'AAPL'
  
  try {
    // Get insider transactions from Yahoo Finance
    const response = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=insiderTransactions,insiderHolders`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 3600 },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch insider data')
    }

    const data = await response.json()
    const result = data?.quoteSummary?.result?.[0]
    const transactions = result?.insiderTransactions?.transactions || []
    
    // Get company name
    const quoteResponse = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    )
    const quoteData = await quoteResponse.json()
    const companyName = quoteData?.chart?.result?.[0]?.meta?.shortName || symbol

    const trades = transactions.slice(0, 20).map((tx: any) => ({
      symbol,
      name: companyName,
      insiderName: tx.filerName || 'Unknown',
      insiderTitle: tx.filerRelation || 'Officer',
      transactionType: getTransactionType(tx.transactionText || tx.ownership),
      shares: Math.abs(tx.shares?.raw || 0),
      price: tx.value?.raw && tx.shares?.raw ? Math.abs(tx.value.raw / tx.shares.raw) : 0,
      value: Math.abs(tx.value?.raw || 0),
      date: tx.startDate?.fmt || 'N/A',
      ownership: tx.ownership || 'Direct',
    }))

    return NextResponse.json({ 
      success: true, 
      trades,
      source: 'yahoo',
      updatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Insider Trading API error:', error)
    return NextResponse.json({ 
      success: false, 
      trades: [],
      error: 'Failed to fetch insider data'
    })
  }
}

function getTransactionType(text: string): 'buy' | 'sell' | 'option' {
  const lower = (text || '').toLowerCase()
  if (lower.includes('sale') || lower.includes('sell') || lower.includes('sold')) return 'sell'
  if (lower.includes('purchase') || lower.includes('buy') || lower.includes('bought') || lower.includes('acquisition')) return 'buy'
  if (lower.includes('option') || lower.includes('exercise')) return 'option'
  return 'sell' // Default to sell as most insider transactions are sales
}
