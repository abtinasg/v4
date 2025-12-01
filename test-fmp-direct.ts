import 'dotenv/config'
import * as FMP from './src/lib/data/fmp'

async function testFMPDirect() {
  console.log('FMP_API_KEY set:', !!process.env.FMP_API_KEY)
  console.log('=== Direct FMP API Test ===\n')
  
  const quote = await FMP.getQuote('AAPL')
  console.log('FMP Quote:', quote?.price, quote?.change)
  
  const profile = await FMP.getProfile('AAPL')
  console.log('FMP Profile:', profile?.companyName, profile?.industry)
  
  // Calculate proper dates
  const to = new Date().toISOString().split('T')[0]
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  console.log('Date range:', from, 'to', to)
  
  const historical = await FMP.getHistoricalPrices('AAPL', from, to)
  console.log('FMP Historical:', historical?.length, 'days')
  if (historical?.length > 0) {
    console.log('First day:', historical[0])
    console.log('Last day:', historical[historical.length - 1])
  }
}

testFMPDirect().catch(console.error)
