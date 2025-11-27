/**
 * AI Chat Components
 * 
 * Embeddable AI chat interface with:
 * - Context-aware suggestions
 * - Streaming responses
 * - Voice input
 * - Syntax highlighting
 * - Feedback system
 */

// Main components
export { ChatPanel } from './ChatPanel'
export type { ChatPanelProps } from './ChatPanel'

// Page context provider for automatic context updates
export { PageContextProvider } from './PageContextProvider'

// Stock context updater - fetches full data for AI
export { StockContextUpdater } from './StockContextUpdater'

// Wrapper component for easy integration
export { AIChatWrapper } from './AIChatWrapper'

// Analysis components
export { SummaryCard, SummaryCardSkeleton } from './SummaryCard'
export { ExplainerPopover, InlineExplainer } from './ExplainerPopover'

export { Message } from './Message'
export type { MessageProps } from './Message'

export { MessageInput } from './MessageInput'
export type { MessageInputProps } from './MessageInput'

export { SuggestedQuestions, CompactSuggestions } from './SuggestedQuestions'
export type { SuggestedQuestionsProps, CompactSuggestionsProps } from './SuggestedQuestions'

export { ContextBadge, InlineContextIndicator } from './ContextBadge'
export type { ContextBadgeProps, InlineContextIndicatorProps } from './ContextBadge'

// Re-export store hooks for convenience
export {
  useChatStore,
  useSuggestedQuestions,
  selectMessages,
  selectIsStreaming,
  selectContext,
  selectIsOpen,
  selectLastMessage,
  type ChatMessage,
  type ChatContext,
  type MessageRole,
  type MessageStatus,
  type FeedbackType,
} from '@/lib/stores/chat-store'
