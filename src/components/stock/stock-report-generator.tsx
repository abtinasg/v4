'use client';

import { useState } from 'react';
import { Download, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

interface StockReportGeneratorProps {
  symbol: string;
  companyName: string;
}

interface ReportResponse {
  success: boolean;
  symbol: string;
  companyName: string;
  generatedAt: string;
  report: string;
  metadata: {
    reportType: string;
    includeCharts: boolean;
  };
}

const loadingStages = [
  {
    label: 'Secure Handshake',
    description: 'Syncing premium market data feeds',
    keywords: ['initializing'],
  },
  {
    label: 'AI Intelligence',
    description: 'Analyzing 170+ metrics with Claude Opus',
    keywords: ['analyzing'],
  },
  {
    label: 'Narrative Design',
    description: 'Crafting institutional-grade insights',
    keywords: ['generating', 'creating'],
  },
  {
    label: 'PDF Delivery',
    description: 'Finalizing and downloading the dossier',
    keywords: ['downloaded'],
  },
];

export function StockReportGenerator({ symbol, companyName }: StockReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const normalizedProgress = progress.toLowerCase();
  const derivedStageIndex = loadingStages.findIndex((stage) =>
    stage.keywords.some((keyword) => normalizedProgress.includes(keyword)),
  );
  const activeStageIndex = derivedStageIndex === -1 ? (isGenerating ? 0 : -1) : derivedStageIndex;
  const progressPercent =
    activeStageIndex === -1 ? 0 : ((activeStageIndex + 1) / loadingStages.length) * 100;
  const animatedWidth = isGenerating ? Math.min(100, Math.max(12, progressPercent || 10)) : 0;
  const progressMessage = progress || 'Preparing institutional-grade PDF...';

  /**
   * Convert markdown to formatted text for PDF
   */
  const markdownToText = (markdown: string): string => {
    // Remove markdown formatting but keep structure
    return markdown
      .replace(/^#{1,6}\s+/gm, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/`(.+?)`/g, '$1') // Remove code
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
      .replace(/^\s*[-*+]\s+/gm, '• ') // Convert lists to bullets
      .replace(/^\s*\d+\.\s+/gm, '• '); // Convert numbered lists
  };

  /**
   * Generate PDF from markdown report
   */
  const generatePDF = async (reportData: ReportResponse) => {
    try {
      setProgress('Creating PDF document...');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper to add new page if needed
      const checkPageBreak = (requiredSpace: number = 10) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('DEEP TERMINAL', margin, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Professional Investment Research Report', margin, 28);

      // Company info bar
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(0, 50, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`${symbol}`, margin, 62);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(companyName, margin, 69);

      // Generation date
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // slate-400
      const dateText = `Generated: ${new Date(reportData.generatedAt).toLocaleString()}`;
      doc.text(dateText, pageWidth - margin - doc.getTextWidth(dateText), 69);

      yPosition = 85;

      // AI Badge
      doc.setTextColor(139, 92, 246); // violet-500
      doc.setFontSize(8);
      doc.text('✨ AI-POWERED ANALYSIS', margin, yPosition);
      yPosition += 2;

      // Divider
      doc.setDrawColor(51, 65, 85); // slate-700
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Parse markdown and add to PDF
      doc.setTextColor(15, 23, 42); // slate-900 for main text
      
      const sections = reportData.report.split(/(?=^#{1,2}\s)/gm);
      
      for (const section of sections) {
        if (!section.trim()) continue;

        const lines = section.split('\n');
        
        for (const line of lines) {
          if (!line.trim()) {
            yPosition += 3;
            continue;
          }

          checkPageBreak(15);

          // Main headers (# )
          if (line.match(/^#\s+/)) {
            yPosition += 5;
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            const text = line.replace(/^#\s+/, '');
            doc.text(text, margin, yPosition);
            yPosition += 8;
            doc.setLineWidth(0.3);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 5;
          }
          // Sub headers (## )
          else if (line.match(/^#{2,3}\s+/)) {
            yPosition += 4;
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            const text = line.replace(/^#{2,3}\s+/, '');
            doc.text(text, margin, yPosition);
            yPosition += 6;
          }
          // Bold text
          else if (line.match(/\*\*(.+?)\*\*/)) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(51, 65, 85);
            const text = line.replace(/\*\*/g, '');
            const splitText = doc.splitTextToSize(text, contentWidth);
            doc.text(splitText, margin, yPosition);
            yPosition += splitText.length * 5;
          }
          // Bullet points
          else if (line.match(/^\s*[-*•]\s+/)) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            const text = line.replace(/^\s*[-*•]\s+/, '• ');
            const splitText = doc.splitTextToSize(text, contentWidth - 5);
            doc.text(splitText, margin + 3, yPosition);
            yPosition += splitText.length * 4.5;
          }
          // Regular text
          else {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            const text = line.trim();
            if (text) {
              const splitText = doc.splitTextToSize(text, contentWidth);
              doc.text(splitText, margin, yPosition);
              yPosition += splitText.length * 5;
            }
          }
        }
      }

      // Footer on last page
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'italic');
      const footer = 'This report is for informational purposes only and does not constitute investment advice.';
      const footerLines = doc.splitTextToSize(footer, contentWidth);
      doc.text(footerLines, margin, pageHeight - 15);

      // Save PDF
      const fileName = `${symbol}_Investment_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      setProgress('');
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to create PDF document');
    }
  };

  /**
   * Handle report generation
   */
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress('Initializing...');

    try {
      // Step 1: Generate report with AI
      setProgress('Analyzing stock data with AI...');
      const response = await fetch(`/api/stock/${symbol}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: 'full',
          includeCharts: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server error: ${response.status}`;
        const errorDetails = errorData.details || '';
        
        // Log detailed error for debugging
        console.error('Report generation failed:', {
          status: response.status,
          error: errorMessage,
          details: errorDetails,
        });
        
        // Throw user-friendly error message
        throw new Error(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage);
      }

      const reportData: ReportResponse = await response.json();

      if (!reportData.success || !reportData.report) {
        throw new Error('Invalid report data received from server');
      }

      // Step 2: Generate PDF
      setProgress('Generating PDF document...');
      await generatePDF(reportData);

      // Success
      setProgress('Report downloaded successfully!');
      setTimeout(() => setProgress(''), 3000);

    } catch (err) {
      console.error('Report generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/[0.06] bg-[#0a0d12]/80 backdrop-blur-sm">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] to-transparent" />
      
      <div className="relative p-4">
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-400/80" />
            <h3 className="text-sm font-medium text-white/90">AI Investment Report</h3>
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-violet-500/10 text-violet-400/80 border border-violet-500/20">
              PRO
            </span>
          </div>
          <span className="text-[10px] text-white/30">Claude Opus 4.5</span>
        </div>

        {/* Description - Minimal */}
        <p className="text-xs text-white/40 mb-3">
          CFA-level analysis with 170+ metrics, valuation models, and risk assessment
        </p>

        {/* Error state */}
        {error && (
          <div className="mb-3 p-2 rounded bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-red-400" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state - Compact */}
        {isGenerating && !error && (
          <div className="mb-3 p-3 rounded bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-3 w-3 text-violet-400 animate-spin" />
              <span className="text-xs text-white/60">{progressMessage}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-violet-500/60 transition-all duration-500"
                style={{ width: `${animatedWidth}%` }}
              />
            </div>
          </div>
        )}

        {/* Generate Button - Compact */}
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          size="sm"
          className="w-full h-8 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 hover:border-violet-500/30 text-xs font-medium transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-1.5 h-3 w-3" />
              Generate PDF Report
            </>
          )}
        </Button>

        {/* Footer note */}
        <p className="mt-2 text-center text-[10px] text-white/20">
          30-60 seconds
        </p>
      </div>
    </div>
  );
}
