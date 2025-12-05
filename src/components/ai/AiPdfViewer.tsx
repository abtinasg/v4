'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Download, Highlighter, Trash2, FileText, Loader2, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import removeMd from 'remove-markdown'

interface Highlight {
  id: string
  text: string
  color: string
  position: {
    top: number
    left: number
    width: number
    height: number
  }
  note?: string
}

interface AiPdfViewerProps {
  symbol: string
  companyName: string
  audienceType?: 'pro' | 'retail' | 'personalized'
  onClose?: () => void
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a', dark: '#fde047' },
  { name: 'Green', value: '#bbf7d0', dark: '#86efac' },
  { name: 'Blue', value: '#bfdbfe', dark: '#93c5fd' },
  { name: 'Pink', value: '#fbcfe8', dark: '#f9a8d4' },
  { name: 'Purple', value: '#e9d5ff', dark: '#d8b4fe' },
]

export function AiPdfViewer({ symbol, companyName, audienceType = 'pro', onClose }: AiPdfViewerProps) {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0].value)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadHighlights = useCallback(async () => {
    try {
      const response = await fetch(`/api/pdf-annotations?symbol=${symbol}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.annotations) {
          const loadedHighlights = data.annotations.map((ann: {
            id: string
            text: string
            color: string
            position: { top: number; left: number; width: number; height: number }
            note?: string
          }) => ({
            id: ann.id,
            text: ann.text,
            color: ann.color,
            position: ann.position,
            note: ann.note,
          }))
          setHighlights(loadedHighlights)
        }
      }
    } catch (err) {
      console.error('Failed to load highlights:', err)
    }
  }, [symbol])

  const startStreaming = useCallback(async () => {
    setIsStreaming(true)
    setError(null)
    setContent('')
    
    abortControllerRef.current = new AbortController()
    
    try {
      // Use different endpoint for personalized reports
      const endpoint = audienceType === 'personalized' 
        ? `/api/stock/${symbol}/personalized-report/stream`
        : `/api/stock/${symbol}/report/stream`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audienceType,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate report')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Response body not readable')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              setIsStreaming(false)
              continue
            }
            
            try {
              const parsed = JSON.parse(data)
              
              // Metadata can be logged but not stored if not used
              if (parsed.type === 'metadata') {
                console.log('Report metadata:', parsed)
              } else if (parsed.type === 'content' && parsed.content) {
                setContent((prev) => prev + parsed.content)
              }
            } catch (e) {
              console.error('Failed to parse chunk:', e)
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Stream aborted')
      } else {
        console.error('Streaming error:', err)
        setError(err instanceof Error ? err.message : 'Failed to generate report')
      }
    } finally {
      setIsStreaming(false)
    }
  }, [symbol, audienceType])

  const saveHighlight = useCallback(async (highlight: Highlight) => {
    try {
      const response = await fetch('/api/pdf-annotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          text: highlight.text,
          color: highlight.color,
          position: highlight.position,
          note: highlight.note,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.annotation) {
          setHighlights((prev) => [...prev, {
            id: data.annotation.id,
            text: data.annotation.text,
            color: data.annotation.color,
            position: data.annotation.position,
            note: data.annotation.note,
          }])
        }
      }
    } catch (error) {
      console.error('Failed to save highlight:', error)
    }
  }, [symbol])

  const removeHighlight = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/pdf-annotations?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setHighlights((prev) => prev.filter((h) => h.id !== id))
      }
    } catch (error) {
      console.error('Failed to remove highlight:', error)
    }
  }, [])

  useEffect(() => {
    // Start streaming on mount
    startStreaming()
    
    // Load saved highlights
    loadHighlights()
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [startStreaming, loadHighlights])

  const handleTextSelection = useCallback(() => {
    if (!isSelectionMode || !contentRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const selectedText = selection.toString().trim()
    if (!selectedText) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = contentRef.current.getBoundingClientRect()

    const highlight: Highlight = {
      id: '', // Will be set by the server
      text: selectedText,
      color: selectedColor,
      position: {
        top: rect.top - containerRect.top,
        left: rect.left - containerRect.left,
        width: rect.width,
        height: rect.height,
      },
    }

    saveHighlight(highlight)
    selection.removeAllRanges()
  }, [isSelectionMode, selectedColor, saveHighlight])

  const downloadPdf = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - margin * 2
      let yPosition = margin

      // Header
      doc.setFillColor(79, 70, 229)
      doc.rect(0, 0, pageWidth, 8, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(17, 24, 39)
      doc.text(`${symbol} - ${companyName}`, margin, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.text(`AI-Generated Report - ${new Date().toLocaleDateString()}`, margin, yPosition)
      yPosition += 15

      // Content - Use remove-markdown for reliable conversion
      const plainText = removeMd(content, {
        stripListLeaders: false, // Keep bullet points
        gfm: true, // Support GitHub Flavored Markdown
        useImgAltText: true, // Use alt text for images
      })
        .replace(/^\s*[-*+]\s+/gm, '• ') // Ensure consistent bullet points
        .trim()

      const sections = plainText.split(/\n{2,}/)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(17, 24, 39)

      for (const section of sections) {
        const trimmed = section.trim()
        if (!trimmed) continue

        const lines = doc.splitTextToSize(trimmed, contentWidth)
        for (const line of lines) {
          if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = margin
          }
          doc.text(line, margin, yPosition)
          yPosition += 6
        }
        yPosition += 3
      }

      // Add highlights section if any
      if (highlights.length > 0) {
        if (yPosition > pageHeight - 50) {
          doc.addPage()
          yPosition = margin
        }

        yPosition += 10
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text('Your Highlights', margin, yPosition)
        yPosition += 8

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)

        for (const highlight of highlights) {
          if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = margin
          }

          const highlightText = `• ${highlight.text}`
          const lines = doc.splitTextToSize(highlightText, contentWidth)
          for (const line of lines) {
            doc.text(line, margin, yPosition)
            yPosition += 5
          }
          yPosition += 3
        }
      }

      // Footer
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.text(`© ${new Date().getFullYear()} Deep Terminal`, margin, pageHeight - 10)

      doc.save(`${symbol}_AI_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error('PDF generation error:', err)
      setError('Failed to generate PDF')
    }
  }

  const renderContent = () => {
    if (!content) return null

    return (
      <div
        ref={contentRef}
        className="prose prose-invert max-w-none"
        onMouseUp={handleTextSelection}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm ${isFullscreen ? 'p-0' : 'p-4'}`}
    >
      <div className={`mx-auto h-full ${isFullscreen ? 'max-w-full' : 'max-w-6xl'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-4 bg-zinc-900/95 p-4 rounded-t-lg border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{symbol} - AI Report</h2>
              <p className="text-sm text-zinc-400">{companyName}</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {/* Highlight Mode Toggle */}
            <Button
              variant={isSelectionMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsSelectionMode(!isSelectionMode)}
              disabled={isStreaming}
            >
              <Highlighter className="h-4 w-4 mr-2" />
              {isSelectionMode ? 'Highlighting' : 'Highlight'}
            </Button>

            {/* Color Picker */}
            {isSelectionMode && (
              <div className="flex gap-1 px-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedColor === color.value ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.dark }}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            )}

            {/* Download PDF */}
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPdf}
              disabled={!content || isStreaming}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            {/* Close */}
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-zinc-900/95 border-x border-b border-zinc-800 rounded-b-lg overflow-hidden">
          <div className="h-full overflow-y-auto p-8 relative">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                {error}
              </div>
            )}

            {isStreaming && !content && (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                <p className="text-zinc-400">Generating AI report with streaming...</p>
              </div>
            )}

            {content && (
              <div className="relative">
                {renderContent()}

                {/* Render highlights */}
                {highlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className="absolute pointer-events-auto group"
                    style={{
                      top: `${highlight.position.top}px`,
                      left: `${highlight.position.left}px`,
                      width: `${highlight.position.width}px`,
                      height: `${highlight.position.height}px`,
                      backgroundColor: highlight.color,
                      opacity: 0.3,
                      borderRadius: '2px',
                    }}
                  >
                    <button
                      className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded text-xs"
                      onClick={() => removeHighlight(highlight.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isStreaming && content && (
              <div className="mt-4 flex items-center gap-2 text-violet-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Streaming content...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
