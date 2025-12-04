'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, X, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RiskAssessmentQuiz } from './risk-assessment-quiz';
import type { RiskProfileResult } from '@/lib/risk-assessment';

interface RiskAssessmentAlertProps {
  className?: string;
}

export function RiskAssessmentAlert({ className }: RiskAssessmentAlertProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    // Check if user has completed risk assessment
    const checkAssessment = async () => {
      try {
        const response = await fetch('/api/risk-assessment');
        if (response.ok) {
          const data = await response.json();
          setHasAssessment(data.hasAssessment);
        }
      } catch (error) {
        console.error('Error checking risk assessment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check localStorage for dismissal
    const dismissed = localStorage.getItem('riskAssessmentDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Re-show after 24 hours
      if (Date.now() - dismissedTime > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('riskAssessmentDismissed');
      } else {
        setIsDismissed(true);
      }
    }

    checkAssessment();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('riskAssessmentDismissed', Date.now().toString());
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = (result: RiskProfileResult) => {
    setShowQuiz(false);
    setHasAssessment(true);
    // Optionally show a success message or refresh the page
  };

  // Don't show if loading, has assessment, or dismissed
  if (isLoading || hasAssessment || isDismissed) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!showQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/5",
              className
            )}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.05] via-transparent to-amber-500/[0.05]" />
            
            <div className="relative p-4 sm:p-5">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="shrink-0 p-2.5 rounded-xl bg-amber-500/10">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-amber-400">
                      Complete Your Risk Profile
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed mb-3">
                    Take our comprehensive 25-question assessment to get personalized investment recommendations 
                    and AI reports tailored to your risk tolerance, financial capacity, and investment goals.
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.03] text-[11px] text-white/50">
                      <Shield className="h-3 w-3" />
                      Risk Capacity Analysis
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.03] text-[11px] text-white/50">
                      📊 Asset Allocation
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.03] text-[11px] text-white/50">
                      🧠 Behavioral Insights
                    </span>
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={handleStartQuiz}
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-medium shadow-lg shadow-amber-500/20"
                  >
                    Start Risk Assessment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={handleDismiss}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4 text-white/40 hover:text-white/60" />
                </button>
              </div>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl my-8"
            >
              <RiskAssessmentQuiz
                onComplete={handleQuizComplete}
                onClose={() => setShowQuiz(false)}
                isModal
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
