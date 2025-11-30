'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Shield, 
  Key, 
  Globe, 
  Bell,
  Lock,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  Coins,
  Gauge,
  Bot,
  RefreshCw,
  Zap,
  Clock,
  ChevronRight,
  Database,
  FileCode,
  ExternalLink,
  Eye,
  X,
  Copy,
  Check
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Import actual configurations from the codebase
import { 
  CREDIT_COSTS, 
  RATE_LIMITS, 
  CREDIT_CONFIG,
  CREDIT_REQUIRED_ENDPOINTS,
  RATE_LIMIT_EXEMPT_ENDPOINTS,
  DEFAULT_CREDIT_PACKAGES
} from '@/lib/credits/config'

// Import actual AI prompts
import {
  GENERAL_FINANCIAL_ANALYSIS,
  STOCK_ANALYSIS,
  METRIC_EXPLANATION,
  MARKET_OVERVIEW,
  PORTFOLIO_ADVICE,
  TECHNICAL_ANALYSIS,
  NEWS_ANALYSIS,
} from '@/lib/ai/prompts'

// AI Prompts with actual content
const AI_PROMPTS = [
  { name: 'GENERAL_FINANCIAL_ANALYSIS', category: 'general', file: 'lib/ai/prompts.ts', description: 'General financial analysis for open-ended questions', content: GENERAL_FINANCIAL_ANALYSIS },
  { name: 'STOCK_ANALYSIS', category: 'analysis', file: 'lib/ai/prompts.ts', description: 'Comprehensive stock analysis with financial metrics & valuation', content: STOCK_ANALYSIS },
  { name: 'METRIC_EXPLANATION', category: 'education', file: 'lib/ai/prompts.ts', description: 'Financial metric explanations with examples', content: METRIC_EXPLANATION },
  { name: 'MARKET_OVERVIEW', category: 'market', file: 'lib/ai/prompts.ts', description: 'Market indices, sectors, economic indicators', content: MARKET_OVERVIEW },
  { name: 'PORTFOLIO_ADVICE', category: 'portfolio', file: 'lib/ai/prompts.ts', description: 'Portfolio allocation & diversification guidance', content: PORTFOLIO_ADVICE },
  { name: 'TECHNICAL_ANALYSIS', category: 'technical', file: 'lib/ai/prompts.ts', description: 'Technical analysis with RSI, MACD, patterns', content: TECHNICAL_ANALYSIS },
  { name: 'NEWS_ANALYSIS', category: 'sentiment', file: 'lib/ai/prompts.ts', description: 'News impact analysis & market sentiment', content: NEWS_ANALYSIS },
]

// Context functions (no content to show)
const AI_CONTEXT_FUNCTIONS = [
  { name: 'buildContextSystemPrompt', category: 'context', file: 'lib/ai/context-prompts.ts', description: 'Dynamic context-aware prompt builder' },
  { name: 'generateSuggestedQuestions', category: 'context', file: 'lib/ai/context-prompts.ts', description: 'AI-generated follow-up questions' },
  { name: 'detectContextType', category: 'context', file: 'lib/ai/context-prompts.ts', description: 'Auto-detect context from user data' },
]

interface SelectedPrompt {
  name: string
  content: string
  category: string
  description: string
}

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'credits' | 'limits' | 'ai' | 'endpoints'>('overview')
  const [selectedPrompt, setSelectedPrompt] = useState<SelectedPrompt | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">System configuration & current settings</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            Settings saved!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-slate-700/50 pb-4">
        {[
          { id: 'overview', label: 'Overview', icon: Settings },
          { id: 'credits', label: 'Credit System', icon: Coins },
          { id: 'limits', label: 'Rate Limits', icon: Gauge },
          { id: 'endpoints', label: 'Endpoints', icon: Globe },
          { id: 'ai', label: 'AI Prompts', icon: Bot },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-400"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Admin Credentials Info */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-400">Admin Credentials</h4>
              <p className="text-sm text-amber-300/70 mt-1">
                Admin username and password are configured via environment variables. 
                To change them, update <code className="bg-amber-500/20 px-1 rounded">ADMIN_USERNAME</code> and <code className="bg-amber-500/20 px-1 rounded">ADMIN_PASSWORD</code> in your <code className="bg-amber-500/20 px-1 rounded">.env</code> file.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Settings */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription>Security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-medium text-white">JWT Session</p>
                      <p className="text-xs text-slate-400">24 hour expiration</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">HTTP-Only Cookies</p>
                      <p className="text-xs text-slate-400">Secure session storage</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">Enabled</Badge>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-medium text-white">CSRF Protection</p>
                      <p className="text-xs text-slate-400">Cross-site request forgery</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="w-5 h-5" />
                Environment Variables
              </CardTitle>
              <CardDescription>Required admin environment variables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">ADMIN_USERNAME</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="text" 
                    value="••••••••" 
                    disabled 
                    className="bg-slate-900/50 border-slate-700"
                  />
                  <Badge variant="outline" className="shrink-0">Required</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">ADMIN_PASSWORD</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="password" 
                    value="••••••••" 
                    disabled 
                    className="bg-slate-900/50 border-slate-700"
                  />
                  <Badge variant="outline" className="shrink-0">Required</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">ADMIN_JWT_SECRET</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="password" 
                    value="••••••••••••••••" 
                    disabled 
                    className="bg-slate-900/50 border-slate-700"
                  />
                  <Badge variant="outline" className="shrink-0">Optional</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                API Status
              </CardTitle>
              <CardDescription>External API connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Clerk Auth', status: 'connected' },
                { name: 'Neon Database', status: 'connected' },
                { name: 'OpenRouter AI', status: 'connected' },
                { name: 'Polygon API', status: 'configured' },
                { name: 'Alpha Vantage', status: 'configured' },
              ].map((api) => (
                <div key={api.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                  <span className="text-white">{api.name}</span>
                  <Badge className={api.status === 'connected' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-blue-500/20 text-blue-400'
                  }>
                    {api.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/credits">
                <Button variant="outline" className="w-full justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Manage Credits
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/admin/rate-limits">
                <Button variant="outline" className="w-full justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Configure Rate Limits
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/admin/ai-dev">
                <Button variant="outline" className="w-full justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    AI Dev Tools
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <AlertTriangle className="w-4 h-4" />
                Clear Chat History
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Credit Costs Tab */}
      {activeTab === 'credits' && (
        <div className="space-y-6">
          {/* Credit Configuration */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                Credit Configuration
              </CardTitle>
              <CardDescription>Global credit system configuration (sourced from config.ts)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-4 rounded-xl bg-slate-700/30 text-center">
                  <p className="text-2xl font-bold text-cyan-400">{CREDIT_CONFIG.initialFreeCredits}</p>
                  <p className="text-xs text-slate-400 mt-1">Initial Free Credits</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-700/30 text-center">
                  <p className="text-2xl font-bold text-green-400">{CREDIT_CONFIG.lowCreditThreshold}</p>
                  <p className="text-xs text-slate-400 mt-1">Low Credit Threshold</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-700/30 text-center">
                  <p className="text-2xl font-bold text-amber-400">{CREDIT_CONFIG.freeCreditExpiryDays}</p>
                  <p className="text-xs text-slate-400 mt-1">Expiry Days</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-700/30 text-center">
                  <p className="text-2xl font-bold text-purple-400">{(CREDIT_CONFIG.maxCreditBalance / 1000000).toFixed(0)}M</p>
                  <p className="text-xs text-slate-400 mt-1">Max Balance</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-700/30 text-center">
                  <p className="text-2xl font-bold text-blue-400">{Object.keys(CREDIT_COSTS).length}</p>
                  <p className="text-xs text-slate-400 mt-1">Total Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Costs */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Credit Costs per Action
              </CardTitle>
              <CardDescription>Credit consumption per action (CREDIT_COSTS)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(CREDIT_COSTS).map(([action, cost]) => (
                  <div 
                    key={action} 
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30"
                  >
                    <span className="text-slate-300 text-sm">{action.replace(/_/g, ' ')}</span>
                    <Badge className={cn(
                      "font-mono",
                      cost <= 5 && "bg-green-500/20 text-green-400",
                      cost > 5 && cost <= 15 && "bg-amber-500/20 text-amber-400",
                      cost > 15 && "bg-red-500/20 text-red-400",
                    )}>
                      {cost} credits
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Free Credits */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Monthly Free Credits by Tier
              </CardTitle>
              <CardDescription>Monthly free credits allocated to each plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(CREDIT_CONFIG.monthlyFreeCredits).map(([tier, credits]) => (
                  <div 
                    key={tier} 
                    className={cn(
                      "p-4 rounded-xl text-center",
                      tier === 'free' && "bg-slate-700/30",
                      tier === 'premium' && "bg-cyan-500/10 border border-cyan-500/20",
                      tier === 'professional' && "bg-violet-500/10 border border-violet-500/20",
                      tier === 'enterprise' && "bg-amber-500/10 border border-amber-500/20",
                    )}
                  >
                    <p className={cn(
                      "text-2xl font-bold",
                      tier === 'free' && "text-slate-300",
                      tier === 'premium' && "text-cyan-400",
                      tier === 'professional' && "text-violet-400",
                      tier === 'enterprise' && "text-amber-400",
                    )}>
                      {credits.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 capitalize">{tier}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rate Limits Tab */}
      {activeTab === 'limits' && (
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gauge className="w-5 h-5 text-cyan-400" />
                Rate Limits by Subscription Tier
              </CardTitle>
              <CardDescription>Rate limiting constraints per subscription tier (RATE_LIMITS)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Tier</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Per Minute</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Per Hour</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Per Day</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Monthly Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(RATE_LIMITS).map(([tier, limits]) => (
                      <tr key={tier} className="border-b border-slate-700/50">
                        <td className="py-3 px-4">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            tier === 'free' && "bg-slate-600/50 text-slate-300",
                            tier === 'premium' && "bg-cyan-500/20 text-cyan-400",
                            tier === 'professional' && "bg-violet-500/20 text-violet-400",
                            tier === 'enterprise' && "bg-amber-500/20 text-amber-400",
                          )}>
                            {tier.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 text-white font-mono">{limits.requestsPerMinute}</td>
                        <td className="text-center py-3 px-4 text-white font-mono">{limits.requestsPerHour.toLocaleString()}</td>
                        <td className="text-center py-3 px-4 text-white font-mono">{limits.requestsPerDay.toLocaleString()}</td>
                        <td className="text-center py-3 px-4 text-white font-mono">
                          {limits.monthlyCredits === -1 ? '∞' : limits.monthlyCredits.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Link href="/admin/rate-limits">
              <Button className="gap-2">
                <Settings className="w-4 h-4" />
                Manage Rate Limits
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* AI Prompts Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* System Prompts with View Button */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-violet-400" />
                AI System Prompts
              </CardTitle>
              <CardDescription>Core AI system prompts – click “View” to inspect the full content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {AI_PROMPTS.map((prompt, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        prompt.category === 'analysis' && "bg-cyan-500/20",
                        prompt.category === 'market' && "bg-green-500/20",
                        prompt.category === 'sentiment' && "bg-amber-500/20",
                        prompt.category === 'education' && "bg-blue-500/20",
                        prompt.category === 'general' && "bg-violet-500/20",
                        prompt.category === 'technical' && "bg-rose-500/20",
                        prompt.category === 'portfolio' && "bg-emerald-500/20",
                      )}>
                        <Bot className={cn(
                          "w-5 h-5",
                          prompt.category === 'analysis' && "text-cyan-400",
                          prompt.category === 'market' && "text-green-400",
                          prompt.category === 'sentiment' && "text-amber-400",
                          prompt.category === 'education' && "text-blue-400",
                          prompt.category === 'general' && "text-violet-400",
                          prompt.category === 'technical' && "text-rose-400",
                          prompt.category === 'portfolio' && "text-emerald-400",
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{prompt.name}</p>
                        <p className="text-xs text-slate-400">{prompt.description}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <FileCode className="w-3 h-3" />
                          {prompt.file}
                          <span className="mx-2">•</span>
                          <span className="text-cyan-400">{prompt.content.length.toLocaleString()} chars</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPrompt({
                          name: prompt.name,
                          content: prompt.content,
                          category: prompt.category,
                          description: prompt.description,
                        })}
                        className="gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Context Functions */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Context Builder Functions</h4>
                <div className="space-y-2">
                  {AI_CONTEXT_FUNCTIONS.map((func, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-700/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/20">
                          <FileCode className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{func.name}()</p>
                          <p className="text-xs text-slate-400">{func.description}</p>
                        </div>
                      </div>
                      <Badge className="bg-indigo-500/20 text-indigo-400">Function</Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* AI Rules Summary */}
              <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  AI Rules & Restrictions (applies to every prompt)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <p className="text-red-400 font-medium">🚫 Prohibited:</p>
                    <p className="text-slate-400">❌ Direct buy/sell signals</p>
                    <p className="text-slate-400">❌ Price targets or predictions</p>
                    <p className="text-slate-400">❌ Guaranteed returns</p>
                    <p className="text-slate-400">❌ Margin/leverage advice</p>
                    <p className="text-slate-400">❌ Tax or legal guidance</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-emerald-400 font-medium">✅ Allowed:</p>
                    <p className="text-slate-400">✓ Financial metric analysis</p>
                    <p className="text-slate-400">✓ Concept education</p>
                    <p className="text-slate-400">✓ Industry benchmarking</p>
                    <p className="text-slate-400">✓ Bull vs. bear scenarios</p>
                    <p className="text-slate-400">✓ Educational technical analysis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Link href="/admin/ai-dev">
              <Button className="gap-2">
                <Bot className="w-4 h-4" />
                AI Dev Tools
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <div className="space-y-6">
          {/* Credit Required Endpoints */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                Credit Required Endpoints
              </CardTitle>
              <CardDescription>
                Endpoints requiring credits (CREDIT_REQUIRED_ENDPOINTS from config.ts)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(CREDIT_REQUIRED_ENDPOINTS).map(([endpoint, action]) => (
                  <div 
                    key={endpoint}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30"
                  >
                    <div>
                      <code className="text-cyan-400 text-sm">{endpoint}</code>
                      <p className="text-xs text-slate-500 mt-1">{action.replace(/_/g, ' ')}</p>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      {CREDIT_COSTS[action]} cr
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rate Limit Exempt Endpoints */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Rate Limit Exempt Endpoints
              </CardTitle>
              <CardDescription>
                Endpoints exempt from rate limiting (RATE_LIMIT_EXEMPT_ENDPOINTS)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {RATE_LIMIT_EXEMPT_ENDPOINTS.map((endpoint) => (
                  <Badge 
                    key={endpoint}
                    className="bg-green-500/20 text-green-400 font-mono"
                  >
                    {endpoint}/*
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Credit Packages */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Default Credit Packages
              </CardTitle>
              <CardDescription>
                Default purchasable credit bundles (DEFAULT_CREDIT_PACKAGES)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEFAULT_CREDIT_PACKAGES.map((pkg, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      pkg.isPopular 
                        ? "bg-cyan-500/10 border-cyan-500/30" 
                        : "bg-slate-700/30 border-slate-600/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{pkg.name}</h4>
                      {pkg.isPopular && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">Popular</Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white">${pkg.price}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {pkg.credits.toLocaleString()} credits
                      {pkg.bonusCredits > 0 && (
                        <span className="text-green-400"> + {pkg.bonusCredits.toLocaleString()} bonus</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Link href="/admin/credits">
              <Button className="gap-2">
                <Coins className="w-4 h-4" />
                Manage Credits
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Prompt View Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-xl bg-[#0a0d12] border border-white/10 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  selectedPrompt.category === 'analysis' && "bg-cyan-500/20",
                  selectedPrompt.category === 'market' && "bg-green-500/20",
                  selectedPrompt.category === 'sentiment' && "bg-amber-500/20",
                  selectedPrompt.category === 'education' && "bg-blue-500/20",
                  selectedPrompt.category === 'general' && "bg-violet-500/20",
                  selectedPrompt.category === 'technical' && "bg-rose-500/20",
                  selectedPrompt.category === 'portfolio' && "bg-emerald-500/20",
                )}>
                  <Bot className={cn(
                    "w-5 h-5",
                    selectedPrompt.category === 'analysis' && "text-cyan-400",
                    selectedPrompt.category === 'market' && "text-green-400",
                    selectedPrompt.category === 'sentiment' && "text-amber-400",
                    selectedPrompt.category === 'education' && "text-blue-400",
                    selectedPrompt.category === 'general' && "text-violet-400",
                    selectedPrompt.category === 'technical' && "text-rose-400",
                    selectedPrompt.category === 'portfolio' && "text-emerald-400",
                  )} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedPrompt.name}</h3>
                  <p className="text-sm text-slate-400">{selectedPrompt.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyPrompt(selectedPrompt.content)}
                  className="gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedPrompt(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-slate-700 text-slate-300">
                  {selectedPrompt.content.length.toLocaleString()} characters
                </Badge>
                <Badge className="bg-slate-700 text-slate-300">
                  ~{Math.round(selectedPrompt.content.length / 4).toLocaleString()} tokens
                </Badge>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900/50 p-4 rounded-lg border border-slate-700 leading-relaxed">
                {selectedPrompt.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}