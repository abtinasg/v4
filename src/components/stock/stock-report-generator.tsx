'use client';

import { useState } from 'react';
import { Download, FileText, Loader2, AlertCircle, Sparkles, Shield, TrendingUp, BarChart3, CheckCircle2, Users, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { PersonalizedReportGenerator } from './personalized-report-generator';

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

const loadingStages = [
  {
    label: 'Market Data',
    description: 'Fetching real-time market data & financials',
    keywords: ['initializing', 'fetching'],
    icon: BarChart3,
  },
  {
    label: 'AI Analysis',
    description: 'Processing 400+ metrics with Deep AI',
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

const reportFeatures = {
  pro: [
    { text: 'CFA-Level Analysis', icon: Shield },
    { text: '400+ Metrics', icon: BarChart3 },
    { text: 'Professional Grade', icon: Sparkles },
  ],
  retail: [
    { text: 'Simple Language', icon: GraduationCap },
    { text: 'Easy to Understand', icon: Users },
    { text: 'AI-Powered', icon: Sparkles },
  ],
};

export function StockReportGenerator({ symbol, companyName }: StockReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<AudienceType | null>(null);
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
      .replace(/^\s*\d+\.\s+/gm, '• ');
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
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPosition = margin;

      const isRetail = selectedAudience === 'retail';

      // Colors - Different themes for Pro vs Retail
      const primaryColor: [number, number, number] = isRetail 
        ? [6, 182, 212]   // Cyan for Retail
        : [139, 92, 246]; // Violet for Pro
      const accentColor: [number, number, number] = isRetail
        ? [20, 184, 166]  // Teal accent for Retail
        : [124, 58, 237]; // Purple accent for Pro
      const textDark: [number, number, number] = [30, 41, 59];
      const textMuted: [number, number, number] = [100, 116, 139];

      // Helper function to add new page
      const checkNewPage = (neededSpace: number = 20) => {
        if (yPosition + neededSpace > pageHeight - margin) {
          doc.addPage();
          // Add header bar on new pages
          doc.setFillColor(...primaryColor);
          doc.rect(0, 0, pageWidth, 2, 'F');
          yPosition = margin;
          return true;
        }
        return false;
      };

      // ===== COVER PAGE =====
      // Header gradient bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, isRetail ? 4 : 3, 'F');

      // Title section
      yPosition = 40;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(...textDark);
      doc.text(reportData.symbol, margin, yPosition);

      yPosition += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.setTextColor(...textMuted);
      doc.text(reportData.companyName, margin, yPosition);

      // Report type badge - Different for Pro vs Retail
      yPosition += 20;
      doc.setFillColor(...primaryColor);
      const badgeText = isRetail ? 'INVESTOR GUIDE' : 'EQUITY RESEARCH REPORT';
      const badgeWidth = isRetail ? 42 : 60;
      doc.roundedRect(margin, yPosition - 5, badgeWidth, 8, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(badgeText, margin + 3, yPosition);

      // Metadata
      yPosition += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...textMuted);
      doc.text(
        `Generated: ${new Date(reportData.generatedAt).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        margin,
        yPosition,
      );

      yPosition += 8;
      const poweredByText = isRetail 
        ? 'Powered by Deep AI • Easy-to-Understand Analysis'
        : 'Powered by Deep AI • Institutional-Grade Analysis';
      doc.text(poweredByText, margin, yPosition);

      // Retail-specific: Add a friendly intro box
      if (isRetail) {
        yPosition += 15;
        doc.setFillColor(240, 253, 250); // Light cyan background
        doc.roundedRect(margin, yPosition - 2, contentWidth, 18, 3, 3, 'F');
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPosition - 2, contentWidth, 18, 3, 3, 'S');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...primaryColor);
        doc.text('📚 What is this report?', margin + 4, yPosition + 4);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...textMuted);
        doc.text('This is a simplified stock analysis written in plain English for individual investors.', margin + 4, yPosition + 11);
        
        yPosition += 20;
      }

      // Divider
      yPosition += 5;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);

      // ===== REPORT CONTENT =====
      yPosition += 15;
      const reportText = markdownToText(reportData.report);
      const sections = reportText.split(/\n{2,}/);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(isRetail ? 11 : 10); // Slightly larger font for Retail
      doc.setTextColor(...textDark);

      for (const section of sections) {
        const trimmedSection = section.trim();
        if (!trimmedSection) continue;

        // Check if this looks like a header (starts with emoji or all caps)
        const hasEmoji = /^[\u{1F300}-\u{1F9FF}]/u.test(trimmedSection);
        const isHeader = hasEmoji || 
          (trimmedSection === trimmedSection.toUpperCase() && trimmedSection.length < 60);

        if (isHeader) {
          checkNewPage(25);
          yPosition += 10;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(isRetail ? 13 : 12);
          doc.setTextColor(...primaryColor);
          doc.text(trimmedSection, margin, yPosition);
          yPosition += 8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(isRetail ? 11 : 10);
          doc.setTextColor(...textDark);
        } else {
          // Regular paragraph - handle bullet points
          const lines = doc.splitTextToSize(trimmedSection, contentWidth);
          for (const line of lines) {
            checkNewPage(8);
            // Style bullet points
            if (line.startsWith('•')) {
              doc.setTextColor(...accentColor);
              doc.text('•', margin, yPosition);
              doc.setTextColor(...textDark);
              doc.text(line.substring(1).trim(), margin + 4, yPosition);
            } else {
              doc.text(line, margin, yPosition);
            }
            yPosition += isRetail ? 7 : 6; // More spacing for Retail
          }
          yPosition += 4;
        }
      }

      // ===== FOOTER ON LAST PAGE =====
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...textMuted);
      
      const disclaimerText = isRetail 
        ? 'This report is for educational purposes only. Always do your own research before investing.'
        : 'This report is for informational purposes only and does not constitute financial advice.';
      doc.text(disclaimerText, margin, pageHeight - 15);
      doc.text(`© ${new Date().getFullYear()} Deep Terminal`, margin, pageHeight - 10);

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
      setProgress(audienceType === 'retail' ? 'Creating simple analysis...' : 'Analyzing with Deep AI...');
      const reportResponse = await fetch(`/api/stock/${symbol}/report`, {
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
      await generatePDF(reportData);

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
              <p className="text-sm text-white/40 mt-1">Powered by Deep AI</p>
            </div>
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
              className="w-full h-10 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white border-0 font-semibold text-xs transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg group-hover:shadow-cyan-500/30"
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
    </motion.div>
  );
}
