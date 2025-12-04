/**
 * AI Chat API Endpoint
 * 
 * POST /api/chat
 * Request: { messages, context, stockData? }
 * Response: Streaming SSE
 * 
 * Supports function calling for real-time FMP data fetching
 */

import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { 
  checkCredits, 
  deductCredits, 
  checkRateLimit,
  checkAndResetMonthlyCredits,
  CREDIT_COSTS,
} from '@/lib/credits'
import { 
  OpenRouterClient, 
  ChatMessage, 
  OpenRouterError,
  DEFAULT_MODEL,
  OPENROUTER_MODELS,
  estimateMessageTokens,
  type OpenRouterModel,
  type ToolCall,
} from '@/lib/ai/openrouter'
import { AI_TOOLS, executeAITool, formatToolResult } from '@/lib/ai/tools'

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
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 2. Find internal user and check credits
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check and reset monthly credits if needed
    await checkAndResetMonthlyCredits(user.id)

    // 3. Rate limiting with credit system
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 'unknown'
    
    const rateLimitResult = await checkRateLimit(
      { userId: user.id, ipAddress },
      '/api/chat'
    )
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please slow down.', 
          retryAfter: rateLimitResult.retryAfter 
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
            'Retry-After': String(rateLimitResult.retryAfter || 60)
          } 
        }
      )
    }

    // 4. Check credits for chat
    const creditCheck = await checkCredits(user.id, 'chat_message')
    
    if (!creditCheck.success) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'insufficient_credits',
          message: 'You do not have enough credits for this action. Please purchase more credits.',
          details: {
            currentBalance: creditCheck.currentBalance,
            requiredCredits: creditCheck.requiredCredits,
            shortfall: creditCheck.requiredCredits - creditCheck.currentBalance,
            action: 'chat_message',
          },
          links: {
            pricing: '/pricing',
            credits: '/dashboard/settings/credits',
          },
        }),
        { 
          status: 402, 
          headers: { 
            'Content-Type': 'application/json',
            'X-Credit-Balance': String(creditCheck.currentBalance),
            'X-Credit-Required': String(creditCheck.requiredCredits),
          } 
        }
      )
    }
    
    // 5. Parse and validate request
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
      userRiskProfile: (context as any)?.userRiskProfile,
      pageContext: context?.pageContext,
    }
    
    // Debug log for news context
    if (aiContext.newsContext) {
      console.log('📰 API received news context:', {
        newsCount: aiContext.newsContext.recentNews?.length || 0,
        sentimentBreakdown: aiContext.newsContext.sentimentBreakdown,
        sampleHeadline: aiContext.newsContext.recentNews?.[0]?.headline
      })
    }
    
    // Get last user message for context inference
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content
    
    const { promptContext, contextString } = buildFullContext(aiContext, lastUserMessage)
    
    // 5. Build system prompt with ALL available context data
    const systemPrompt = buildSystemPrompt({
      context: promptContext,
      stockSymbol: aiContext.stock?.symbol,
      stockData: aiContext.stock,
      marketData: aiContext.market,
      terminalContext: aiContext.terminalContext,
      economicIndicators: aiContext.economicIndicators,
      portfolioData: aiContext.portfolio,
      newsContext: aiContext.newsContext,
      userRiskProfile: (aiContext as any).userRiskProfile,
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
            
            // Deduct credits after successful streaming
            await deductCredits(user.id, 'chat_message', {
              apiEndpoint: '/api/chat',
            })
            
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
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        }
      })
    } else {
      // Non-streaming response with tool calling support
      try {
        const selectedModel = model || DEFAULT_MODEL
        let currentMessages = [...aiMessages]
        let finalResponse: any = null
        let iterations = 0
        const MAX_TOOL_ITERATIONS = 3 // Prevent infinite loops

        // Tool calling loop
        while (iterations < MAX_TOOL_ITERATIONS) {
          iterations++
          
          const response = await client.chatWithFallback({
            model: selectedModel,
            messages: currentMessages,
            maxTokens: 4096,
            temperature: 0.7,
            tools: AI_TOOLS,
            toolChoice: 'auto',
          })

          const choice = response.choices[0]
          
          // Check if AI wants to call tools
          if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
            console.log(`[Chat] AI requested ${choice.message.tool_calls.length} tool calls`)
            
            // Add assistant's tool call message
            currentMessages.push({
              role: 'assistant',
              content: choice.message.content || '',
            })

            // Execute each tool and add results
            for (const toolCall of choice.message.tool_calls) {
              const args = JSON.parse(toolCall.function.arguments)
              console.log(`[Chat] Executing tool: ${toolCall.function.name}`, args)
              
              const result = await executeAITool(toolCall.function.name, args)
              const formattedResult = formatToolResult(toolCall.function.name, result)
              
              // Add tool result as user message (tool response format)
              currentMessages.push({
                role: 'user',
                content: `[Tool Result for ${toolCall.function.name}]: ${formattedResult}`,
              })
            }
            
            // Continue the loop to get AI's final response with tool results
            continue
          }
          
          // No more tool calls, we have the final response
          finalResponse = response
          break
        }

        if (!finalResponse) {
          throw new Error('Failed to get final response after tool calls')
        }
        
        // Deduct credits after successful response
        await deductCredits(user.id, 'chat_message', {
          apiEndpoint: '/api/chat',
        })
        
        return new Response(
          JSON.stringify({
            message: finalResponse.choices[0]?.message.content || '',
            usage: finalResponse.usage,
            model: finalResponse.model,
          }),
          { 
            status: 200, 
            headers: { 
              'Content-Type': 'application/json',
              'X-RateLimit-Remaining': String(rateLimitResult.remaining),
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
