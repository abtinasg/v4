/**
 * Abtin Psychologist AI Chat API Endpoint
 * 
 * POST /api/abtin/chat
 * Request: { messages, mode, model }
 * Response: Streaming SSE
 * 
 * Authentication: Basic Auth (username/password from env)
 * Modes: brainstorm, debate
 * Models: openai/gpt-5.1, anthropic/claude-sonnet-4.5, anthropic/claude-3.5-sonnet, openai/gpt-4o
 */

import { NextRequest } from 'next/server'
import { parseBasicAuth, verifyAbtinCredentials, createAuthChallenge } from '@/lib/auth/abtin-auth'
import { OpenRouterClient, ChatMessage, OpenRouterError } from '@/lib/ai/openrouter'

// Available AI models for the psychologist
// Using actual available models from OpenRouter
const PSYCHOLOGIST_MODELS = {
  'openai/gpt-5.1': 'OpenAI GPT-5.1',
  'anthropic/claude-sonnet-4.5': 'Anthropic Claude Sonnet 4.5',
  'anthropic/claude-3.5-sonnet': 'Anthropic Claude 3.5 Sonnet',
  'openai/gpt-4o': 'OpenAI GPT-4o',
} as const

type PsychologistModel = keyof typeof PSYCHOLOGIST_MODELS
type PsychologistMode = 'brainstorm' | 'debate'

interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    modelName?: string
  }>
  mode: PsychologistMode
  model?: PsychologistModel
  models?: PsychologistModel[]
  multiModel?: boolean
}

// System prompts for different modes
const SYSTEM_PROMPTS = {
  brainstorm: `You are an experienced psychologist specializing in creative thinking and problem-solving through brainstorming techniques. Your role is to:

1. Help users explore ideas freely without judgment
2. Encourage divergent thinking and multiple perspectives
3. Use techniques like mind mapping, lateral thinking, and free association
4. Build on ideas constructively and suggest innovative approaches
5. Create a safe, supportive environment for idea generation
6. Ask open-ended questions to expand thinking

Your approach should be warm, encouraging, and focused on generating as many ideas as possible. Help users overcome mental blocks and explore unconventional solutions.`,

  debate: `You are an experienced psychologist skilled in Socratic dialogue and critical thinking through constructive debate. Your role is to:

1. Challenge ideas respectfully to test their validity
2. Present counter-arguments and alternative viewpoints
3. Help users examine assumptions and biases
4. Encourage analytical and critical thinking
5. Use the Socratic method to guide discovery through questioning
6. Maintain a balanced, objective stance while being thought-provoking

Your approach should be intellectually rigorous but respectful, helping users refine their thinking through constructive challenge and deeper analysis.`,
}

// Multi-model system prompts - when models collaborate
const MULTI_MODEL_SYSTEM_PROMPTS = {
  brainstorm: `You are an experienced psychologist participating in a collaborative brainstorming session with other AI models. Your role is to:

1. Build upon and expand ideas presented by other models
2. Bring your unique perspective and approach to the discussion
3. Acknowledge good points made by others before adding your contribution
4. Encourage divergent thinking and explore new angles
5. Connect ideas in creative ways
6. Keep responses concise but insightful (2-4 paragraphs max)

Be collaborative and constructive. Reference what others have said and add value to the collective brainstorming process.`,

  debate: `You are an experienced psychologist participating in a structured debate with other AI models. Your role is to:

1. Critically analyze arguments presented by other models
2. Present counter-arguments or alternative perspectives
3. Challenge assumptions respectfully and rigorously
4. Support your points with logical reasoning
5. Acknowledge valid points while maintaining your position
6. Keep responses focused and well-structured (2-4 paragraphs max)

Be intellectually rigorous but respectful. Engage directly with points made by other models to create a dynamic, thought-provoking debate.`,
}

function validateRequest(body: unknown): { valid: true; data: ChatRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }
  
  const data = body as ChatRequest
  
  if (!Array.isArray(data.messages) || data.messages.length === 0) {
    return { valid: false, error: 'Messages array is required and must not be empty' }
  }
  
  if (!data.mode || !['brainstorm', 'debate'].includes(data.mode)) {
    return { valid: false, error: 'Mode must be either "brainstorm" or "debate"' }
  }
  
  for (const msg of data.messages) {
    if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
      return { valid: false, error: 'Each message must have a valid role (user or assistant)' }
    }
    if (typeof msg.content !== 'string' || msg.content.trim().length === 0) {
      return { valid: false, error: 'Each message must have non-empty content' }
    }
  }
  
  if (data.messages.length > 50) {
    return { valid: false, error: 'Too many messages (max 50)' }
  }
  
  for (const msg of data.messages) {
    if (msg.content.length > 10000) {
      return { valid: false, error: 'Message content too long (max 10000 characters)' }
    }
  }
  
  return { valid: true, data }
}

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

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const authHeader = request.headers.get('Authorization')
    const credentials = parseBasicAuth(authHeader)
    
    if (!credentials) {
      return createAuthChallenge()
    }
    
    const authResult = verifyAbtinCredentials(credentials.username, credentials.password)
    
    if (!authResult.authenticated) {
      return createAuthChallenge('Invalid credentials')
    }
    
    // 2. Parse and validate request
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
    
    const { messages, mode, model, models, multiModel } = validation.data
    
    // 5. Initialize OpenRouter client
    const client = new OpenRouterClient()
    
    // 6. Stream response
    const sseEncoder = createSSEEncoder()
    
    // Check if multi-model mode is enabled
    if (multiModel && models && models.length > 1) {
      // Multi-model collaboration mode
      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            const systemPrompt = MULTI_MODEL_SYSTEM_PROMPTS[mode]
            
            // Each model takes a turn responding
            for (const selectedModel of models) {
              const messageId = `${Date.now()}-${selectedModel}`
              
              // Build context with previous conversation
              const aiMessages: ChatMessage[] = [
                { role: 'system', content: systemPrompt },
              ]
              
              // Add conversation history (including other model responses)
              for (const msg of messages) {
                if (msg.role === 'assistant' && msg.modelName) {
                  // Include which model said what for context
                  aiMessages.push({
                    role: msg.role,
                    content: `[${msg.modelName}]: ${msg.content}`
                  })
                } else {
                  aiMessages.push({
                    role: msg.role,
                    content: msg.content
                  })
                }
              }
              
              // Signal new message from this model
              controller.enqueue(sseEncoder.encode(JSON.stringify({ 
                newMessage: true,
                messageId,
                model: selectedModel,
                modelName: PSYCHOLOGIST_MODELS[selectedModel],
                mode: mode
              })))
              
              // Stream this model's response
              try {
                const generator = client.streamWithFallback({
                  model: selectedModel,
                  messages: aiMessages,
                  maxTokens: 2048, // Shorter responses for multi-model
                  temperature: mode === 'brainstorm' ? 0.9 : 0.7,
                })
                
                for await (const chunk of generator) {
                  controller.enqueue(sseEncoder.encode(JSON.stringify({ 
                    messageId,
                    content: chunk,
                    modelName: PSYCHOLOGIST_MODELS[selectedModel]
                  })))
                }
              } catch (error) {
                const errorMessage = error instanceof OpenRouterError 
                  ? error.message 
                  : `Error from ${PSYCHOLOGIST_MODELS[selectedModel]}`
                
                controller.enqueue(sseEncoder.encode(JSON.stringify({ 
                  messageId,
                  content: `\n\n[Error: ${errorMessage}]`,
                  modelName: PSYCHOLOGIST_MODELS[selectedModel]
                })))
              }
              
              // Small delay between models for better UX
              await new Promise(resolve => setTimeout(resolve, 500))
            }
            
            controller.enqueue(sseEncoder.encodeDone())
            controller.close()
          } catch (error) {
            const errorMessage = error instanceof OpenRouterError 
              ? error.message 
              : 'An error occurred while generating the responses'
            
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
        }
      })
    }
    
    // Single model mode (original behavior)
    const selectedModel = model || 'openai/gpt-5.1'
    
    // Build AI messages with system prompt
    const systemPrompt = SYSTEM_PROMPTS[mode]
    const aiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ]
    
    // Add conversation history
    for (const msg of messages) {
      aiMessages.push({
        role: msg.role,
        content: msg.content
      })
    }
    
    const streamResponse = new ReadableStream({
      async start(controller) {
        try {
          // Send model info first
          controller.enqueue(sseEncoder.encode(JSON.stringify({ 
            model: selectedModel,
            modelName: PSYCHOLOGIST_MODELS[selectedModel],
            mode: mode
          })))
          
          // Stream the response
          const generator = client.streamWithFallback({
            model: selectedModel,
            messages: aiMessages,
            maxTokens: 4096,
            temperature: mode === 'brainstorm' ? 0.9 : 0.7, // Higher temperature for brainstorming
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
      }
    })
  } catch (error) {
    console.error('Abtin Chat API error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

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
