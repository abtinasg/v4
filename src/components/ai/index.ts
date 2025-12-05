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

// Terminal context updater - fetches market data for Terminal Pro
export { TerminalContextUpdater } from './TerminalContextUpdater'

// News context updater - provides news data for News page
export { NewsContextUpdater } from './NewsContextUpdater'

// Global context updater - provides system-wide data to AI on ALL pages
export { GlobalContextUpdater } from './GlobalContextUpdater'

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

// New Advanced Features
export { QuickActions, parseCommand } from './QuickActions'
export type { QuickAction, ParsedCommand } from './QuickActions'

export { ModelSelector, AI_MODELS } from './ModelSelector'
export type { AIModel, ModelSelectorProps } from './ModelSelector'

export { BrainstormToggle, BrainstormOutput, buildBrainstormPrompt } from './BrainstormMode'
export type { BrainstormIdea, BrainstormToggleProps, BrainstormOutputProps } from './BrainstormMode'

export { InteractiveChart, ComparisonChart, MetricBar, parseChartFromResponse } from './InteractiveChart'
export type { InteractiveChartProps, ComparisonChartProps, ChartData, ParsedChart } from './InteractiveChart'

// AI PDF Viewer with streaming and annotations
export { AiPdfViewer } from './AiPdfViewer'

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
