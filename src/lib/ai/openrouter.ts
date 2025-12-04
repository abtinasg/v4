/**
 * OpenRouter AI Integration
 * 
 * Cost-effective AI analysis using OpenRouter API
 * Default: anthropic/claude-3-haiku (cheap + good)
 * Fallback: meta-llama/llama-3.1-8b-instruct
 */

// Available models with their pricing (per million tokens)
export const OPENROUTER_MODELS = {
  // Premium: GPT-5.1 - Most advanced reasoning
  'openai/gpt-5.1': {
    name: 'GPT-5.1',
    inputCost: 10,
    outputCost: 30,
    contextWindow: 256000,
    description: 'Most advanced reasoning and analysis'
  },
  // Premium: Claude Sonnet 4.5 - Exceptional analysis
  'anthropic/claude-sonnet-4.5': {
    name: 'Claude Sonnet 4.5',
    inputCost: 8,
    outputCost: 24,
    contextWindow: 200000,
    description: 'Exceptional nuanced financial analysis'
  },
  // Primary: Claude 3 Haiku - fast, cheap, good for most tasks
  'anthropic/claude-3-haiku': {
    name: 'Claude 3 Haiku',
    inputCost: 0.25,
    outputCost: 1.25,
    contextWindow: 200000,
    description: 'Fast and efficient for routine analysis'
  },
  // Claude 3.5 Sonnet - better quality, moderate cost
  'anthropic/claude-3.5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    inputCost: 3,
    outputCost: 15,
    contextWindow: 200000,
    description: 'High quality analysis and reasoning'
  },
  // GPT-4o - OpenAI's latest
  'openai/gpt-4o': {
    name: 'GPT-4o',
    inputCost: 5,
    outputCost: 15,
    contextWindow: 128000,
    description: 'OpenAI flagship model'
  },
  // GPT-4o Mini - cheaper OpenAI option
  'openai/gpt-4o-mini': {
    name: 'GPT-4o Mini',
    inputCost: 0.15,
    outputCost: 0.6,
    contextWindow: 128000,
    description: 'Cost-effective OpenAI model'
  },
  // Mixtral - open source, very cheap
  'mistralai/mixtral-8x7b-instruct': {
    name: 'Mixtral 8x7B',
    inputCost: 0.24,
    outputCost: 0.24,
    contextWindow: 32768,
    description: 'Open source, very cost-effective'
  },
  // Llama 3.1 - Meta's latest
  'meta-llama/llama-3.1-70b-instruct': {
    name: 'Llama 3.1 70B',
    inputCost: 0.59,
    outputCost: 0.79,
    contextWindow: 131072,
    description: 'Meta open source model'
  },
  // Llama 3.1 8B - Very cheap fallback
  'meta-llama/llama-3.1-8b-instruct': {
    name: 'Llama 3.1 8B',
    inputCost: 0.055,
    outputCost: 0.055,
    contextWindow: 131072,
    description: 'Very cheap fallback model'
  }
} as const

export type OpenRouterModel = keyof typeof OPENROUTER_MODELS

// Default and fallback models - using Claude Sonnet 4.5 for exceptional financial analysis
export const DEFAULT_MODEL: OpenRouterModel = 'anthropic/claude-sonnet-4.5'
export const FALLBACK_MODEL: OpenRouterModel = 'openai/gpt-4o'

// Message types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionOptions {
  model?: OpenRouterModel
  messages: ChatMessage[]
  maxTokens?: number
  temperature?: number
  topP?: number
  stream?: boolean
  stopSequences?: string[]
  tools?: any[] // Function calling tools
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } }
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface ChatCompletionResponse {
  id: string
  model: string
  choices: {
    index: number
    message: {
      role: 'assistant'
      content: string | null
      tool_calls?: ToolCall[]
    }
    finishReason: string
  }[]
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface StreamChunk {
  id: string
  model: string
  choices: {
    index: number
    delta: {
      role?: 'assistant'
      content?: string
    }
    finishReason: string | null
  }[]
}

// Error types
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'OpenRouterError'
  }
}

// Simple token estimation (approximation)
export function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  // This is a simplification - actual tokenization varies by model
  return Math.ceil(text.length / 4)
}

export function estimateMessageTokens(messages: ChatMessage[]): number {
  let total = 0
  for (const msg of messages) {
    // Add overhead for message structure
    total += 4 // role tokens
    total += estimateTokens(msg.content)
  }
  // Add some overhead for the conversation structure
  total += 3
  return total
}

export function estimateCost(
  model: OpenRouterModel,
  inputTokens: number,
  outputTokens: number
): number {
  const modelInfo = OPENROUTER_MODELS[model]
  const inputCost = (inputTokens / 1_000_000) * modelInfo.inputCost
  const outputCost = (outputTokens / 1_000_000) * modelInfo.outputCost
  return inputCost + outputCost
}

// Main OpenRouter client
export class OpenRouterClient {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'
  private siteUrl?: string
  private siteName?: string

  constructor(options?: {
    apiKey?: string
    siteUrl?: string
    siteName?: string
  }) {
    const apiKey = options?.apiKey || process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new OpenRouterError('OPENROUTER_API_KEY is not configured', 401)
    }
    this.apiKey = apiKey
    this.siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://deepinhq.com'
    this.siteName = options?.siteName || 'Deepin'
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': this.siteUrl || '',
      'X-Title': this.siteName || '',
    }
  }

  /**
   * Create a chat completion (non-streaming)
   */
  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const model = options.model || DEFAULT_MODEL
    
    const body: Record<string, any> = {
      model,
      messages: options.messages,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 1,
      stream: false,
      stop: options.stopSequences,
    }

    // Add tools if provided
    if (options.tools && options.tools.length > 0) {
      body.tools = options.tools
      body.tool_choice = options.toolChoice || 'auto'
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new OpenRouterError(
          error.error?.message || `API request failed: ${response.status}`,
          response.status,
          error.error?.code,
          response.status >= 500 || response.status === 429
        )
      }

      const data = await response.json()
      
      return {
        id: data.id,
        model: data.model,
        choices: data.choices.map((choice: any) => ({
          index: choice.index,
          message: {
            role: 'assistant',
            content: choice.message.content,
            tool_calls: choice.message.tool_calls,
          },
          finishReason: choice.finish_reason,
        })),
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      }
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error
      }
      throw new OpenRouterError(
        error instanceof Error ? error.message : 'Unknown error',
        undefined,
        undefined,
        true
      )
    }
  }

  /**
   * Create a streaming chat completion
   * Returns an async generator that yields content chunks
   */
  async *streamChatCompletion(
    options: ChatCompletionOptions
  ): AsyncGenerator<string, void, unknown> {
    const model = options.model || DEFAULT_MODEL
    
    const body = {
      model,
      messages: options.messages,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 1,
      stream: true,
      stop: options.stopSequences,
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new OpenRouterError(
        error.error?.message || `API request failed: ${response.status}`,
        response.status,
        error.error?.code,
        response.status >= 500 || response.status === 429
      )
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new OpenRouterError('Response body is not readable')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (!trimmed.startsWith('data: ')) continue

          try {
            const data = JSON.parse(trimmed.slice(6)) as StreamChunk
            const content = data.choices[0]?.delta?.content
            if (content) {
              yield content
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Chat with automatic fallback on error
   */
  async chatWithFallback(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    const primaryModel = options.model || DEFAULT_MODEL
    
    try {
      return await this.chatCompletion({ ...options, model: primaryModel })
    } catch (error) {
      if (error instanceof OpenRouterError && error.retryable) {
        console.warn(`Primary model ${primaryModel} failed, falling back to ${FALLBACK_MODEL}`)
        return await this.chatCompletion({ ...options, model: FALLBACK_MODEL })
      }
      throw error
    }
  }

  /**
   * Stream with automatic fallback on error
   */
  async *streamWithFallback(
    options: ChatCompletionOptions
  ): AsyncGenerator<string, void, unknown> {
    const primaryModel = options.model || DEFAULT_MODEL
    
    try {
      yield* this.streamChatCompletion({ ...options, model: primaryModel })
    } catch (error) {
      if (error instanceof OpenRouterError && error.retryable) {
        console.warn(`Primary model ${primaryModel} failed, falling back to ${FALLBACK_MODEL}`)
        yield* this.streamChatCompletion({ ...options, model: FALLBACK_MODEL })
      } else {
        throw error
      }
    }
  }
}

// Singleton instance
let clientInstance: OpenRouterClient | null = null

export function getOpenRouterClient(): OpenRouterClient {
  if (!clientInstance) {
    clientInstance = new OpenRouterClient()
  }
  return clientInstance
}

// Convenience functions
export async function chat(
  messages: ChatMessage[],
  options?: Partial<ChatCompletionOptions>
): Promise<string> {
  const client = getOpenRouterClient()
  const response = await client.chatWithFallback({
    messages,
    ...options,
  })
  return response.choices[0]?.message.content || ''
}

export async function* streamChat(
  messages: ChatMessage[],
  options?: Partial<ChatCompletionOptions>
): AsyncGenerator<string, void, unknown> {
  const client = getOpenRouterClient()
  yield* client.streamWithFallback({
    messages,
    ...options,
  })
}
