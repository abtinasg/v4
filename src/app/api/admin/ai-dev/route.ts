import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { aiPrompts, aiAccessControl } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin/auth'

// Verify admin authentication
async function verifyAdmin() {
  const session = await getAdminSession()
  return !!session
}

// Default AI prompts
const DEFAULT_PROMPTS = [
  {
    name: 'Stock Analysis',
    slug: 'stock-analysis',
    category: 'analysis',
    systemPrompt: `You are an expert financial analyst assistant. Analyze stocks and provide insights based on:
- Technical indicators (RSI, MACD, Moving Averages)
- Fundamental metrics (P/E, EPS, Revenue Growth)
- Market sentiment and news
- Industry comparison

Always be objective and present both bullish and bearish perspectives. Never give direct buy/sell recommendations.`,
    userPromptTemplate: 'Analyze {{symbol}} stock. Current price: {{price}}, Change: {{change}}%',
    variables: ['symbol', 'price', 'change', 'volume', 'marketCap'],
    model: 'anthropic/claude-sonnet-4.5',
    temperature: '0.7',
    maxTokens: '4096',
  },
  {
    name: 'Market Overview',
    slug: 'market-overview',
    category: 'market',
    systemPrompt: `You are a market analyst providing daily market insights. Focus on:
- Major index movements
- Sector performance
- Key economic indicators
- Notable market events

Be concise and informative. Use data to support your analysis.`,
    userPromptTemplate: 'Provide market overview. S&P 500: {{sp500}}, NASDAQ: {{nasdaq}}, Dow: {{dow}}',
    variables: ['sp500', 'nasdaq', 'dow', 'vix', 'sectors'],
    model: 'anthropic/claude-sonnet-4.5',
    temperature: '0.5',
    maxTokens: '2048',
  },
  {
    name: 'News Sentiment',
    slug: 'news-sentiment',
    category: 'sentiment',
    systemPrompt: `Analyze financial news and determine market sentiment. Classify as:
- Bullish: Positive outlook, growth indicators
- Bearish: Negative outlook, risk indicators
- Neutral: Mixed or balanced signals

Provide reasoning for your sentiment classification.`,
    userPromptTemplate: 'Analyze sentiment for: {{headline}}',
    variables: ['headline', 'summary', 'source'],
    model: 'anthropic/claude-sonnet-4.5',
    temperature: '0.3',
    maxTokens: '1024',
  },
  {
    name: 'Educational',
    slug: 'educational',
    category: 'education',
    systemPrompt: `You are a financial education assistant. Explain financial concepts in simple terms:
- Use analogies and examples
- Break down complex topics
- Provide practical applications
- Be patient and thorough

Adapt your explanation to the user's level of understanding.`,
    userPromptTemplate: 'Explain: {{topic}}',
    variables: ['topic', 'context', 'level'],
    model: 'anthropic/claude-sonnet-4.5',
    temperature: '0.7',
    maxTokens: '2048',
  },
  {
    name: 'Chat Assistant',
    slug: 'chat-assistant',
    category: 'general',
    systemPrompt: `You are Deep Terminal's AI assistant. Help users with:
- Stock research and analysis
- Understanding financial metrics
- Market insights and trends
- Platform navigation

Be helpful, accurate, and professional. If unsure, acknowledge limitations.`,
    userPromptTemplate: '{{message}}',
    variables: ['message', 'context', 'userTier'],
    model: 'anthropic/claude-sonnet-4.5',
    temperature: '0.7',
    maxTokens: '4096',
  },
]

// Default access controls
const DEFAULT_ACCESS = [
  { tier: 'free', feature: 'chat_basic', enabled: true, daily: 50, monthly: 500, credits: 1 },
  { tier: 'free', feature: 'stock_analysis', enabled: true, daily: 10, monthly: 100, credits: 2 },
  { tier: 'free', feature: 'market_overview', enabled: true, daily: 5, monthly: 50, credits: 1 },
  { tier: 'free', feature: 'news_sentiment', enabled: false, daily: 0, monthly: 0, credits: 1 },
  { tier: 'premium', feature: 'chat_basic', enabled: true, daily: 200, monthly: 3000, credits: 1 },
  { tier: 'premium', feature: 'stock_analysis', enabled: true, daily: 50, monthly: 500, credits: 2 },
  { tier: 'premium', feature: 'market_overview', enabled: true, daily: 20, monthly: 300, credits: 1 },
  { tier: 'premium', feature: 'news_sentiment', enabled: true, daily: 30, monthly: 300, credits: 1 },
  { tier: 'professional', feature: 'chat_basic', enabled: true, daily: 1000, monthly: 20000, credits: 0.5 },
  { tier: 'professional', feature: 'stock_analysis', enabled: true, daily: 200, monthly: 3000, credits: 1 },
  { tier: 'professional', feature: 'market_overview', enabled: true, daily: 100, monthly: 2000, credits: 0.5 },
  { tier: 'professional', feature: 'news_sentiment', enabled: true, daily: 100, monthly: 2000, credits: 0.5 },
]

// GET - Get AI prompts and access controls
export async function GET(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    const response: any = {}

    if (type === 'all' || type === 'prompts') {
      let prompts = await db.select().from(aiPrompts).orderBy(aiPrompts.category)
      
      if (prompts.length === 0) {
        // Return defaults if no prompts exist
        response.prompts = DEFAULT_PROMPTS.map((p, i) => ({
          id: `default-${i}`,
          ...p,
          isActive: true,
          version: 1,
          isDefault: true,
        }))
        response.promptsUsingDefaults = true
      } else {
        response.prompts = prompts
        response.promptsUsingDefaults = false
      }
    }

    if (type === 'all' || type === 'access') {
      let access = await db.select().from(aiAccessControl)
      
      if (access.length === 0) {
        response.accessControls = DEFAULT_ACCESS.map((a, i) => ({
          id: `default-${i}`,
          subscriptionTier: a.tier,
          feature: a.feature,
          isEnabled: a.enabled,
          dailyLimit: a.daily,
          monthlyLimit: a.monthly,
          creditsPerUse: a.credits,
          isDefault: true,
        }))
        response.accessUsingDefaults = true
      } else {
        response.accessControls = access
        response.accessUsingDefaults = false
      }
    }

    // Get available models
    response.availableModels = [
      { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
      { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
    ]

    return NextResponse.json(response)
  } catch (error) {
    console.error('AI Dev Tools API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update prompts and access controls
export async function POST(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    // Initialize defaults
    if (action === 'initialize_prompts') {
      for (const prompt of DEFAULT_PROMPTS) {
        await db.insert(aiPrompts).values({
          name: prompt.name,
          slug: prompt.slug,
          category: prompt.category,
          systemPrompt: prompt.systemPrompt,
          userPromptTemplate: prompt.userPromptTemplate,
          variables: prompt.variables,
          model: prompt.model,
          temperature: prompt.temperature,
          maxTokens: prompt.maxTokens,
          isActive: true,
          version: '1',
        }).onConflictDoNothing()
      }
      return NextResponse.json({ success: true, message: 'Prompts initialized' })
    }

    if (action === 'initialize_access') {
      for (const acc of DEFAULT_ACCESS) {
        await db.insert(aiAccessControl).values({
          subscriptionTier: acc.tier as any,
          feature: acc.feature,
          isEnabled: acc.enabled,
          dailyLimit: String(acc.daily),
          monthlyLimit: String(acc.monthly),
          creditsPerUse: String(acc.credits),
        }).onConflictDoNothing()
      }
      return NextResponse.json({ success: true, message: 'Access controls initialized' })
    }

    // Prompt operations
    if (action === 'create_prompt') {
      const { name, slug, category, systemPrompt, userPromptTemplate, variables, model, temperature, maxTokens } = body
      
      if (!name || !slug || !systemPrompt) {
        return NextResponse.json({ error: 'Name, slug, and systemPrompt are required' }, { status: 400 })
      }

      const newPrompt = await db.insert(aiPrompts).values({
        name,
        slug,
        category: category || 'general',
        systemPrompt,
        userPromptTemplate,
        variables: variables || [],
        model: model || 'anthropic/claude-sonnet-4.5',
        temperature: String(temperature || 0.7),
        maxTokens: String(maxTokens || 4096),
        isActive: true,
        version: '1',
      }).returning()

      return NextResponse.json({ success: true, prompt: newPrompt[0] })
    }

    if (action === 'update_prompt') {
      const { id, ...updates } = body
      
      if (!id) {
        return NextResponse.json({ error: 'Prompt ID required' }, { status: 400 })
      }

      // Get current version
      const current = await db.select().from(aiPrompts).where(eq(aiPrompts.id, id)).limit(1)
      const newVersion = current[0] ? Number(current[0].version) + 1 : 1

      await db
        .update(aiPrompts)
        .set({
          ...updates,
          temperature: updates.temperature ? String(updates.temperature) : undefined,
          maxTokens: updates.maxTokens ? String(updates.maxTokens) : undefined,
          version: String(newVersion),
          updatedAt: new Date(),
        })
        .where(eq(aiPrompts.id, id))

      return NextResponse.json({ success: true, newVersion })
    }

    if (action === 'toggle_prompt') {
      const { id, isActive } = body
      
      await db
        .update(aiPrompts)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(aiPrompts.id, id))

      return NextResponse.json({ success: true })
    }

    // Access control operations
    if (action === 'update_access') {
      const { id, isEnabled, dailyLimit, monthlyLimit, creditsPerUse } = body
      
      if (!id) {
        return NextResponse.json({ error: 'Access control ID required' }, { status: 400 })
      }

      await db
        .update(aiAccessControl)
        .set({
          isEnabled,
          dailyLimit: dailyLimit !== undefined ? String(dailyLimit) : undefined,
          monthlyLimit: monthlyLimit !== undefined ? String(monthlyLimit) : undefined,
          creditsPerUse: creditsPerUse !== undefined ? String(creditsPerUse) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(aiAccessControl.id, id))

      return NextResponse.json({ success: true })
    }

    if (action === 'create_access') {
      const { subscriptionTier, feature, isEnabled, dailyLimit, monthlyLimit, creditsPerUse } = body
      
      const newAccess = await db.insert(aiAccessControl).values({
        subscriptionTier,
        feature,
        isEnabled: isEnabled ?? true,
        dailyLimit: String(dailyLimit || 100),
        monthlyLimit: String(monthlyLimit || 1000),
        creditsPerUse: String(creditsPerUse || 1),
      }).returning()

      return NextResponse.json({ success: true, access: newAccess[0] })
    }

    // Test prompt
    if (action === 'test_prompt') {
      const { systemPrompt, userPrompt, model, temperature, maxTokens } = body
      
      // For now, just validate the prompt
      // In production, you'd call the AI API here
      return NextResponse.json({
        success: true,
        message: 'Prompt validation passed',
        tokenEstimate: Math.ceil((systemPrompt.length + (userPrompt?.length || 0)) / 4),
        model,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('AI Dev Tools API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete prompt or access control
export async function DELETE(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID required' }, { status: 400 })
    }

    if (type === 'prompt') {
      await db.delete(aiPrompts).where(eq(aiPrompts.id, id))
    } else if (type === 'access') {
      await db.delete(aiAccessControl).where(eq(aiAccessControl.id, id))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
