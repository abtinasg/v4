/**
 * AI Chat API Endpoint
 * 
 * POST /api/chat
 * Request: { messages, context, stockData? }
 * Response: Streaming SSE
 */

import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  OpenRouterClient, 
  ChatMessage, 
  OpenRouterError,
  DEFAULT_MODEL,
  OPENROUTER_MODELS,
  estimateMessageTokens,
  type OpenRouterModel 
} from '@/lib/ai/openrouter'

// Helper to get display name for model
function getModelDisplayName(model: string): string {
  const modelInfo = OPENROUTER_MODELS[model as keyof typeof OPENROUTER_MODELS]
  return modelInfo?.name || model.split('/').pop() || model
}
import { buildSystemPrompt, type PromptContext } from '@/lib/ai/prompts'
import { 
  buildFullContext, 
  type AIContext, 
  type StockContext,
  type MarketContext,
  type PortfolioContext,
  type NewsPageContext,
  type TerminalContext,
} from '@/lib/ai/context-builder'

// ============================================================
// RATE LIMITING
// ============================================================

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = {
  FREE: { requests: 10, windowMs: 60 * 1000 }, // 10 req/min
  PREMIUM: { requests: 30, windowMs: 60 * 1000 }, // 30 req/min
  PROFESSIONAL: { requests: 100, windowMs: 60 * 1000 }, // 100 req/min
  ENTERPRISE: { requests: 500, windowMs: 60 * 1000 }, // 500 req/min
}

type SubscriptionTier = keyof typeof RATE_LIMIT

function checkRateLimit(userId: string, tier: SubscriptionTier = 'FREE'): {
  allowed: boolean
  remaining: number
  resetIn: number
} {
  const now = Date.now()
  const limit = RATE_LIMIT[tier]
  const key = `${userId}:${tier}`
  
  const existing = rateLimitMap.get(key)
  
  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + limit.windowMs })
    return { allowed: true, remaining: limit.requests - 1, resetIn: limit.windowMs }
  }
  
  if (existing.count >= limit.requests) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: existing.resetTime - now 
    }
  }
  
  existing.count++
  return { 
    allowed: true, 
    remaining: limit.requests - existing.count, 
    resetIn: existing.resetTime - now 
  }
}

// ============================================================
// REQUEST VALIDATION
// ============================================================

interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  context?: {
    type?: PromptContext
    stock?: StockContext
    market?: MarketContext
    portfolio?: PortfolioContext
    newsContext?: NewsPageContext
    terminalContext?: TerminalContext
    economicIndicators?: {
      gdp?: { value: number | null; change: number | null }
      unemployment?: { value: number | null; change: number | null }
      inflation?: { value: number | null; change: number | null }
      federalFundsRate?: { value: number | null; change: number | null }
      consumerConfidence?: { value: number | null; change: number | null }
      manufacturingPmi?: { value: number | null; change: number | null }
      servicesPmi?: { value: number | null; change: number | null }
    }
    pageContext?: {
      currentPage: string
      selectedTimeframe?: string
      selectedMetricCategory?: string
    }
  }
  stockData?: StockContext // Legacy support
  model?: OpenRouterModel
  stream?: boolean
}

function validateRequest(body: unknown): { valid: true; data: ChatRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }
  
  const data = body as ChatRequest
  
  if (!Array.isArray(data.messages) || data.messages.length === 0) {
    return { valid: false, error: 'Messages array is required and must not be empty' }
  }
  
  for (const msg of data.messages) {
    if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
      return { valid: false, error: 'Each message must have a valid role (user or assistant)' }
    }
    if (typeof msg.content !== 'string' || msg.content.trim().length === 0) {
      return { valid: false, error: 'Each message must have non-empty content' }
    }
  }
  
  // Limit message count to prevent abuse
  if (data.messages.length > 50) {
    return { valid: false, error: 'Too many messages (max 50)' }
  }
  
  // Limit individual message length
  for (const msg of data.messages) {
    if (msg.content.length > 10000) {
      return { valid: false, error: 'Message content too long (max 10000 characters)' }
    }
  }
  
  return { valid: true, data }
}

// ============================================================
// STREAM ENCODER
// ============================================================

function createSSEEncoder() {
  const encoder = new TextEncoder()
  
  return {
    encode(data: string): Uint8Array {
      return encoder.encode(`data: ${data}\n\n`)
    },
    encodeError(error: string): Uint8Array {
      return encoder.encode(`data: ${JSON.stringify({ error })}\n\n`)
    },
    encodeDone(): Uint8Array {
      return encoder.encode('data: [DONE]\n\n')
    }
  }
}

// ============================================================
// MAIN HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const { userId } = await auth()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // 2. Rate limiting
    // TODO: Fetch actual subscription tier from database
    const subscriptionTier: SubscriptionTier = 'FREE'
    const rateLimit = checkRateLimit(userId, subscriptionTier)
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          resetIn: Math.ceil(rateLimit.resetIn / 1000) 
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000))
          } 
        }
      )
    }
    
    // 3. Parse and validate request
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const validation = validateRequest(body)
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const { messages, context, stockData, model, stream = true } = validation.data
    
    // 4. Build AI context
    const aiContext: AIContext = {
      type: context?.type || 'general',
      stock: context?.stock || stockData,
      market: context?.market,
      portfolio: context?.portfolio,
      newsContext: context?.newsContext,
      terminalContext: context?.terminalContext,
      economicIndicators: (context as any)?.economicIndicators,
      pageContext: context?.pageContext,
    }
    
    // Get last user message for context inference
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content
    
    const { promptContext, contextString } = buildFullContext(aiContext, lastUserMessage)
    
    // 5. Build system prompt with context
    const systemPrompt = buildSystemPrompt({
      context: promptContext,
      stockSymbol: aiContext.stock?.symbol,
      stockData: aiContext.stock,
      marketData: aiContext.market,
    })
    
    // 6. Prepare messages for AI
    const aiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ]
    
    // Add context if available
    if (contextString) {
      aiMessages.push({
        role: 'system',
        content: `Here is the current data context:\n\n${contextString}`
      })
    }
    
    // Add conversation history
    for (const msg of messages) {
      aiMessages.push({
        role: msg.role,
        content: msg.content
      })
    }
    
    // 7. Estimate tokens and check limits
    const estimatedTokens = estimateMessageTokens(aiMessages)
    if (estimatedTokens > 100000) {
      return new Response(
        JSON.stringify({ error: 'Context too large. Please start a new conversation.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // 8. Initialize OpenRouter client
    const client = new OpenRouterClient()
    
    // 9. Handle streaming or non-streaming response
    if (stream) {
      // Streaming response
      const sseEncoder = createSSEEncoder()
      const selectedModel = model || DEFAULT_MODEL
      
      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            // Send model info first
            controller.enqueue(sseEncoder.encode(JSON.stringify({ 
              model: selectedModel,
              modelName: getModelDisplayName(selectedModel)
            })))
            
            const generator = client.streamWithFallback({
              model: selectedModel,
              messages: aiMessages,
              maxTokens: 4096,
              temperature: 0.7,
            })
            
            for await (const chunk of generator) {
              controller.enqueue(sseEncoder.encode(JSON.stringify({ content: chunk })))
            }
            
            controller.enqueue(sseEncoder.encodeDone())
            controller.close()
          } catch (error) {
            const errorMessage = error instanceof OpenRouterError 
              ? error.message 
              : 'An error occurred while generating the response'
            
            controller.enqueue(sseEncoder.encodeError(errorMessage))
            controller.close()
          }
        }
      })
      
      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        }
      })
    } else {
      // Non-streaming response
      try {
        const response = await client.chatWithFallback({
          model: model || DEFAULT_MODEL,
          messages: aiMessages,
          maxTokens: 4096,
          temperature: 0.7,
        })
        
        return new Response(
          JSON.stringify({
            message: response.choices[0]?.message.content || '',
            usage: response.usage,
            model: response.model,
          }),
          { 
            status: 200, 
            headers: { 
              'Content-Type': 'application/json',
              'X-RateLimit-Remaining': String(rateLimit.remaining),
            } 
          }
        )
      } catch (error) {
        const errorMessage = error instanceof OpenRouterError 
          ? error.message 
          : 'An error occurred while generating the response'
        
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
  } catch (error) {
    console.error('Chat API error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// ============================================================
// OPTIONS handler for CORS
// ============================================================

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}
