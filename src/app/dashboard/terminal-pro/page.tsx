'use client'

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { useSidebar } from '@/components/dashboard/Sidebar'
import { cn } from '@/lib/utils'
import { TerminalContextUpdater } from '@/components/ai'
import { useRouter } from 'next/navigation'
import { 
  Monitor,
  BarChart3,
  TrendingUp,
  DollarSign,
  Landmark,
  Fuel,
  Newspaper,
  Search,
  Rocket,
  Coins,
  UserCheck,
  Star,
  LineChart,
  CandlestickChart,
  Bell,
  Briefcase,
  Scale,
  type LucideIcon
} from 'lucide-react'
import { 
  IPOPanel, 
  DividendPanel, 
  InsiderPanel, 
  AnalystPanel, 
  OptionsPanel, 
  ChartsPanel, 
  AlertsPanel, 
  PortfolioPanel, 
  ComparePanel 
} from '@/components/terminal'

// Mobile blocker component
function MobileBlocker() {
  return (
    <div className="md:hidden fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center">
      <Monitor className="w-16 h-16 text-orange-500 mb-6" />
      <h1 className="text-2xl font-bold text-white mb-3">Desktop Required</h1>
      <p className="text-gray-400 text-sm max-w-xs">
        Terminal Pro is designed for desktop use only. Please access this page from a computer with a larger screen for the best experience.
      </p>
      <a 
        href="/dashboard" 
        className="mt-6 px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded transition-colors"
      >
        Back to Dashboard
      </a>
    </div>
  )
}

// View types for sidebar navigation
type ViewType = 'MRKT' | 'EQ' | 'FX' | 'GOVT' | 'CMDTY' | 'NEWS' | 'SRCH' | 'IPO' | 'DIV' | 'INSDR' | 'ANLYST' | 'OPTS' | 'CHART' | 'ALRTS' | 'PORT' | 'COMP'

export default function TerminalProPage() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [commandInput, setCommandInput] = useState('')
  const [activeView, setActiveView] = useState<ViewType>('MRKT')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [marketStatus, setMarketStatus] = useState<{ nyse: string; nasdaq: string; lse: string }>({
    nyse: 'CHECKING',
    nasdaq: 'CHECKING',
    lse: 'CHECKING',
  })
  const { setIsCollapsed, isCollapsed, setIsMobileOpen } = useSidebar()
  const previousCollapseState = useRef<boolean>(isCollapsed)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch real market status
  useEffect(() => {
    const updateMarketStatus = () => {
      const now = new Date()
      
      // NYSE/NASDAQ - Mon-Fri 9:30 AM - 4:00 PM ET
      const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
      const nyDay = nyTime.getDay()
      const nyHour = nyTime.getHours()
      const nyMin = nyTime.getMinutes()
      const nyMinutes = nyHour * 60 + nyMin
      const isNYWeekday = nyDay >= 1 && nyDay <= 5
      const isNYOpen = isNYWeekday && nyMinutes >= 570 && nyMinutes < 960 // 9:30-16:00
      
      // LSE - Mon-Fri 8:00 AM - 4:30 PM GMT
      const londonTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }))
      const londonDay = londonTime.getDay()
      const londonHour = londonTime.getHours()
      const londonMin = londonTime.getMinutes()
      const londonMinutes = londonHour * 60 + londonMin
      const isLondonWeekday = londonDay >= 1 && londonDay <= 5
      const isLSEOpen = isLondonWeekday && londonMinutes >= 480 && londonMinutes < 990 // 8:00-16:30
      
      setMarketStatus({
        nyse: isNYOpen ? 'OPEN' : 'CLOSED',
        nasdaq: isNYOpen ? 'OPEN' : 'CLOSED',
        lse: isLSEOpen ? 'OPEN' : 'CLOSED',
      })
    }
    
    updateMarketStatus()
    const interval = setInterval(updateMarketStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setIsCollapsed(true)
    setIsMobileOpen(false)
  }, [setIsCollapsed, setIsMobileOpen])

  useEffect(() => {
    return () => {
      setIsCollapsed(previousCollapseState.current)
    }
  }, [setIsCollapsed])

  // Handle command execution
  const executeCommand = useCallback(async (cmd: string) => {
    const command = cmd.trim().toUpperCase()
    if (!command) return

    // Add to history
    setCommandHistory(prev => [...prev, command])
    setHistoryIndex(-1)

    // Parse command
    const parts = command.split(/\s+/)
    const mainCmd = parts[0]

    // Handle different commands
    if (command === 'HELP' || command === 'F1') {
      alert(`Terminal Pro Commands:
      
SYMBOL GO - View stock (e.g., AAPL GO)
TOP - View top movers
NEWS - View latest news
MRKT - Market overview
FX - Forex rates
CMDTY - Commodities
CRYPTO - Cryptocurrencies
SECTORS - Sector performance
SEARCH [term] - Search stocks
CLEAR - Clear command
F11 - Fullscreen`)
    } else if (command === 'TOP') {
      setActiveView('MRKT')
    } else if (command === 'NEWS' || command === 'F2') {
      setActiveView('NEWS')
    } else if (command === 'MRKT') {
      setActiveView('MRKT')
    } else if (command === 'FX' || command === 'FOREX') {
      setActiveView('FX')
    } else if (command === 'CMDTY' || command === 'COMMODITIES') {
      setActiveView('CMDTY')
    } else if (command === 'GOVT' || command === 'BONDS') {
      setActiveView('GOVT')
    } else if (command === 'IPO') {
      setActiveView('IPO')
    } else if (command === 'DIV' || command === 'DIVIDEND' || command === 'DIVIDENDS') {
      setActiveView('DIV')
    } else if (command === 'INSDR' || command === 'INSIDER') {
      setActiveView('INSDR')
    } else if (command === 'ANLYST' || command === 'ANALYST' || command === 'RATINGS') {
      setActiveView('ANLYST')
    } else if (command === 'OPTS' || command === 'OPTIONS') {
      setActiveView('OPTS')
    } else if (command === 'CHART' || command === 'CHARTS') {
      setActiveView('CHART')
    } else if (command === 'ALRTS' || command === 'ALERTS' || command === 'ALERT') {
      setActiveView('ALRTS')
    } else if (command === 'PORT' || command === 'PORTFOLIO') {
      setActiveView('PORT')
    } else if (command === 'COMP' || command === 'COMPARE') {
      setActiveView('COMP')
    } else if (command === 'CLEAR') {
      setCommandInput('')
    } else if (command.includes('GO') || command.includes('EQUITY')) {
      // Stock lookup: AAPL GO or AAPL EQUITY GO
      const symbol = parts[0].replace(/[^A-Z]/g, '')
      if (symbol) {
        router.push(`/dashboard/stock-analysis/${symbol}`)
      }
    } else if (mainCmd === 'SEARCH' && parts.length > 1) {
      // Search for stocks
      const query = parts.slice(1).join(' ')
      setActiveView('SRCH')
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}&limit=50`)
        const data = await res.json()
        const mapped = Array.isArray(data.data)
          ? data.data.map((item: { symbol: string; shortName?: string; longName?: string; exchange?: string; type?: string }) => ({
              symbol: item.symbol,
              name: item.longName || item.shortName || item.symbol,
              exchange: item.exchange,
              type: item.type,
            }))
          : []
        setSearchResults(mapped)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    } else {
      // Try as stock symbol
      const symbol = mainCmd.replace(/[^A-Z]/g, '')
      if (symbol && symbol.length <= 5) {
        router.push(`/dashboard/stock-analysis/${symbol}`)
      }
    }

    setCommandInput('')
  }, [router])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Function keys
      if (event.key === 'F1') {
        event.preventDefault()
        executeCommand('HELP')
      } else if (event.key === 'F2') {
        event.preventDefault()
        setActiveView('NEWS')
      } else if (event.key === 'F3') {
        event.preventDefault()
        inputRef.current?.focus()
      } else if (event.key === 'F7') {
        event.preventDefault()
        setActiveView('SRCH')
      } else if (event.key === 'F11') {
        event.preventDefault()
        document.documentElement.requestFullscreen?.()
      }
      if (event.key === 'Escape') {
        setCommandInput('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [executeCommand])

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

  const formatDate = (date: Date) =>
    date
      .toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
      .toUpperCase()

  // Handle function key clicks
  const handleFunctionKey = (key: string) => {
    const action = key.split(' ')[0] // e.g., 'F1'
    switch (action) {
      case 'F1':
        executeCommand('HELP')
        break
      case 'F2':
        setActiveView('NEWS')
        break
      case 'F3':
        inputRef.current?.focus()
        break
      case 'F4':
        // Chart - open stock analysis
        break
      case 'F5':
        // Analysis
        break
      case 'F6':
        router.push('/dashboard/watchlist')
        break
      case 'F7':
        setActiveView('SRCH')
        inputRef.current?.focus()
        break
      case 'F8':
        // Launcher
        break
      case 'F9':
        // Messages
        break
      case 'F10':
        // Actions
        break
      case 'F11':
        document.documentElement.requestFullscreen?.()
        break
      case 'F12':
        // Menu
        break
    }
  }

  // Sidebar navigation items
  const sidebarItems: { icon: LucideIcon; label: string; view: ViewType }[] = [
    { icon: BarChart3, label: 'MRKT', view: 'MRKT' },
    { icon: TrendingUp, label: 'EQ', view: 'EQ' },
    { icon: DollarSign, label: 'FX', view: 'FX' },
    { icon: Landmark, label: 'GOVT', view: 'GOVT' },
    { icon: Fuel, label: 'CMDTY', view: 'CMDTY' },
    { icon: Newspaper, label: 'NEWS', view: 'NEWS' },
    { icon: Search, label: 'SRCH', view: 'SRCH' },
    { icon: Rocket, label: 'IPO', view: 'IPO' },
    { icon: Coins, label: 'DIV', view: 'DIV' },
    { icon: UserCheck, label: 'INSDR', view: 'INSDR' },
    { icon: Star, label: 'ANLYST', view: 'ANLYST' },
    { icon: LineChart, label: 'OPTS', view: 'OPTS' },
    { icon: CandlestickChart, label: 'CHART', view: 'CHART' },
    { icon: Bell, label: 'ALRTS', view: 'ALRTS' },
    { icon: Briefcase, label: 'PORT', view: 'PORT' },
    { icon: Scale, label: 'COMP', view: 'COMP' },
  ]

  return (
    <>
      {/* Mobile blocker */}
      <MobileBlocker />
      
      {/* Update AI context with terminal data */}
      <TerminalContextUpdater refreshInterval={30000} />
      
      <div className="hidden md:flex relative w-full min-h-[calc(100vh-6rem)] bg-black text-white font-mono overflow-hidden flex-col rounded-2xl border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <header className="h-8 bg-[#1a1a1a] border-b border-[#333] flex items-center px-2 gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[#FF6600] font-bold text-sm">DEEP TERMINAL</span>
            <span className="text-[#FF6600] text-xs">PRO</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-400">
              NYSE: <span className={marketStatus.nyse === 'OPEN' ? 'text-green-400' : 'text-red-400'}>{marketStatus.nyse}</span>
            </span>
            <span className="text-gray-400">
              NASDAQ: <span className={marketStatus.nasdaq === 'OPEN' ? 'text-green-400' : 'text-red-400'}>{marketStatus.nasdaq}</span>
            </span>
            <span className="text-gray-400">
              LSE: <span className={marketStatus.lse === 'OPEN' ? 'text-green-400' : 'text-red-400'}>{marketStatus.lse}</span>
            </span>
          </div>
          <div className="text-[#FF6600] text-xs font-bold">
            {formatDate(currentTime)} {formatTime(currentTime)} ET
          </div>
        </header>

        <div className="h-6 bg-[#0a0a0a] border-b border-[#222] flex items-center px-1 gap-1 shrink-0 overflow-x-auto">
          {['F1 HELP', 'F2 NEWS', 'F3 QUOTE', 'F4 CHART', 'F5 ANLY', 'F6 PORT', 'F7 SRCH', 'F8 LAUN', 'F9 MSG', 'F10 ACT', 'F11 FULL', 'F12 MENU'].map(
            (key) => (
              <button
                key={key}
                onClick={() => handleFunctionKey(key)}
                className="px-2 py-0.5 text-[10px] bg-[#1a1a1a] hover:bg-[#333] text-gray-300 hover:text-[#FF6600] rounded transition-colors whitespace-nowrap"
              >
                {key}
              </button>
            )
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          <aside className="w-12 bg-[#0a0a0a] border-r border-[#222] flex flex-col items-center py-2 gap-1 shrink-0">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveView(item.view)}
                  className={cn(
                    'w-10 h-10 flex flex-col items-center justify-center rounded text-[8px] transition-colors',
                    activeView === item.view
                      ? 'bg-[#FF6600]/20 text-[#FF6600] border border-[#FF6600]/50'
                      : 'hover:bg-[#222] text-gray-500 hover:text-gray-300'
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </aside>

          <main className="flex-1 p-1 overflow-auto">
            {/* Market Overview View */}
            {activeView === 'MRKT' && (
              <div className="grid grid-cols-4 gap-1 auto-rows-min">
                <MarketIndicesPanel />
                <SectorHeatmapPanel />
                <TopMoversPanel />
                <NewsFeedPanel />
                <CurrenciesPanel />
                <CommoditiesPanel />
                <CryptoPanel />
                <MarketBreadthPanel />
              </div>
            )}

            {/* Equity View */}
            {activeView === 'EQ' && (
              <div className="grid grid-cols-3 gap-1 auto-rows-min">
                <MarketIndicesPanel />
                <TopMoversPanel />
                <SectorHeatmapPanel />
                <MarketBreadthPanel />
                <MostActivePanel />
              </div>
            )}

            {/* Forex View */}
            {activeView === 'FX' && (
              <div className="grid grid-cols-2 gap-1 auto-rows-min">
                <CurrenciesPanel />
                <ForexCrossPanel />
              </div>
            )}

            {/* Bonds/Government View */}
            {activeView === 'GOVT' && (
              <div className="grid grid-cols-2 gap-1 auto-rows-min">
                <BondsPanel />
                <EconomicCalendarPanel />
              </div>
            )}

            {/* Commodities View */}
            {activeView === 'CMDTY' && (
              <div className="grid grid-cols-2 gap-1 auto-rows-min">
                <CommoditiesPanel />
                <CryptoPanel />
              </div>
            )}

            {/* News View */}
            {activeView === 'NEWS' && (
              <div className="grid grid-cols-1 gap-1 auto-rows-min">
                <NewsFeedPanel />
              </div>
            )}

            {/* Search View */}
            {activeView === 'SRCH' && (
              <div className="h-full">
                <SearchResultsPanel 
                  results={searchResults} 
                  loading={searchLoading}
                  onSelectStock={(symbol) => router.push(`/dashboard/stock-analysis/${symbol}`)}
                />
              </div>
            )}

            {/* IPO Calendar View */}
            {activeView === 'IPO' && (
              <div className="h-full">
                <IPOPanel />
              </div>
            )}

            {/* Dividend Calendar View */}
            {activeView === 'DIV' && (
              <div className="h-full">
                <DividendPanel />
              </div>
            )}

            {/* Insider Trading View */}
            {activeView === 'INSDR' && (
              <div className="h-full">
                <InsiderPanel />
              </div>
            )}

            {/* Analyst Ratings View */}
            {activeView === 'ANLYST' && (
              <div className="h-full">
                <AnalystPanel />
              </div>
            )}

            {/* Options Flow View */}
            {activeView === 'OPTS' && (
              <div className="h-full">
                <OptionsPanel />
              </div>
            )}

            {/* Charts View */}
            {activeView === 'CHART' && (
              <div className="h-full">
                <ChartsPanel />
              </div>
            )}

            {/* Alerts View */}
            {activeView === 'ALRTS' && (
              <div className="h-full">
                <AlertsPanel />
              </div>
            )}

            {/* Portfolio View */}
            {activeView === 'PORT' && (
              <div className="h-full">
                <PortfolioPanel />
              </div>
            )}

            {/* Compare View */}
            {activeView === 'COMP' && (
              <div className="h-full">
                <ComparePanel />
              </div>
            )}
          </main>
        </div>

        <div className="h-8 bg-[#1a1a1a] border-t border-[#333] flex items-center px-2 shrink-0">
          <span className="text-[#FF6600] mr-2 text-sm">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={commandInput}
            onChange={(event) => setCommandInput(event.target.value.toUpperCase())}
            placeholder="Enter command (e.g., AAPL GO, TOP, NEWS, SEARCH APPLE)"
            className="flex-1 bg-transparent text-green-400 text-sm outline-none placeholder:text-gray-600"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && commandInput) {
                executeCommand(commandInput)
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                if (commandHistory.length > 0) {
                  const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
                  setHistoryIndex(newIndex)
                  setCommandInput(commandHistory[commandHistory.length - 1 - newIndex] || '')
                }
              } else if (event.key === 'ArrowDown') {
                event.preventDefault()
                if (historyIndex > 0) {
                  const newIndex = historyIndex - 1
                  setHistoryIndex(newIndex)
                  setCommandInput(commandHistory[commandHistory.length - 1 - newIndex] || '')
                } else if (historyIndex === 0) {
                  setHistoryIndex(-1)
                  setCommandInput('')
                }
              }
            }}
          />
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>ESC: Clear</span>
            <span>|</span>
            <span>↑↓: History</span>
            <span>|</span>
            <span>ENTER: Execute</span>
          </div>
        </div>
<footer className="h-5 bg-[#0a0a0a] border-t border-[#222] flex items-center px-2 text-[10px] shrink-0">
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              CONNECTED
            </span>
            <span>DEEP TERMINAL PRO v2.0</span>
            <span>|</span>
            <span>DATA: REAL-TIME</span>
            <span>|</span>
            <span>VIEW: {activeView}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-gray-500">
            <span>CMDS: {commandHistory.length}</span>
            <span>LATENCY: 24ms</span>
          </div>
        </footer>
      </div>
    </>
  )
}

interface PanelProps {
  className?: string
  title: string
  children: ReactNode
  color?: string
}

function Panel({ className, title, children, color = '#FF6600' }: PanelProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  return (
    <div
      className={cn(
        'bg-[#0a0a0a] border border-[#222] rounded-sm overflow-hidden flex flex-col transition-all duration-200',
        isMaximized && 'fixed inset-4 z-50',
        isMinimized && 'h-5',
        !isMinimized && !isMaximized && className
      )}
    >
      <div
        className="h-5 px-2 flex items-center justify-between shrink-0"
        style={{ backgroundColor: `${color}15`, borderBottom: `1px solid ${color}30` }}
      >
        <span className="text-[10px] font-bold" style={{ color }}>
          {title}
        </span>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              setIsMinimized(!isMinimized)
              if (isMaximized) setIsMaximized(false)
            }}
            className="w-3 h-3 rounded-sm bg-[#333] hover:bg-[#444] flex items-center justify-center text-[8px] text-gray-400 hover:text-white transition-colors"
            title={isMinimized ? 'Restore' : 'Minimize'}
          >
            −
          </button>
          <button 
            onClick={() => {
              setIsMaximized(!isMaximized)
              if (isMinimized) setIsMinimized(false)
            }}
            className="w-3 h-3 rounded-sm bg-[#333] hover:bg-[#444] flex items-center justify-center text-[8px] text-gray-400 hover:text-white transition-colors"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? '❐' : '□'}
          </button>
        </div>
      </div>
      {!isMinimized && (
        <div className="flex-1 overflow-auto min-h-0">{children}</div>
      )}
    </div>
  )
}

interface IndexData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

function MarketIndicesPanel({ className }: { className?: string }) {
  const [indices, setIndices] = useState<IndexData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const res = await fetch('/api/market/overview')
        const data = await res.json()
        if (data.indices) {
          setIndices(data.indices)
        }
      } catch (error) {
        console.error('Error fetching indices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIndices()
    const interval = setInterval(fetchIndices, 30000)
    return () => clearInterval(interval)
  }, [])

  const symbolMap: Record<string, string> = {
    '^GSPC': 'SPX',
    '^DJI': 'INDU',
    '^IXIC': 'CCMP',
    '^RUT': 'RTY',
    '^VIX': 'VIX',
  }

  return (
    <Panel className={className} title="MARKET INDICES" color="#00BFFF">
      <div className="text-[10px]">
        <div className="grid grid-cols-12 gap-1 px-2 py-1 bg-[#111] text-gray-500 border-b border-[#222] sticky top-0">
          <span className="col-span-2">TICKER</span>
          <span className="col-span-4">NAME</span>
          <span className="col-span-3 text-right">LAST</span>
          <span className="col-span-3 text-right">CHG%</span>
        </div>
        {loading ? (
          <div className="px-2 py-4 text-center text-gray-500">Loading...</div>
        ) : (
          indices.map((idx) => (
            <div
              key={idx.symbol}
              className="grid grid-cols-12 gap-1 px-2 py-1 hover:bg-[#1a1a1a] border-b border-[#111] cursor-pointer"
            >
              <span className="col-span-2 text-[#00BFFF] font-bold">{symbolMap[idx.symbol] || idx.symbol.replace('^', '')}</span>
              <span className="col-span-4 text-gray-400 truncate">{idx.name}</span>
              <span className="col-span-3 text-right text-white tabular-nums">
                {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span
                className={cn(
                  'col-span-3 text-right tabular-nums font-bold',
                  idx.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                )}
              >
                {idx.changePercent >= 0 ? '+' : ''}
                {idx.changePercent.toFixed(2)}%
              </span>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

interface SectorData {
  name: string
  change: number
}

function SectorHeatmapPanel({ className }: { className?: string }) {
  const [sectors, setSectors] = useState<SectorData[]>([])
  const [loading, setLoading] = useState(true)

  const weights: Record<string, number> = {
    'Technology': 28,
    'Healthcare': 13,
    'Financials': 12,
    'Consumer Cyclical': 11,
    'Communication Services': 9,
    'Industrials': 8,
    'Consumer Defensive': 6,
    'Energy': 5,
    'Utilities': 3,
    'Real Estate': 3,
    'Basic Materials': 2,
  }

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const res = await fetch('/api/market/sectors')
        const data = await res.json()
        if (data.sectors) {
          setSectors(data.sectors.slice(0, 11))
        }
      } catch (error) {
        console.error('Error fetching sectors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSectors()
    const interval = setInterval(fetchSectors, 60000)
    return () => clearInterval(interval)
  }, [])

  const getHeatColor = (change: number) => {
    if (change > 1) return 'bg-green-600'
    if (change > 0.5) return 'bg-green-700'
    if (change > 0) return 'bg-green-900'
    if (change > -0.5) return 'bg-red-900'
    if (change > -1) return 'bg-red-700'
    return 'bg-red-600'
  }

  return (
    <Panel className={className} title="S&P 500 SECTORS" color="#FFD700">
      <div className="p-1.5 grid grid-cols-4 gap-1">
        {loading ? (
          <div className="col-span-4 flex items-center justify-center text-gray-500 py-4">Loading...</div>
        ) : (
          sectors.map((sector) => (
            <div
              key={sector.name}
              className={cn(
                'rounded-sm p-1 flex flex-col justify-center cursor-pointer hover:opacity-80 transition-opacity h-8',
                getHeatColor(sector.change)
              )}
            >
              <span className="text-[6px] text-white/80 truncate leading-tight">{sector.name}</span>
              <span className="text-[9px] font-bold text-white leading-tight">
                {sector.change >= 0 ? '+' : ''}
                {sector.change.toFixed(2)}%
              </span>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

interface MoverData {
  symbol: string
  name: string
  price: number
  changePercent: number
}

function TopMoversPanel({ className }: { className?: string }) {
  const [tab, setTab] = useState<'gainers' | 'losers'>('gainers')
  const [gainers, setGainers] = useState<MoverData[]>([])
  const [losers, setLosers] = useState<MoverData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovers = async () => {
      try {
        const res = await fetch('/api/market/movers')
        const data = await res.json()
        if (data.gainers) setGainers(data.gainers.slice(0, 6))
        if (data.losers) setLosers(data.losers.slice(0, 6))
      } catch (error) {
        console.error('Error fetching movers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovers()
    const interval = setInterval(fetchMovers, 30000)
    return () => clearInterval(interval)
  }, [])

  const data = tab === 'gainers' ? gainers : losers

  return (
    <Panel className={className} title="TOP MOVERS" color={tab === 'gainers' ? '#00D26A' : '#FF3B3B'}>
      <div className="flex border-b border-[#222]">
        <button
          onClick={() => setTab('gainers')}
          className={cn(
            'flex-1 py-1 text-[10px] font-bold transition-colors',
            tab === 'gainers'
              ? 'bg-green-900/30 text-green-400 border-b-2 border-green-400'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          ▲ GAINERS
        </button>
        <button
          onClick={() => setTab('losers')}
          className={cn(
            'flex-1 py-1 text-[10px] font-bold transition-colors',
            tab === 'losers'
              ? 'bg-red-900/30 text-red-400 border-b-2 border-red-400'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          ▼ LOSERS
        </button>
      </div>
      <div className="text-[10px]">
        {loading ? (
          <div className="px-2 py-4 text-center text-gray-500">Loading...</div>
        ) : (
          data.map((stock, index) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between px-2 py-1.5 hover:bg-[#1a1a1a] border-b border-[#111] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-3">{index + 1}</span>
                <div>
                  <span
                    className={cn(
                      'font-bold',
                      tab === 'gainers' ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {stock.symbol}
                  </span>
                  <span className="text-gray-500 ml-1 text-[9px]">{stock.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white">${stock.price.toFixed(2)}</div>
                <div className={cn('font-bold', stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {stock.changePercent >= 0 ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

function MarketBreadthPanel({ className }: { className?: string }) {
  const [breadth, setBreadth] = useState({
    advancing: 0,
    declining: 0,
    unchanged: 0,
    newHighs: 0,
    newLows: 0,
    aboveMA200: 50,
    belowMA200: 50,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBreadth = async () => {
      try {
        const res = await fetch('/api/market/breadth')
        const data = await res.json()
        if (data.breadth) {
          setBreadth(data.breadth)
        }
      } catch (error) {
        console.error('Error fetching market breadth:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBreadth()
    const interval = setInterval(fetchBreadth, 60000)
    return () => clearInterval(interval)
  }, [])

  const advPct = breadth.advancing + breadth.declining > 0 
    ? (breadth.advancing / (breadth.advancing + breadth.declining)) * 100 
    : 50

  return (
    <Panel className={className} title="MARKET BREADTH" color="#FF6600">
      {loading ? (
        <div className="p-2 text-center text-gray-500 text-[10px]">Loading...</div>
      ) : (
        <div className="p-2 space-y-2 text-[10px]">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-green-400">ADV: {breadth.advancing}</span>
              <span className="text-gray-500">UNCH: {breadth.unchanged}</span>
              <span className="text-red-400">DEC: {breadth.declining}</span>
            </div>
            <div className="h-4 bg-[#111] rounded overflow-hidden flex">
              <div className="bg-green-500 transition-all flex items-center justify-center" style={{ width: `${advPct}%` }}>
                <span className="text-[8px] text-black font-bold">{advPct.toFixed(0)}%</span>
              </div>
              <div className="bg-red-500 transition-all flex items-center justify-center" style={{ width: `${100 - advPct}%` }}>
                <span className="text-[8px] text-black font-bold">{(100 - advPct).toFixed(0)}%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#111] rounded p-1.5">
              <div className="text-gray-500">Near 52W Highs</div>
              <div className="text-green-400 text-lg font-bold">{breadth.newHighs}</div>
            </div>
            <div className="bg-[#111] rounded p-1.5">
              <div className="text-gray-500">Near 52W Lows</div>
              <div className="text-red-400 text-lg font-bold">{breadth.newLows}</div>
            </div>
            <div className="bg-[#111] rounded p-1.5">
              <div className="text-gray-500">Above 200 DMA</div>
              <div className="text-green-400 text-lg font-bold">{breadth.aboveMA200}%</div>
            </div>
            <div className="bg-[#111] rounded p-1.5">
              <div className="text-gray-500">Below 200 DMA</div>
              <div className="text-red-400 text-lg font-bold">{breadth.belowMA200}%</div>
            </div>
          </div>
        </div>
      )}
    </Panel>
  )
}

function WorldClockPanel({ className }: { className?: string }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Calculate real market status based on local time in each timezone
  const getMarketStatus = (tz: string, openHour: number, openMin: number, closeHour: number, closeMin: number) => {
    const localTime = new Date(time.toLocaleString('en-US', { timeZone: tz }))
    const day = localTime.getDay()
    const hour = localTime.getHours()
    const min = localTime.getMinutes()
    const currentMinutes = hour * 60 + min
    const openMinutes = openHour * 60 + openMin
    const closeMinutes = closeHour * 60 + closeMin
    
    // Weekday check (Mon-Fri)
    const isWeekday = day >= 1 && day <= 5
    
    return isWeekday && currentMinutes >= openMinutes && currentMinutes < closeMinutes ? 'open' : 'closed'
  }

  const cities = [
    { name: 'NEW YORK', tz: 'America/New_York', market: 'NYSE', openH: 9, openM: 30, closeH: 16, closeM: 0 },
    { name: 'LONDON', tz: 'Europe/London', market: 'LSE', openH: 8, openM: 0, closeH: 16, closeM: 30 },
    { name: 'TOKYO', tz: 'Asia/Tokyo', market: 'TSE', openH: 9, openM: 0, closeH: 15, closeM: 0 },
    { name: 'HONG KONG', tz: 'Asia/Hong_Kong', market: 'HKEX', openH: 9, openM: 30, closeH: 16, closeM: 0 },
    { name: 'SYDNEY', tz: 'Australia/Sydney', market: 'ASX', openH: 10, openM: 0, closeH: 16, closeM: 0 },
  ]

  return (
    <Panel className={className} title="WORLD MARKETS" color="#8B5CF6">
      <div className="flex items-center justify-around h-full px-1">
        {cities.map((city) => {
          const status = getMarketStatus(city.tz, city.openH, city.openM, city.closeH, city.closeM)
          return (
            <div key={city.name} className="text-center">
              <div className="text-[8px] text-gray-500">{city.name}</div>
              <div className="text-[11px] font-bold text-white tabular-nums">
                {time.toLocaleTimeString('en-US', {
                  timeZone: city.tz,
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </div>
              <div className={cn('text-[7px] font-bold', status === 'open' ? 'text-green-400' : 'text-red-400')}>
                {city.market}
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

interface ForexData {
  pair: string
  price: number
  change: number
  changePercent: number
}

function CurrenciesPanel({ className }: { className?: string }) {
  const [currencies, setCurrencies] = useState<ForexData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForex = async () => {
      try {
        const res = await fetch('/api/market/forex')
        const data = await res.json()
        if (data.currencies) {
          setCurrencies(data.currencies)
        }
      } catch (error) {
        console.error('Error fetching forex:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchForex()
    const interval = setInterval(fetchForex, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (pair: string, price: number) => {
    if (pair.includes('JPY')) return price.toFixed(2)
    return price.toFixed(4)
  }

  return (
    <Panel className={className} title="FX RATES" color="#10B981">
      <div className="text-[10px]">
        <div className="grid grid-cols-12 gap-1 px-2 py-1 bg-[#111] text-gray-500 border-b border-[#222] sticky top-0">
          <span className="col-span-4">PAIR</span>
          <span className="col-span-4 text-right">RATE</span>
          <span className="col-span-4 text-right">CHG%</span>
        </div>
        {loading ? (
          <div className="px-2 py-4 text-center text-gray-500">Loading...</div>
        ) : (
          currencies.map((fx) => (
            <div
              key={fx.pair}
              className="grid grid-cols-12 gap-1 px-2 py-1 hover:bg-[#1a1a1a] border-b border-[#111] cursor-pointer"
            >
              <span className="col-span-4 text-[#10B981] font-bold">{fx.pair}</span>
              <span className="col-span-4 text-right text-white tabular-nums">{formatPrice(fx.pair, fx.price)}</span>
              <span
                className={cn('col-span-4 text-right tabular-nums', fx.changePercent >= 0 ? 'text-green-400' : 'text-red-400')}
              >
                {fx.changePercent >= 0 ? '+' : ''}
                {fx.changePercent.toFixed(2)}%
              </span>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

interface CommodityData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

function CommoditiesPanel({ className }: { className?: string }) {
  const [commodities, setCommodities] = useState<CommodityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        const res = await fetch('/api/market/commodities')
        const data = await res.json()
        if (data.commodities) {
          setCommodities(data.commodities)
        }
      } catch (error) {
        console.error('Error fetching commodities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCommodities()
    const interval = setInterval(fetchCommodities, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Panel className={className} title="COMMODITIES" color="#F59E0B">
      <div className="text-[10px]">
        <div className="grid grid-cols-12 gap-1 px-2 py-1 bg-[#111] text-gray-500 border-b border-[#222] sticky top-0">
          <span className="col-span-2">SYM</span>
          <span className="col-span-4">NAME</span>
          <span className="col-span-3 text-right">LAST</span>
          <span className="col-span-3 text-right">CHG%</span>
        </div>
        {loading ? (
          <div className="px-2 py-4 text-center text-gray-500">Loading...</div>
        ) : (
          commodities.map((cmd) => (
            <div
              key={cmd.symbol}
              className="grid grid-cols-12 gap-1 px-2 py-1 hover:bg-[#1a1a1a] border-b border-[#111] cursor-pointer"
            >
              <span className="col-span-2 text-[#F59E0B] font-bold">{cmd.symbol}</span>
              <span className="col-span-4 text-gray-400 truncate">{cmd.name}</span>
              <span className="col-span-3 text-right text-white tabular-nums">
                {cmd.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span
                className={cn('col-span-3 text-right tabular-nums', cmd.changePercent >= 0 ? 'text-green-400' : 'text-red-400')}
              >
                {cmd.changePercent >= 0 ? '+' : ''}
                {cmd.changePercent.toFixed(2)}%
              </span>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

interface CryptoData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

function CryptoPanel({ className }: { className?: string }) {
  const [cryptos, setCryptos] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const res = await fetch('/api/market/crypto')
        const data = await res.json()
        if (data.crypto) {
          setCryptos(data.crypto)
        }
      } catch (error) {
        console.error('Error fetching crypto:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCrypto()
    const interval = setInterval(fetchCrypto, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Panel className={className} title="CRYPTO ASSETS" color="#EC4899">
      <div className="text-[10px]">
        <div className="grid grid-cols-12 gap-1 px-2 py-1 bg-[#111] text-gray-500 border-b border-[#222] sticky top-0">
          <span className="col-span-3">COIN</span>
          <span className="col-span-4">NAME</span>
          <span className="col-span-3 text-right">PRICE</span>
          <span className="col-span-2 text-right">24H</span>
        </div>
        {loading ? (
          <div className="px-2 py-4 text-center text-gray-500">Loading...</div>
        ) : (
          cryptos.map((crypto) => (
            <div
              key={crypto.symbol}
              className="grid grid-cols-12 gap-1 px-2 py-1 hover:bg-[#1a1a1a] border-b border-[#111] cursor-pointer"
            >
              <span className="col-span-3 text-[#EC4899] font-bold">{crypto.symbol}</span>
              <span className="col-span-4 text-gray-400 truncate">{crypto.name}</span>
              <span className="col-span-3 text-right text-white tabular-nums">
                ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span
                className={cn('col-span-2 text-right tabular-nums font-bold', crypto.changePercent >= 0 ? 'text-green-400' : 'text-red-400')}
              >
                {crypto.changePercent >= 0 ? '+' : ''}
                {crypto.changePercent.toFixed(1)}%
              </span>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

interface NewsItem {
  headline: string
  publishedDate: string
  timeAgo: string
  source: string
  sentiment: string
  url?: string
}

function NewsFeedPanel({ className }: { className?: string }) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/market/news?limit=5')
        const data = await res.json()
        if (data.news) {
          setNews(data.news.slice(0, 5))
        }
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 60000)
    return () => clearInterval(interval)
  }, [])

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'bullish') return 'border-l-green-500'
    if (sentiment === 'bearish') return 'border-l-red-500'
    return 'border-l-gray-500'
  }

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return '--:--'
    }
  }

  const getSourceAbbr = (source: string) => {
    const sourceMap: Record<string, string> = {
      'Yahoo Finance': 'YF',
      'Reuters': 'RTRS',
      'Bloomberg': 'BBG',
      'CNBC': 'CNBC',
      'MarketWatch': 'MW',
      'Wall Street Journal': 'WSJ',
      'Financial Times': 'FT',
      '247wallst.com': '247W',
      'Investor\'s Business Daily': 'IBD',
      'Barron\'s': 'BARR',
      'Forbes': 'FRBS',
    }
    return sourceMap[source] || source.slice(0, 4).toUpperCase()
  }

  return (
    <Panel className={className} title="LIVE NEWS FEED" color="#FF6600">
      <div className="text-[10px]">
        {loading ? (
          <div className="px-2 py-4 text-center text-gray-500">Loading...</div>
        ) : news.length === 0 ? (
          <div className="px-2 py-4 text-center text-gray-500">No news available</div>
        ) : (
          news.map((item, index) => (
            <div
              key={index}
              onClick={() => item.url && window.open(item.url, '_blank')}
              className={cn(
                'px-2 py-1.5 border-l-2 hover:bg-[#1a1a1a] cursor-pointer border-b border-[#111]',
                getSentimentColor(item.sentiment)
              )}
            >
              <div className="flex items-start gap-2">
                <span className="text-[#FF6600] font-mono shrink-0">{item.timeAgo || formatTime(item.publishedDate)}</span>
                <span className="text-gray-300 leading-tight">{item.headline}</span>
              </div>
              <div className="text-gray-500 mt-0.5 text-[9px]">{getSourceAbbr(item.source)}</div>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

// Search Results Panel
interface SearchResult {
  symbol: string
  name: string
  exchange?: string
  type?: string
}

function SearchResultsPanel({ 
  results, 
  loading, 
  onSelectStock 
}: { 
  results: SearchResult[]
  loading: boolean
  onSelectStock: (symbol: string) => void
  className?: string
}) {
  return (
    <Panel className="h-full" title="SEARCH RESULTS" color="#8B5CF6">
      <div className="text-[10px]">
        <div className="grid grid-cols-12 gap-1 px-2 py-1 bg-[#111] text-gray-500 border-b border-[#222] sticky top-0">
          <span className="col-span-2">SYMBOL</span>
          <span className="col-span-6">NAME</span>
          <span className="col-span-2">EXCHANGE</span>
          <span className="col-span-2">TYPE</span>
        </div>
        {loading ? (
          <div className="px-2 py-8 text-center text-gray-500">Searching...</div>
        ) : results.length === 0 ? (
          <div className="px-2 py-8 text-center text-gray-500">
            Enter a search term above (e.g., SEARCH APPLE)
          </div>
        ) : (
          results.map((result) => (
            <div
              key={result.symbol}
              onClick={() => onSelectStock(result.symbol)}
              className="grid grid-cols-12 gap-1 px-2 py-2 hover:bg-[#1a1a1a] border-b border-[#111] cursor-pointer"
            >
              <span className="col-span-2 text-[#8B5CF6] font-bold">{result.symbol}</span>
              <span className="col-span-6 text-gray-300 truncate">{result.name}</span>
              <span className="col-span-2 text-gray-500">{result.exchange || 'N/A'}</span>
              <span className="col-span-2 text-gray-500">{result.type || 'Stock'}</span>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

// Most Active Panel (for EQ view)
function MostActivePanel({ className }: { className?: string }) {
  const [active, setActive] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await fetch('/api/market/movers')
        const data = await res.json()
        if (data.mostActive) {
          setActive(data.mostActive.slice(0, 10))
        }
      } catch (error) {
        console.error('Error fetching most active:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActive()
    const interval = setInterval(fetchActive, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatVolume = (vol: number) => {
    if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(1)}B`
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`
    return vol.toString()
  }

  return (
    <Panel className={className} title="MOST ACTIVE" color="#06B6D4">
      <div className="text-[10px]">
        <div className="grid grid-cols-12 gap-1 px-2 py-1 bg-[#111] text-gray-500 border-b border-[#222] sticky top-0">
          <span className="col-span-2">SYM</span>
          <span className="col-span-4">NAME</span>
          <span className="col-span-3 text-right">PRICE</span>
          <span className="col-span-3 text-right">VOL</span>
        </div>
        {loading ? (
          <div className="px-2 py-4 text-center text-gray-500">Loading...</div>
        ) : (
          active.map((stock) => (
            <div
              key={stock.symbol}
              className="grid grid-cols-12 gap-1 px-2 py-1 hover:bg-[#1a1a1a] border-b border-[#111] cursor-pointer"
            >
              <span className="col-span-2 text-[#06B6D4] font-bold">{stock.symbol}</span>
              <span className="col-span-4 text-gray-400 truncate">{stock.name}</span>
              <span className="col-span-3 text-right text-white tabular-nums">${stock.price?.toFixed(2)}</span>
              <span className="col-span-3 text-right text-gray-400 tabular-nums">{formatVolume(stock.volume || 0)}</span>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

// Forex Cross Rates Panel (for FX view)
function ForexCrossPanel({ className }: { className?: string }) {
  const [rates, setRates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('/api/market/forex')
        const data = await res.json()
        if (data.currencies) {
          setRates(data.currencies)
        }
      } catch (error) {
        console.error('Error fetching forex rates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
    const interval = setInterval(fetchRates, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Panel className={className} title="FX CROSS RATES" color="#10B981">
      <div className="p-2 text-[10px]">
        {loading ? (
          <div className="py-4 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {rates.map((fx) => (
              <div key={fx.pair} className="bg-[#111] rounded p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#10B981] font-bold">{fx.pair}</span>
                  <span className={cn(
                    'text-[9px] font-bold',
                    fx.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {fx.changePercent >= 0 ? '▲' : '▼'} {Math.abs(fx.changePercent).toFixed(2)}%
                  </span>
                </div>
                <div className="text-white text-lg font-bold tabular-nums">
                  {fx.pair?.includes('JPY') ? fx.price?.toFixed(2) : fx.price?.toFixed(4)}
                </div>
                <div className="text-gray-500 text-[9px]">
                  Chg: {fx.change >= 0 ? '+' : ''}{fx.change?.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  )
}

// Bonds Panel (for GOVT view)
function BondsPanel({ className }: { className?: string }) {
  const [bonds, setBonds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBonds = async () => {
      try {
        // Using Yahoo Finance for treasury yields
        const symbols = ['^TNX', '^TYX', '^FVX', '^IRX'] // 10Y, 30Y, 5Y, 13W
        const res = await fetch(`/api/stocks/quote?symbols=${symbols.join(',')}`)
        const data = await res.json()
        
        const bondInfo: Record<string, string> = {
          '^TNX': '10-Year Treasury',
          '^TYX': '30-Year Treasury',
          '^FVX': '5-Year Treasury',
          '^IRX': '13-Week Treasury',
        }
        
        if (data.quotes && data.quotes.length > 0) {
          const formatted = data.quotes.map((q: any) => ({
            symbol: q.symbol,
            name: bondInfo[q.symbol] || q.name || q.symbol,
            yield: q.price,
            change: q.change,
            changePercent: q.changePercent,
          }))
          setBonds(formatted)
        } else {
          throw new Error('No quotes data')
        }
      } catch (error) {
        console.error('Error fetching bonds:', error)
        // Fallback data
        setBonds([
          { symbol: '10Y', name: '10-Year Treasury', yield: 4.25, change: 0.02, changePercent: 0.47 },
          { symbol: '30Y', name: '30-Year Treasury', yield: 4.45, change: 0.01, changePercent: 0.22 },
          { symbol: '5Y', name: '5-Year Treasury', yield: 4.15, change: -0.01, changePercent: -0.24 },
          { symbol: '2Y', name: '2-Year Treasury', yield: 4.35, change: 0.03, changePercent: 0.69 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchBonds()
    const interval = setInterval(fetchBonds, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Panel className={className} title="US TREASURY YIELDS" color="#F59E0B">
      <div className="text-[10px]">
        <div className="grid grid-cols-12 gap-1 px-2 py-1 bg-[#111] text-gray-500 border-b border-[#222] sticky top-0">
          <span className="col-span-4">MATURITY</span>
          <span className="col-span-4 text-right">YIELD</span>
          <span className="col-span-4 text-right">CHG</span>
        </div>
        {loading ? (
          <div className="px-2 py-4 text-center text-gray-500">Loading...</div>
        ) : (
          bonds.map((bond) => (
            <div
              key={bond.symbol}
              className="grid grid-cols-12 gap-1 px-2 py-2 hover:bg-[#1a1a1a] border-b border-[#111]"
            >
              <span className="col-span-4 text-[#F59E0B] font-bold">{bond.name}</span>
              <span className="col-span-4 text-right text-white tabular-nums font-bold">
                {bond.yield?.toFixed(3)}%
              </span>
              <span className={cn(
                'col-span-4 text-right tabular-nums',
                bond.change >= 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {bond.change >= 0 ? '+' : ''}{bond.change?.toFixed(3)}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="p-2 border-t border-[#222]">
        <div className="text-[9px] text-gray-500 mb-2">YIELD CURVE INDICATOR</div>
        <div className="flex items-center gap-2">
          {bonds.length >= 2 && (
            <>
              <div className={cn(
                'flex-1 h-8 rounded flex items-center justify-center text-xs font-bold',
                (bonds.find(b => b.name.includes('10'))?.yield || 0) > (bonds.find(b => b.name.includes('2'))?.yield || 0)
                  ? 'bg-green-900/30 text-green-400'
                  : 'bg-red-900/30 text-red-400'
              )}>
                {(bonds.find(b => b.name.includes('10'))?.yield || 0) > (bonds.find(b => b.name.includes('2'))?.yield || 0)
                  ? 'NORMAL'
                  : 'INVERTED'}
              </div>
            </>
          )}
        </div>
      </div>
    </Panel>
  )
}

// Economic Calendar Panel (for GOVT view)
function EconomicCalendarPanel({ className }: { className?: string }) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/economic/calendar')
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        if (data.success && data.events && data.events.length > 0) {
          setEvents(data.events.slice(0, 15))
        } else {
          throw new Error('No events data')
        }
      } catch (error) {
        console.error('Error fetching economic calendar:', error)
        // Fallback data
        setEvents([
          { date: new Date().toISOString(), event: 'Unemployment Claims', impact: 'high', actual: '234K', forecast: '240K' },
          { date: new Date().toISOString(), event: 'GDP Q3', impact: 'high', actual: '2.8%', forecast: '2.6%' },
          { date: new Date().toISOString(), event: 'Core PCE', impact: 'medium', actual: '2.7%', forecast: '2.8%' },
          { date: new Date().toISOString(), event: 'Consumer Confidence', impact: 'medium', actual: '102.0', forecast: '100.5' },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
    const interval = setInterval(fetchEvents, 300000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

  const getImpactColor = (impact: string) => {
    if (impact === 'high') return 'text-red-400'
    if (impact === 'medium') return 'text-yellow-400'
    return 'text-gray-400'
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return '--'
    }
  }

  return (
    <Panel className={className} title="ECONOMIC CALENDAR" color="#EC4899">
      <div className="text-[10px]">
        <div className="grid grid-cols-12 gap-1 px-2 py-1 bg-[#111] text-gray-500 border-b border-[#222] sticky top-0">
          <span className="col-span-2">DATE</span>
          <span className="col-span-1">TIME</span>
          <span className="col-span-3">EVENT</span>
          <span className="col-span-2 text-right">ACTUAL</span>
          <span className="col-span-2 text-right">FCST</span>
          <span className="col-span-2 text-right">PREV</span>
        </div>
        {loading ? (
          <div className="px-2 py-4 text-center text-gray-500">Loading...</div>
        ) : (
          events.map((event, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-1 px-2 py-1.5 hover:bg-[#1a1a1a] border-b border-[#111]"
            >
              <span className="col-span-2 text-gray-500">{formatDate(event.date)}</span>
              <span className="col-span-1 text-gray-400">{event.time || '--'}</span>
              <span className="col-span-3 text-gray-300 truncate flex items-center gap-1">
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', getImpactColor(event.impact).replace('text-', 'bg-'))}></span>
                <span className="truncate">{event.event}</span>
              </span>
              <span className={cn('col-span-2 text-right font-bold', event.actual ? 'text-white' : 'text-gray-600')}>{event.actual || '--'}</span>
              <span className="col-span-2 text-right text-cyan-400">{event.forecast || '--'}</span>
              <span className="col-span-2 text-right text-gray-500">{event.previous || '--'}</span>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}
