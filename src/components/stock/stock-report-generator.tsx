'use client';

import { useState } from 'react';
import { Download, FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import jsPDF from 'jspdf';
import { marked } from 'marked';

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

export function StockReportGenerator({ symbol, companyName }: StockReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

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
    <Card className="relative overflow-hidden border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/30 backdrop-blur-sm">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-purple-600/10 opacity-50 animate-pulse" />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <FileText className="h-6 w-6 text-violet-400" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-pulse" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent font-bold">
                AI Investment Report
              </CardTitle>
              <Badge variant="secondary" className="bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 border-violet-500/30 animate-pulse">
                <Sparkles className="h-3 w-3 mr-1" />
                Pro Feature
              </Badge>
            </div>
            <CardDescription className="text-slate-300 text-base">
              Generate a comprehensive, CFA-level investment analysis powered by{' '}
              <span className="font-semibold text-violet-400">Claude Opus 4.5</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* Features grid with enhanced styling */}
        <div className="grid gap-4">
          <div className="group flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10">
            <div className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 group-hover:scale-125 transition-transform" />
            <div>
              <p className="text-slate-100 font-medium">
                🎯 Deep Analysis
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Comprehensive review of {companyName} with 170+ financial metrics and industry benchmarks
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10">
            <div className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:scale-125 transition-transform" />
            <div>
              <p className="text-slate-100 font-medium">
                📊 Professional Grade
              </p>
              <p className="text-sm text-slate-400 mt-1">
                CFA Institute framework with DCF valuation, risk assessment, and competitive analysis
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10">
            <div className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 group-hover:scale-125 transition-transform" />
            <div>
              <p className="text-slate-100 font-medium">
                🤖 AI-Powered Intelligence
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Advanced synthesis by Claude Opus 4.5 - trained on institutional research standards
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10">
            <div className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-pink-400 to-red-400 group-hover:scale-125 transition-transform" />
            <div>
              <p className="text-slate-100 font-medium">
                📄 Professional PDF
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Beautifully formatted document ready for investment committees and presentations
              </p>
            </div>
          </div>
        </div>

        {/* Preview badge */}
        <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 border border-violet-500/20">
          <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
          <span className="text-sm text-violet-300 font-medium">
            Institutional-grade analysis in under 60 seconds
          </span>
          <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-900 bg-red-950/50 animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {progress && !error && (
          <Alert className="border-violet-800 bg-gradient-to-r from-violet-950/50 to-indigo-950/50 animate-in fade-in-50">
            <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
            <AlertDescription className="text-violet-200 font-medium">{progress}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          size="lg"
          className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-lg py-6 shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Your Report...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Generate Investment Report
              <Sparkles className="ml-2 h-4 w-4 animate-pulse" />
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="inline-block h-1 w-1 rounded-full bg-slate-500" />
          <p>
            Typically takes 30-60 seconds • Powered by Claude Opus 4.5
          </p>
          <span className="inline-block h-1 w-1 rounded-full bg-slate-500" />
        </div>
      </CardContent>
    </Card>
  );
}
