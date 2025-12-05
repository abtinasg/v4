'use client';

import { useState, useEffect } from 'react';
import { User, Loader2, Sparkles, Target, TrendingUp, PieChart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getCategoryDisplayInfo, type RiskProfileResult } from '@/lib/risk-assessment';
import { AiPdfViewer } from '@/components/ai/AiPdfViewer';

interface PersonalizedReportGeneratorProps {
  symbol: string;
  companyName: string;
}

export function PersonalizedReportGenerator({ symbol, companyName }: PersonalizedReportGeneratorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasRiskProfile, setHasRiskProfile] = useState(false);
  const [riskProfile, setRiskProfile] = useState<RiskProfileResult | null>(null);
  const [showViewer, setShowViewer] = useState(false);

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

  const categoryInfo = riskProfile ? getCategoryDisplayInfo(riskProfile.category) : null;

  return (
    <>
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

        <Button
          onClick={() => setShowViewer(true)}
          disabled={!hasRiskProfile || isLoading}
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
          ) : hasRiskProfile ? (
            <>
              <Sparkles className="mr-2 h-3.5 w-3.5" />
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

      {/* AI PDF Viewer Modal */}
      <AnimatePresence>
        {showViewer && (
          <AiPdfViewer 
            symbol={symbol} 
            companyName={companyName}
            audienceType="personalized"
            onClose={() => setShowViewer(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
