'use client';

import { useState } from 'react';
import { Download, FileText, Loader2, AlertCircle, Sparkles, Shield, TrendingUp, BarChart3, CheckCircle2, Users, GraduationCap, Zap, ArrowRight, Clock, FileCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { PersonalizedReportGenerator } from './personalized-report-generator';
import { AiPdfViewer } from '@/components/ai/AiPdfViewer';

type AudienceType = 'pro' | 'retail';

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

// Feature tags for each report type
const reportFeatures = {
  pro: [
    { icon: Shield, text: 'CFA-Level' },
    { icon: BarChart3, text: '400+ Metrics' },
    { icon: TrendingUp, text: 'DCF Model' },
  ],
  retail: [
    { icon: Users, text: 'Beginner-Friendly' },
    { icon: GraduationCap, text: 'Educational' },
    { icon: Zap, text: 'Quick Read' },
  ],
};

const loadingStages = [
  {
    label: 'Market Data',
    description: 'Fetching real-time market data & financials',
    keywords: ['initializing', 'fetching'],
    icon: BarChart3,
  },
  {
    label: 'AI Analysis',
    description: 'Processing 400+ metrics with Deepin AI',
    keywords: ['analyzing', 'processing'],
    icon: Sparkles,
  },
  {
    label: 'Report Gen',
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

export function StockReportGenerator({ symbol, companyName }: StockReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<AudienceType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [showViewer, setShowViewer] = useState(false);
  const normalizedProgress = progress.toLowerCase();
  const derivedStageIndex = loadingStages.findIndex((stage) =>
    stage.keywords.some((keyword) => normalizedProgress.includes(keyword)),
  );
  const activeStageIndex = derivedStageIndex === -1 ? (isGenerating ? 0 : -1) : derivedStageIndex;
  const progressPercent =
    activeStageIndex === -1 ? 0 : ((activeStageIndex + 1) / loadingStages.length) * 100;
  const animatedWidth = isGenerating ? Math.min(100, Math.max(12, progressPercent || 10)) : 0;
  const progressMessage = progress || (selectedAudience === 'retail' ? 'Creating simple analysis...' : 'Preparing institutional-grade PDF...');

  /**
   * Convert markdown to formatted text for PDF
   */
  const markdownToText = (markdown: string): string => {
    return markdown
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/^\s*[-*+]\s+/gm, '• ')
      .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
      .replace(/[\u201C\u201D]/g, '"'); // Smart double quotes
  };

  /**
   * Generate PDF from markdown report - Professional Design
   */
  const generatePDF = async (reportData: ReportResponse, audienceType: AudienceType) => {
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
      const contentWidth = pageWidth - margin * 2;
      let yPosition = margin;
      let pageNumber = 1;

      const isRetail = audienceType === 'retail';

      // Colors - Professional themes
      const primaryColor: [number, number, number] = isRetail 
        ? [6, 182, 212]   // Cyan for Retail
        : [79, 70, 229];  // Indigo for Pro (more professional)
      const accentColor: [number, number, number] = isRetail
        ? [20, 184, 166]  // Teal accent for Retail
        : [99, 102, 241]; // Lighter indigo for Pro
      const headerBg: [number, number, number] = isRetail
        ? [240, 253, 250] // Light cyan
        : [238, 242, 255]; // Light indigo
      const textDark: [number, number, number] = [17, 24, 39];
      const textMuted: [number, number, number] = [107, 114, 128];
      const borderColor: [number, number, number] = [229, 231, 235];

      // Add page header and footer
      const addPageHeaderFooter = (isFirstPage: boolean = false) => {
        // Top bar
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, isFirstPage ? 8 : 3, 'F');
        
        // Footer line
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
        
        // Page number
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textMuted);
        doc.text(`Page ${pageNumber}`, pageWidth - margin - 15, pageHeight - 12);
        
        // Footer branding
        doc.setFontSize(8);
        doc.text('Deepin', margin, pageHeight - 12);
        doc.text(reportData.symbol, margin + 30, pageHeight - 12);
      };

      // Helper function to add new page
      const checkNewPage = (neededSpace: number = 20) => {
        if (yPosition + neededSpace > pageHeight - 25) {
          doc.addPage();
          pageNumber++;
          addPageHeaderFooter();
          yPosition = margin + 5;
          return true;
        }
        return false;
      };

      // ===== COVER PAGE =====
      addPageHeaderFooter(true);

      // Logo/Brand area
      yPosition = 35;
      doc.setFillColor(...headerBg);
      doc.roundedRect(margin, yPosition - 8, contentWidth, 45, 4, 4, 'F');
      
      // Symbol
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(42);
      doc.setTextColor(...primaryColor);
      doc.text(reportData.symbol, margin + 8, yPosition + 12);

      // Company name
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.setTextColor(...textDark);
      doc.text(reportData.companyName, margin + 8, yPosition + 24);

      // Report type badge
      yPosition += 50;
      doc.setFillColor(...primaryColor);
      const badgeText = isRetail ? 'RETAIL INVESTOR GUIDE' : 'INSTITUTIONAL EQUITY RESEARCH';
      const badgeWidth = isRetail ? 55 : 70;
      doc.roundedRect(margin, yPosition - 5, badgeWidth, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(badgeText, margin + 4, yPosition + 2);

      // Metadata box
      yPosition += 25;
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margin, yPosition - 5, contentWidth, 35, 3, 3, 'F');
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPosition - 5, contentWidth, 35, 3, 3, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...textMuted);
      doc.text('REPORT DATE', margin + 8, yPosition + 3);
      doc.text('ANALYSIS TYPE', margin + 65, yPosition + 3);
      doc.text('AI ENGINE', margin + 120, yPosition + 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...textDark);
      doc.text(new Date(reportData.generatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }), margin + 8, yPosition + 12);
      doc.text(isRetail ? 'Simplified' : 'Comprehensive', margin + 65, yPosition + 12);
      doc.text('Deepin AI', margin + 120, yPosition + 12);

      doc.setFontSize(8);
      doc.setTextColor(...textMuted);
      doc.text(new Date(reportData.generatedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }), margin + 8, yPosition + 20);
      doc.text(isRetail ? '~5 pages' : '~15 pages', margin + 65, yPosition + 20);
      doc.text('o3-mini-high', margin + 120, yPosition + 20);

      // Disclaimer box
      yPosition += 50;
      doc.setFillColor(isRetail ? 240 : 254, isRetail ? 253 : 243, isRetail ? 250 : 199); // Light teal or amber
      doc.roundedRect(margin, yPosition - 3, contentWidth, 20, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(isRetail ? 13 : 180, isRetail ? 148 : 83, isRetail ? 136 : 9);
      doc.text(isRetail ? 'EDUCATIONAL PURPOSE' : 'IMPORTANT DISCLAIMER', margin + 4, yPosition + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(isRetail 
        ? 'This report is for educational purposes only and should not be considered financial advice.'
        : 'This report is for informational purposes only. It does not constitute investment advice or recommendations.',
        margin + 4, yPosition + 12);

      // Start content on new page
      doc.addPage();
      pageNumber++;
      addPageHeaderFooter();
      yPosition = margin + 10;

      // ===== REPORT CONTENT =====
      const reportText = markdownToText(reportData.report);
      const sections = reportText.split(/\n{2,}/);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(isRetail ? 11 : 10);
      doc.setTextColor(...textDark);

      let sectionNumber = 0;

      for (const section of sections) {
        const trimmedSection = section.trim();
        if (!trimmedSection) continue;

        // Check if this looks like a header
        const hasEmoji = /^[\u{1F300}-\u{1F9FF}]/u.test(trimmedSection);
        const isAllCaps = trimmedSection === trimmedSection.toUpperCase() && trimmedSection.length < 80;
        const startsWithNumber = /^\d+\./.test(trimmedSection);
        const isHeader = hasEmoji || isAllCaps || startsWithNumber;

        // Clean text for display - remove emojis and non-supported chars
        const displaySection = trimmedSection
          .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
          .replace(/[^\x20-\x7E\n\r\t•]/g, '')
          .trim();

        if (!displaySection) continue;

        if (isHeader) {
          sectionNumber++;
          checkNewPage(35);
          
          // Section divider
          if (sectionNumber > 1) {
            yPosition += 5;
            doc.setDrawColor(...borderColor);
            doc.setLineWidth(0.3);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
          }
          
          // Section header with background
          doc.setFillColor(...headerBg);
          doc.roundedRect(margin, yPosition - 4, contentWidth, 12, 2, 2, 'F');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(isRetail ? 12 : 11);
          doc.setTextColor(...primaryColor);
          doc.text(displaySection, margin + 4, yPosition + 4);
          
          yPosition += 16;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(isRetail ? 11 : 10);
          doc.setTextColor(...textDark);
        } else {
          // Regular paragraph
          const lines = doc.splitTextToSize(displaySection, contentWidth - 4);
          for (const line of lines) {
            checkNewPage(8);
            
            // Style bullet points
            if (line.trim().startsWith('•')) {
              doc.setFillColor(...accentColor);
              doc.circle(margin + 2, yPosition - 1.5, 1, 'F');
              doc.setTextColor(...textDark);
              doc.text(line.trim().substring(1).trim(), margin + 6, yPosition);
            } else {
              doc.text(line, margin + 2, yPosition);
            }
            yPosition += isRetail ? 6.5 : 5.5;
          }
          yPosition += 3;
        }
      }

      // ===== FINAL PAGE - DISCLAIMER =====
      checkNewPage(50);
      yPosition = Math.max(yPosition + 15, pageHeight - 80);
      
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPosition - 5, contentWidth, 45, 3, 3, 'F');
      doc.setDrawColor(...borderColor);
      doc.roundedRect(margin, yPosition - 5, contentWidth, 45, 3, 3, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...textDark);
      doc.text('Legal Disclaimer', margin + 4, yPosition + 3);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...textMuted);
      
      const disclaimer = isRetail
        ? 'This report is provided for educational and informational purposes only. It is not intended to be, and should not be construed as, financial advice, an offer to sell, or a solicitation of an offer to buy any securities. The information contained herein is based on sources believed to be reliable, but its accuracy cannot be guaranteed. Past performance is not indicative of future results. Always consult with a qualified financial advisor before making any investment decisions.'
        : 'This institutional research report is provided for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any securities. The information and opinions expressed herein are based on sources believed to be reliable, but their accuracy and completeness cannot be guaranteed. This report does not take into account the specific investment objectives, financial situation, or particular needs of any specific recipient. Recipients should seek professional advice before making any investment decision. The authors and Deepin disclaim all liability for any loss or damage arising from reliance on this report.';
      
      const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 10);
      let disclaimerY = yPosition + 10;
      for (const line of disclaimerLines) {
        doc.text(line, margin + 4, disclaimerY);
        disclaimerY += 4.5;
      }

      // Branding
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...primaryColor);
      doc.text(`© ${new Date().getFullYear()} Deep`, margin + 4, yPosition + 38);
      doc.setFont('helvetica', 'normal');
      doc.text('deepterm.co', margin + 50, yPosition + 38);

      // Save the PDF
      const filename = `${reportData.symbol}_${isRetail ? 'Retail' : 'Pro'}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      setProgress('PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      throw new Error('Failed to generate PDF');
    }
  };

  const handleGenerateReport = async (audienceType: AudienceType) => {
    setIsGenerating(true);
    setSelectedAudience(audienceType);
    setError(null);
    setProgress('Initializing report generation...');

    try {
      // Generate AI report (the API fetches market data internally)
      // Use parallel endpoint for faster generation (30-45s vs 60-90s)
      setProgress(audienceType === 'retail' ? 'Creating simple analysis...' : 'Analyzing with Deepin AI...');
      const useParallel = true; // Enable parallel processing for better performance
      const endpoint = useParallel 
        ? `/api/stock/${symbol}/report/parallel` 
        : `/api/stock/${symbol}/report`;
      
      const reportResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          reportType: 'full',
          audienceType,
        }),
      });

      if (!reportResponse.ok) {
        const errorData = await reportResponse.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to generate report');
      }

      const reportData: ReportResponse = await reportResponse.json();

      // Generate PDF
      setProgress('Generating PDF document...');
      await generatePDF(reportData, audienceType);

      // Clear progress after success
      setTimeout(() => {
        setProgress('');
      }, 3000);
    } catch (err) {
      console.error('Report generation error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0A0C10]/80 backdrop-blur-xl"
    >
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
      
      {/* Background ambient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] via-transparent to-cyan-500/[0.02]" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/15 to-violet-600/10 flex items-center justify-center border border-violet-500/20">
              <FileText className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">AI Research Reports</h3>
              <p className="text-sm text-white/40 mt-1">Powered by Deepin AI</p>
            </div>
          </div>
        </div>

        {/* Streaming Viewer Option - NEW */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h4 className="text-sm font-semibold text-white">AI Streaming Viewer (NEW)</h4>
                <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 uppercase tracking-wide">
                  Beta
                </span>
              </div>
              <p className="text-xs text-white/50 mb-3 leading-relaxed">
                Watch AI generate your report in real-time with streaming. Highlight key sections, add notes, and download when complete.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-0">
                <span className="text-[10px] text-indigo-400/70 px-2.5 py-1 rounded-full bg-indigo-500/[0.08] border border-indigo-500/15 flex items-center gap-1.5">
                  <Zap className="h-3 w-3" />
                  Real-time Streaming
                </span>
                <span className="text-[10px] text-indigo-400/70 px-2.5 py-1 rounded-full bg-indigo-500/[0.08] border border-indigo-500/15 flex items-center gap-1.5">
                  <Eye className="h-3 w-3" />
                  Highlight & Annotate
                </span>
                <span className="text-[10px] text-indigo-400/70 px-2.5 py-1 rounded-full bg-indigo-500/[0.08] border border-indigo-500/15 flex items-center gap-1.5">
                  <Download className="h-3 w-3" />
                  Export to PDF
                </span>
              </div>
            </div>
            <Button
              onClick={() => setShowViewer(true)}
              size="sm"
              className="h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 font-semibold text-xs transition-all duration-300 shadow-lg shadow-indigo-500/20 rounded-lg"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Open Viewer
            </Button>
          </div>
        </div>

        {/* Report Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Pro Report Card */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 transition-all group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/15 to-violet-600/10 flex items-center justify-center border border-violet-500/20">
                <Shield className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <span className="text-sm font-semibold text-white">Pro Report</span>
              <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/25 uppercase tracking-wide">
                CFA-Level
              </span>
            </div>
            <p className="text-xs text-white/50 mb-4 leading-relaxed">
              Institutional-grade analysis with 400+ metrics, valuation models, and professional terminology.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {reportFeatures.pro.map((feature, idx) => {
                const FeatureIcon = feature.icon;
                return (
                  <span key={idx} className="text-[10px] text-violet-400/70 px-2.5 py-1 rounded-full bg-violet-500/[0.08] border border-violet-500/15 flex items-center gap-1.5">
                    <FeatureIcon className="h-3 w-3" />
                    {feature.text}
                  </span>
                );
              })}
            </div>
            <Button
              onClick={() => handleGenerateReport('pro')}
              disabled={isGenerating}
              size="sm"
              className="w-full h-10 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white border-0 font-semibold text-xs transition-all duration-300 shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg group-hover:shadow-violet-500/30"
            >
              {isGenerating && selectedAudience === 'pro' ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Generate Pro Report
                </>
              )}
            </Button>
          </div>

          {/* Retail Report Card */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/30 transition-all group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/15 to-cyan-600/10 flex items-center justify-center border border-cyan-500/20">
                <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <span className="text-sm font-semibold text-white">Retail Report</span>
              <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 uppercase tracking-wide">
                Beginner Friendly
              </span>
            </div>
            <p className="text-xs text-white/50 mb-4 leading-relaxed">
              Easy-to-understand analysis with plain English explanations. Perfect for individual investors learning the market.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {reportFeatures.retail.map((feature, idx) => {
                const FeatureIcon = feature.icon;
                return (
                  <span key={idx} className="text-[10px] text-cyan-400/70 px-2.5 py-1 rounded-full bg-cyan-500/[0.08] border border-cyan-500/15 flex items-center gap-1.5">
                    <FeatureIcon className="h-3 w-3" />
                    {feature.text}
                  </span>
                );
              })}
            </div>
            <Button
              onClick={() => handleGenerateReport('retail')}
              disabled={isGenerating}
              size="sm"
              className="w-full h-10 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white border-0 font-semibold text-xs transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              {isGenerating && selectedAudience === 'retail' ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Generate Simple Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Personalized Report Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <span className="text-xs text-white/30 uppercase tracking-wider">Personalized Analysis</span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] via-transparent to-transparent" />
          </div>
          <PersonalizedReportGenerator symbol={symbol} companyName={companyName} />
        </div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-rose-400">Report Generation Failed</p>
                  <p className="text-xs text-rose-400/70 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {isGenerating && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm text-white/60 font-medium">{progressMessage}</span>
                  <span className="text-xs text-violet-400 font-semibold tabular-nums">{Math.round(animatedWidth)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${animatedWidth}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
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
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-violet-500/10 border border-violet-500/30' 
                          : isComplete 
                            ? 'bg-emerald-500/5 border border-emerald-500/20' 
                            : 'bg-white/[0.02] border border-white/[0.05]'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mb-1.5" />
                      ) : (
                        <StageIcon className={`h-4 w-4 mb-1.5 transition-all ${isActive ? 'text-violet-400 animate-pulse' : 'text-white/25'}`} />
                      )}
                      <span className={`text-[10px] font-medium text-center leading-tight ${
                        isActive ? 'text-violet-300' : isComplete ? 'text-emerald-400/70' : 'text-white/25'
                      }`}>
                        {stage.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <span className="text-xs text-white/30 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            30-60 seconds
          </span>
          <span className="text-xs text-white/20">•</span>
          <span className="text-xs text-white/30">Professional PDF Export</span>
        </div>
      </div>

      {/* AI PDF Viewer Modal */}
      <AnimatePresence>
        {showViewer && (
          <AiPdfViewer 
            symbol={symbol} 
            companyName={companyName} 
            onClose={() => setShowViewer(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
