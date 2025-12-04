'use client';

import { useState, useEffect } from 'react';
import { Download, User, Loader2, AlertCircle, Sparkles, Target, TrendingUp, PieChart, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';
import { getCategoryDisplayInfo, type RiskProfileResult } from '@/lib/risk-assessment';

interface PersonalizedReportGeneratorProps {
  symbol: string;
  companyName: string;
}

interface PersonalizedReportResponse {
  success: boolean;
  symbol: string;
  companyName: string;
  generatedAt: string;
  report: string;
  riskProfile: RiskProfileResult;
  metadata: {
    reportType: string;
  };
}

export function PersonalizedReportGenerator({ symbol, companyName }: PersonalizedReportGeneratorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasRiskProfile, setHasRiskProfile] = useState(false);
  const [riskProfile, setRiskProfile] = useState<RiskProfileResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  useEffect(() => {
    const checkRiskProfile = async () => {
      try {
        const response = await fetch('/api/risk-assessment');
        if (response.ok) {
          const data = await response.json();
          setHasRiskProfile(data.hasAssessment);
          if (data.result) {
            setRiskProfile(data.result);
          }
        }
      } catch (error) {
        console.error('Error checking risk profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRiskProfile();
  }, []);

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

  const generatePDF = async (reportData: PersonalizedReportResponse) => {
    try {
      setProgress('Creating personalized PDF...');

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

      // Get category info and profile from response
      const profile = reportData.riskProfile || riskProfile;
      const catInfo = profile ? getCategoryDisplayInfo(profile.category) : null;
      
      // Colors - Emerald/Green theme for personalized
      const primaryColor: [number, number, number] = [16, 185, 129]; // Emerald
      const accentColor: [number, number, number] = [20, 184, 166];   // Teal
      const textDark: [number, number, number] = [30, 41, 59];
      const textMuted: [number, number, number] = [100, 116, 139];
      const warningColor: [number, number, number] = [245, 158, 11]; // Amber
      const successColor: [number, number, number] = [34, 197, 94];  // Green

      const checkNewPage = (neededSpace: number = 20) => {
        if (yPosition + neededSpace > pageHeight - margin) {
          doc.addPage();
          doc.setFillColor(...primaryColor);
          doc.rect(0, 0, pageWidth, 2, 'F');
          yPosition = margin;
          return true;
        }
        return false;
      };

      // ========================================
      // PAGE 1: YOUR INVESTOR PROFILE (FULL PAGE)
      // ========================================
      
      // Header bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 6, 'F');

      // Title section
      yPosition = 30;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(...textDark);
      doc.text('Your Investor Profile', margin, yPosition);

      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...textMuted);
      doc.text('Personalized risk assessment results based on your questionnaire', margin, yPosition);

      // Profile Category Box
      if (profile) {
        yPosition += 18;
        
        // Large category box
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(margin, yPosition, contentWidth, 45, 4, 4, 'F');
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yPosition, contentWidth, 45, 4, 4, 'S');

        // Category label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(...primaryColor);
        doc.text(catInfo?.label || profile.category, margin + 8, yPosition + 18);

        // Final score
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...textDark);
        doc.text(`Risk Score: ${profile.finalScore.toFixed(2)} / 5.00`, margin + 8, yPosition + 30);

        // Score bar visual
        const barWidth = 80;
        const barHeight = 6;
        const barX = margin + 8;
        const barY = yPosition + 34;
        
        // Background bar
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
        
        // Filled bar
        const fillWidth = (profile.finalScore / 5) * barWidth;
        doc.setFillColor(...primaryColor);
        doc.roundedRect(barX, barY, fillWidth, barHeight, 2, 2, 'F');

        yPosition += 55;

        // Three Score Boxes
        const boxWidth = (contentWidth - 10) / 3;
        
        // Risk Capacity Score
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, yPosition, boxWidth, 35, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...primaryColor);
        doc.text('RISK CAPACITY', margin + 4, yPosition + 10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...textDark);
        doc.text(`${profile.capacityScore.normalizedScore.toFixed(2)}`, margin + 4, yPosition + 24);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...textMuted);
        doc.text('/ 5.00', margin + 24, yPosition + 24);

        // Risk Willingness Score
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin + boxWidth + 5, yPosition, boxWidth, 35, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...accentColor);
        doc.text('RISK WILLINGNESS', margin + boxWidth + 9, yPosition + 10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...textDark);
        doc.text(`${profile.willingnessScore.normalizedScore.toFixed(2)}`, margin + boxWidth + 9, yPosition + 24);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...textMuted);
        doc.text('/ 5.00', margin + boxWidth + 29, yPosition + 24);

        // Behavioral Bias Score
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin + (boxWidth + 5) * 2, yPosition, boxWidth, 35, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...warningColor);
        doc.text('BEHAVIORAL BIAS', margin + (boxWidth + 5) * 2 + 4, yPosition + 10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...textDark);
        doc.text(`${profile.biasScore.normalizedScore.toFixed(2)}`, margin + (boxWidth + 5) * 2 + 4, yPosition + 24);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...textMuted);
        doc.text('/ 5.00', margin + (boxWidth + 5) * 2 + 24, yPosition + 24);

        yPosition += 45;

        // Asset Allocation Section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...textDark);
        doc.text('Recommended Asset Allocation', margin, yPosition);
        yPosition += 12;

        const allocation = profile.assetAllocation;
        const allocBarWidth = contentWidth;
        const allocBarHeight = 20;
        
        // Background
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(margin, yPosition, allocBarWidth, allocBarHeight, 3, 3, 'F');

        // Stocks portion (green)
        const stocksWidth = (allocation.stocks / 100) * allocBarWidth;
        doc.setFillColor(...successColor);
        doc.roundedRect(margin, yPosition, stocksWidth, allocBarHeight, 3, 0, 'F');

        // Bonds portion (blue)
        const bondsWidth = (allocation.bonds / 100) * allocBarWidth;
        doc.setFillColor(59, 130, 246);
        doc.rect(margin + stocksWidth, yPosition, bondsWidth, allocBarHeight, 'F');

        // Alternatives portion (purple) if exists
        if (allocation.alternatives) {
          const altWidth = (allocation.alternatives / 100) * allocBarWidth;
          doc.setFillColor(139, 92, 246);
          doc.rect(margin + stocksWidth + bondsWidth, yPosition, altWidth, allocBarHeight, 'F');
        }

        // Cash portion (gray) if exists
        if (allocation.cash) {
          const cashWidth = (allocation.cash / 100) * allocBarWidth;
          doc.setFillColor(156, 163, 175);
          doc.roundedRect(margin + allocBarWidth - cashWidth, yPosition, cashWidth, allocBarHeight, 0, 3, 'F');
        }

        // Labels on bar
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        if (allocation.stocks >= 15) {
          doc.text(`${allocation.stocks}% Stocks`, margin + 4, yPosition + 13);
        }
        if (allocation.bonds >= 15) {
          doc.text(`${allocation.bonds}% Bonds`, margin + stocksWidth + 4, yPosition + 13);
        }

        yPosition += 30;

        // Legend
        const legendItems = [
          { label: `Stocks: ${allocation.stocks}%`, color: successColor },
          { label: `Bonds: ${allocation.bonds}%`, color: [59, 130, 246] as [number, number, number] },
        ];
        if (allocation.alternatives) {
          legendItems.push({ label: `Alternatives: ${allocation.alternatives}%`, color: [139, 92, 246] as [number, number, number] });
        }
        if (allocation.cash) {
          legendItems.push({ label: `Cash: ${allocation.cash}%`, color: [156, 163, 175] as [number, number, number] });
        }

        let legendX = margin;
        doc.setFontSize(8);
        for (const item of legendItems) {
          doc.setFillColor(...item.color);
          doc.circle(legendX + 2, yPosition + 2, 3, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...textDark);
          doc.text(item.label, legendX + 7, yPosition + 4);
          legendX += 40;
        }

        yPosition += 18;

        // Investor Characteristics
        if (profile.characteristics && profile.characteristics.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(...textDark);
          doc.text('Your Investor Characteristics', margin, yPosition);
          yPosition += 10;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(...textMuted);

          for (const char of profile.characteristics) {
            checkNewPage(8);
            doc.setTextColor(...primaryColor);
            doc.text('✓', margin, yPosition);
            doc.setTextColor(...textDark);
            const charLines = doc.splitTextToSize(char, contentWidth - 8);
            for (const line of charLines) {
              doc.text(line, margin + 6, yPosition);
              yPosition += 6;
            }
          }
          yPosition += 5;
        }

        // Recommended Products
        if (profile.recommendedProducts && profile.recommendedProducts.length > 0) {
          checkNewPage(30);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(...textDark);
          doc.text('Recommended Investment Products', margin, yPosition);
          yPosition += 10;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);

          for (const product of profile.recommendedProducts) {
            checkNewPage(8);
            doc.setTextColor(...accentColor);
            doc.text('•', margin, yPosition);
            doc.setTextColor(...textDark);
            doc.text(product, margin + 5, yPosition);
            yPosition += 6;
          }
        }
      }

      // Footer for page 1
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...textMuted);
      doc.text(
        `Assessment completed: ${new Date(reportData.generatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        margin,
        pageHeight - 10
      );

      // ========================================
      // PAGE 2+: STOCK ANALYSIS FOR YOUR PROFILE
      // ========================================
      doc.addPage();
      
      // Header bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 6, 'F');

      // Title
      yPosition = 30;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(...textDark);
      doc.text(`${reportData.symbol} Analysis`, margin, yPosition);

      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(...textMuted);
      doc.text(reportData.companyName, margin, yPosition);

      // Profile reminder box
      if (profile) {
        yPosition += 15;
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(margin, yPosition, contentWidth, 18, 3, 3, 'F');
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPosition, contentWidth, 18, 3, 3, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...primaryColor);
        doc.text('Analyzed for:', margin + 4, yPosition + 7);
        doc.setFont('helvetica', 'normal');
        doc.text(`${catInfo?.label || profile.category} Investor (Score: ${profile.finalScore.toFixed(2)})`, margin + 28, yPosition + 7);
        doc.text(`${profile.assetAllocation.stocks}% Stocks / ${profile.assetAllocation.bonds}% Bonds allocation`, margin + 4, yPosition + 14);
        
        yPosition += 25;
      }

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);

      // ===== REPORT CONTENT =====
      yPosition += 15;
      const reportText = markdownToText(reportData.report);
      const sections = reportText.split(/\n{2,}/);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...textDark);

      for (const section of sections) {
        const trimmedSection = section.trim();
        if (!trimmedSection) continue;

        const hasEmoji = /^[\u{1F300}-\u{1F9FF}]/u.test(trimmedSection);
        const isHeader = hasEmoji || 
          (trimmedSection === trimmedSection.toUpperCase() && trimmedSection.length < 60);

        // Clean text for display
        const displaySection = trimmedSection
          .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
          .replace(/[^\x20-\x7E\n\r\t•]/g, '')
          .trim();

        if (!displaySection) continue;

        if (isHeader) {
          checkNewPage(25);
          yPosition += 10;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(...primaryColor);
          doc.text(displaySection, margin, yPosition);
          yPosition += 8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(...textDark);
        } else {
          const lines = doc.splitTextToSize(displaySection, contentWidth);
          for (const line of lines) {
            checkNewPage(8);
            if (line.trim().startsWith('•')) {
              doc.setTextColor(...accentColor);
              doc.text('•', margin, yPosition);
              doc.setTextColor(...textDark);
              doc.text(line.trim().substring(1).trim(), margin + 4, yPosition);
            } else {
              doc.text(line, margin, yPosition);
            }
            yPosition += 6;
          }
          yPosition += 4;
        }
      }

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...textMuted);
      doc.text('This personalized report considers your risk profile but does not constitute financial advice.', margin, pageHeight - 15);
      doc.text(`© ${new Date().getFullYear()} Deep`, margin, pageHeight - 10);

      const filename = `${reportData.symbol}_Personalized_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      setProgress('PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      throw new Error('Failed to generate PDF');
    }
  };

  const handleGenerateReport = async () => {
    if (!hasRiskProfile) return;

    setIsGenerating(true);
    setError(null);
    setProgress('Analyzing stock with your risk profile...');

    try {
      const reportResponse = await fetch(`/api/stock/${symbol}/personalized-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName }),
      });

      if (!reportResponse.ok) {
        const errorData = await reportResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate personalized report');
      }

      const reportData: PersonalizedReportResponse = await reportResponse.json();
      await generatePDF(reportData);

      setTimeout(() => setProgress(''), 3000);
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const categoryInfo = riskProfile ? getCategoryDisplayInfo(riskProfile.category) : null;

  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all",
      hasRiskProfile 
        ? "bg-white/[0.02] border-white/[0.06] hover:border-emerald-500/30" 
        : "bg-white/[0.01] border-white/[0.04] opacity-60"
    )}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center border",
          hasRiskProfile 
            ? "bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border-emerald-500/20"
            : "bg-white/[0.03] border-white/[0.06]"
        )}>
          {hasRiskProfile ? (
            <User className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Lock className="h-3.5 w-3.5 text-white/30" />
          )}
        </div>
        <span className="text-sm font-semibold text-white">Personalized Report</span>
        {hasRiskProfile ? (
          <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 uppercase tracking-wide">
            Tailored
          </span>
        ) : (
          <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full bg-white/[0.06] text-white/40 border border-white/[0.06] uppercase tracking-wide">
            Locked
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-white/40 text-xs mb-4">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking profile...
        </div>
      ) : hasRiskProfile && riskProfile ? (
        <>
          <p className="text-xs text-white/50 mb-3 leading-relaxed">
            AI analysis tailored to your <span className={cn("font-medium", categoryInfo?.color)}>{categoryInfo?.label}</span> risk profile 
            with personalized recommendations and suitability assessment.
          </p>
          
          {/* Mini risk profile display */}
          <div className={cn(
            "p-2.5 rounded-lg mb-4 border",
            categoryInfo?.bgColor,
            categoryInfo?.borderColor
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className={cn("h-3.5 w-3.5", categoryInfo?.color)} />
                <span className={cn("text-xs font-medium", categoryInfo?.color)}>
                  Score: {riskProfile.finalScore.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <PieChart className="h-3 w-3 text-white/40" />
                <span className="text-[10px] text-white/40">
                  {riskProfile.assetAllocation.stocks}/{riskProfile.assetAllocation.bonds}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="text-[10px] text-emerald-400/70 px-2.5 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/15 flex items-center gap-1.5">
              <Target className="h-3 w-3" />
              Risk-Matched
            </span>
            <span className="text-[10px] text-emerald-400/70 px-2.5 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/15 flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              Suitability Score
            </span>
          </div>
        </>
      ) : (
        <p className="text-xs text-white/40 mb-4 leading-relaxed">
          Complete the risk assessment questionnaire to unlock personalized stock analysis 
          tailored to your investment profile and risk tolerance.
        </p>
      )}

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-rose-400" />
              <span className="text-xs text-rose-400">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress State */}
      <AnimatePresence>
        {isGenerating && progress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 text-emerald-400 animate-spin" />
              <span className="text-xs text-emerald-400">{progress}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={handleGenerateReport}
        disabled={!hasRiskProfile || isGenerating || isLoading}
        size="sm"
        className={cn(
          "w-full h-10 border-0 font-semibold text-xs transition-all duration-300 rounded-lg",
          hasRiskProfile
            ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20"
            : "bg-white/[0.04] text-white/30 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Loading...
          </>
        ) : isGenerating ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Generating...
          </>
        ) : hasRiskProfile ? (
          <>
            <Download className="mr-2 h-3.5 w-3.5" />
            Generate Personalized Report
          </>
        ) : (
          <>
            <Lock className="mr-2 h-3.5 w-3.5" />
            Complete Risk Assessment First
          </>
        )}
      </Button>
    </div>
  );
}
