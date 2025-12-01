'use client';

import { useState } from 'react';
import { Download, FileText, Loader2, AlertCircle, Sparkles, Shield, TrendingUp, BarChart3, CheckCircle2 } from 'lucide-react';
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
    label: 'Market Data Sync',
    description: 'Fetching real-time market data & financials',
    keywords: ['initializing', 'fetching'],
    icon: BarChart3,
  },
  {
    label: 'AI Analysis Engine',
    description: 'Processing 400+ metrics with Claude AI',
    keywords: ['analyzing', 'processing'],
    icon: Sparkles,
  },
  {
    label: 'Report Generation',
    description: 'Crafting institutional-grade insights',
    keywords: ['generating', 'creating'],
    icon: TrendingUp,
  },
  {
    label: 'PDF Export',
    description: 'Finalizing professional document',
    keywords: ['pdf', 'document', 'downloaded'],
    icon: FileText,
  },
];

const reportFeatures = [
  { text: 'CFA-Level Analysis', icon: Shield },
  { text: '400+ Metrics', icon: BarChart3 },
  { text: 'AI-Powered', icon: Sparkles },
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
   * Generate PDF from markdown report - Professional Design
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
      const margin = 18;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Color palette
      const colors = {
        primary: [6, 182, 212] as [number, number, number],      // Cyan
        secondary: [139, 92, 246] as [number, number, number],   // Violet
        dark: [10, 13, 18] as [number, number, number],          // Dark background
        slate900: [15, 23, 42] as [number, number, number],
        slate800: [30, 41, 59] as [number, number, number],
        slate700: [51, 65, 85] as [number, number, number],
        slate600: [71, 85, 105] as [number, number, number],
        slate400: [148, 163, 184] as [number, number, number],
        white: [255, 255, 255] as [number, number, number],
      };

      // Helper to add new page if needed
      const checkPageBreak = (requiredSpace: number = 12) => {
        if (yPosition + requiredSpace > pageHeight - 25) {
          doc.addPage();
          yPosition = margin;
          // Add page header
          doc.setFillColor(...colors.slate900);
          doc.rect(0, 0, pageWidth, 12, 'F');
          doc.setFontSize(8);
          doc.setTextColor(...colors.slate400);
          doc.text(`${symbol} | Deep Terminal Research Report`, margin, 8);
          doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 15, 8);
          yPosition = 20;
          return true;
        }
        return false;
      };

      // ===== COVER PAGE =====
      // Full dark background
      doc.setFillColor(...colors.dark);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Gradient accent bar
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 4, 'F');

      // Logo and branding
      yPosition = 35;
      doc.setTextColor(...colors.primary);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('DEEP TERMINAL', margin, yPosition);

      doc.setFontSize(10);
      doc.setTextColor(...colors.slate400);
      doc.setFont('helvetica', 'normal');
      doc.text('Institutional-Grade Equity Research', margin, yPosition + 8);

      // Main symbol display
      yPosition = 80;
      doc.setTextColor(...colors.white);
      doc.setFontSize(48);
      doc.setFont('helvetica', 'bold');
      doc.text(symbol, margin, yPosition);

      // Company name
      doc.setFontSize(16);
      doc.setTextColor(...colors.slate400);
      doc.setFont('helvetica', 'normal');
      doc.text(companyName, margin, yPosition + 12);

      // Report type badge
      yPosition = 110;
      doc.setFillColor(...colors.secondary);
      doc.roundedRect(margin, yPosition, 55, 8, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...colors.white);
      doc.setFont('helvetica', 'bold');
      doc.text('EQUITY RESEARCH REPORT', margin + 3, yPosition + 5.5);

      // Report features
      yPosition = 135;
      const features = ['CFA-Level Framework', 'AI-Powered Analysis', '400+ Metrics Analyzed', 'DCF & Relative Valuation'];
      doc.setFontSize(10);
      doc.setTextColor(...colors.slate400);
      features.forEach((feature, idx) => {
        doc.setTextColor(...colors.primary);
        doc.text('●', margin, yPosition + idx * 8);
        doc.setTextColor(...colors.slate400);
        doc.text(feature, margin + 5, yPosition + idx * 8);
      });

      // Generation info
      yPosition = pageHeight - 50;
      doc.setDrawColor(...colors.slate700);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 8;
      doc.setFontSize(9);
      doc.setTextColor(...colors.slate600);
      doc.text(`Report Generated: ${new Date(reportData.generatedAt).toLocaleString()}`, margin, yPosition);
      doc.text('Analysis Engine: Claude AI', margin, yPosition + 6);

      // Disclaimer on cover
      yPosition = pageHeight - 20;
      doc.setFontSize(7);
      doc.setTextColor(...colors.slate600);
      doc.setFont('helvetica', 'italic');
      const disclaimer = 'This report is for informational purposes only and does not constitute investment advice.';
      doc.text(disclaimer, margin, yPosition);

      // ===== CONTENT PAGES =====
      doc.addPage();
      
      // Page background
      doc.setFillColor(252, 252, 253);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Header bar
      doc.setFillColor(...colors.slate900);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setFontSize(9);
      doc.setTextColor(...colors.white);
      doc.setFont('helvetica', 'bold');
      doc.text(`${symbol} - Investment Research Report`, margin, 10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.slate400);
      doc.text('Deep Terminal', pageWidth - margin - 25, 10);

      yPosition = 25;

      // Parse and render markdown
      doc.setTextColor(...colors.slate900);
      
      const sections = reportData.report.split(/(?=^#{1,2}\s)/gm);
      
      for (const section of sections) {
        if (!section.trim()) continue;

        const lines = section.split('\n');
        
        for (const line of lines) {
          if (!line.trim()) {
            yPosition += 2;
            continue;
          }

          checkPageBreak(12);

          // Main headers (# )
          if (line.match(/^#\s+/)) {
            yPosition += 6;
            doc.setFillColor(...colors.slate900);
            doc.rect(margin - 2, yPosition - 5, contentWidth + 4, 10, 'F');
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...colors.white);
            const text = line.replace(/^#\s+/, '').toUpperCase();
            doc.text(text, margin, yPosition);
            yPosition += 10;
          }
          // Section headers (## )
          else if (line.match(/^#{2}\s+/)) {
            yPosition += 5;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...colors.primary);
            const text = line.replace(/^#{2}\s+/, '');
            doc.text(text, margin, yPosition);
            yPosition += 3;
            doc.setDrawColor(...colors.primary);
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, margin + 40, yPosition);
            yPosition += 5;
          }
          // Sub-section headers (### )
          else if (line.match(/^#{3}\s+/)) {
            yPosition += 3;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...colors.slate800);
            const text = line.replace(/^#{3}\s+/, '');
            doc.text(text, margin, yPosition);
            yPosition += 5;
          }
          // Bold text with **
          else if (line.match(/^\*\*(.+?)\*\*$/)) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...colors.slate700);
            const text = line.replace(/\*\*/g, '');
            const splitText = doc.splitTextToSize(text, contentWidth);
            doc.text(splitText, margin, yPosition);
            yPosition += splitText.length * 5;
          }
          // Horizontal rule ---
          else if (line.match(/^---+$/)) {
            yPosition += 2;
            doc.setDrawColor(...colors.slate400);
            doc.setLineWidth(0.2);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 4;
          }
          // Bullet points
          else if (line.match(/^\s*[-*•]\s+/)) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colors.slate700);
            const text = line.replace(/^\s*[-*•]\s+/, '');
            const splitText = doc.splitTextToSize(text, contentWidth - 6);
            doc.setTextColor(...colors.primary);
            doc.text('▸', margin, yPosition);
            doc.setTextColor(...colors.slate700);
            doc.text(splitText, margin + 5, yPosition);
            yPosition += splitText.length * 4.2;
          }
          // Table-like data (lines starting with |)
          else if (line.match(/^\|/)) {
            doc.setFontSize(8);
            doc.setFont('courier', 'normal');
            doc.setTextColor(...colors.slate600);
            const text = line.replace(/\|/g, '  ');
            doc.text(text, margin, yPosition);
            yPosition += 4;
          }
          // Regular text
          else {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colors.slate700);
            // Handle inline bold
            let text = line.trim().replace(/\*\*(.+?)\*\*/g, '$1');
            if (text) {
              const splitText = doc.splitTextToSize(text, contentWidth);
              doc.text(splitText, margin, yPosition);
              yPosition += splitText.length * 4.5;
            }
          }
        }
      }

      // Final page footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...colors.slate400);
        doc.text(
          `© ${new Date().getFullYear()} Deep Terminal | Page ${i - 1} of ${totalPages - 1}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `${symbol}_Research_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      setProgress('Report downloaded!');
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
      
      // Add a client-side timeout warning (show warning at 90s)
      const warningTimeout = setTimeout(() => {
        setProgress('Analysis is taking longer than usual... Please wait...');
      }, 90000); // Show warning after 90 seconds
      
      const response = await fetch(`/api/stock/${symbol}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies for authentication
        body: JSON.stringify({
          reportType: 'full',
          includeCharts: true,
        }),
      });
      
      clearTimeout(warningTimeout);

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
        
        // Provide specific error messages based on status code
        if (response.status === 408 || response.status === 504) {
          throw new Error(
            `Report generation timed out. This can happen with complex analyses. ` +
            `Please try again. If the issue persists, the stock may have limited data available.`
          );
        }
        
        if (response.status === 402) {
          throw new Error(errorDetails || 'Insufficient credits. Please purchase more credits to generate reports.');
        }
        
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate report';
      
      // Show helpful timeout message
      if (errorMsg.toLowerCase().includes('timeout') || errorMsg.toLowerCase().includes('timed out')) {
        setError(
          'Report generation timed out. AI analysis can take 1-2 minutes for complex stocks. ' +
          'Please try again. If the issue persists, try again in a few minutes.'
        );
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#0a0d12] to-[#0f1419] backdrop-blur-sm">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-cyan-500/[0.03]" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
      
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10">
              <FileText className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">AI Research Report</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-violet-300 border border-violet-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-white/40 mt-0.5">Powered by Claude AI</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="flex items-center gap-3 mb-4">
          {reportFeatures.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
              <feature.icon className="h-3 w-3 text-cyan-400/80" />
              <span className="text-[10px] text-white/50">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-white/50 mb-4 leading-relaxed">
          Generate a comprehensive equity research report with institutional-grade analysis, 
          valuation models, risk assessment, and AI-powered insights.
        </p>

        {/* Error state */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-400">Report Generation Failed</p>
                <p className="text-[11px] text-red-400/70 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state - Enhanced */}
        {isGenerating && !error && (
          <div className="mb-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">{progressMessage}</span>
                <span className="text-[10px] text-violet-400">{Math.round(animatedWidth)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700 ease-out"
                  style={{ width: `${animatedWidth}%` }}
                />
              </div>
            </div>
            
            {/* Stage indicators */}
            <div className="grid grid-cols-4 gap-2">
              {loadingStages.map((stage, idx) => {
                const StageIcon = stage.icon;
                const isActive = idx === activeStageIndex;
                const isComplete = idx < activeStageIndex;
                
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-violet-500/10 border border-violet-500/30' 
                        : isComplete 
                          ? 'bg-cyan-500/5 border border-cyan-500/20' 
                          : 'bg-white/[0.02] border border-white/[0.05]'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 mb-1" />
                    ) : (
                      <StageIcon className={`h-4 w-4 mb-1 ${isActive ? 'text-violet-400 animate-pulse' : 'text-white/30'}`} />
                    )}
                    <span className={`text-[9px] text-center ${isActive ? 'text-violet-300' : isComplete ? 'text-cyan-400/70' : 'text-white/30'}`}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Generate Button - Enhanced */}
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          size="lg"
          className="w-full h-11 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white border-0 font-semibold text-sm transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate PDF Report
            </>
          )}
        </Button>

        {/* Footer info */}
        <div className="mt-3 flex items-center justify-center gap-4">
          <span className="text-[10px] text-white/30 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            30-60 seconds
          </span>
          <span className="text-[10px] text-white/30">•</span>
          <span className="text-[10px] text-white/30">Professional PDF Export</span>
        </div>
      </div>
    </div>
  );
}
