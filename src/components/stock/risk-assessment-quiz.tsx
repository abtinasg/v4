'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Shield,
  Brain,
  TrendingUp,
  Target,
  PieChart,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  riskCapacityQuestions,
  riskWillingnessQuestions,
  behavioralBiasQuestions,
  calculateRiskProfile,
  getCategoryDisplayInfo,
  type AllRiskAssessmentAnswers,
  type RiskProfileResult,
} from '@/lib/risk-assessment';

interface RiskAssessmentQuizProps {
  onComplete: (result: RiskProfileResult) => void;
  onClose?: () => void;
  isModal?: boolean;
}

type QuestionSection = 'capacity' | 'willingness' | 'bias';

const SECTION_INFO: Record<QuestionSection, { 
  title: string; 
  subtitle: string; 
  description: string;
  icon: typeof Shield;
  color: string;
  bgColor: string;
}> = {
  capacity: {
    title: 'Financial Risk Capacity',
    subtitle: 'Part 1 of 3',
    description: 'This section measures your objective ability to take financial risks based on your current financial situation.',
    icon: Shield,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  willingness: {
    title: 'Risk Willingness',
    subtitle: 'Part 2 of 3',
    description: 'This section measures your psychological readiness and comfort level with investment risk.',
    icon: Brain,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  bias: {
    title: 'Behavioral Tendencies',
    subtitle: 'Part 3 of 3',
    description: 'This section identifies potential behavioral patterns that may affect your investment decisions.',
    icon: Target,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
};

export function RiskAssessmentQuiz({ onComplete, onClose, isModal = false }: RiskAssessmentQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<AllRiskAssessmentAnswers>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<RiskProfileResult | null>(null);

  // Combine all questions with proper typing
  type CombinedQuestion = {
    id: number;
    key: string;
    title: string;
    question: string;
    icon: string;
    section: QuestionSection;
    options: Array<{ value: number; label: string; description?: string }>;
    weight?: number;
    whyImportant?: string;
    note?: string;
    biasType?: string;
  };

  const allQuestions: CombinedQuestion[] = [
    ...riskCapacityQuestions.map(q => ({ ...q, section: 'capacity' as QuestionSection })),
    ...riskWillingnessQuestions.map(q => ({ ...q, section: 'willingness' as QuestionSection })),
    ...behavioralBiasQuestions.map(q => ({ ...q, section: 'bias' as QuestionSection })),
  ];

  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const currentAnswer = answers[currentQuestion?.key as keyof AllRiskAssessmentAnswers];

  // Determine current section
  const getCurrentSection = (): QuestionSection => {
    if (currentQuestionIndex < 10) return 'capacity';
    if (currentQuestionIndex < 20) return 'willingness';
    return 'bias';
  };

  const handleAnswer = useCallback((value: number) => {
    if (!currentQuestion) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.key]: value,
    }));

    // Auto-advance after a short delay
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 300);
  }, [currentQuestion, isLastQuestion]);

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentAnswer && !isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== totalQuestions) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate the result
      const calculatedResult = calculateRiskProfile(answers as AllRiskAssessmentAnswers);
      
      // Save to API
      const response = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save risk assessment');
      }

      const data = await response.json();
      setResult(data.result || calculatedResult);
      setShowResult(true);
    } catch (err) {
      console.error('Error submitting risk assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (result) {
      onComplete(result);
    }
  };

  const sectionInfo = SECTION_INFO[getCurrentSection()];
  const SectionIcon = sectionInfo.icon;

  // Result display
  if (showResult && result) {
    const categoryInfo = getCategoryDisplayInfo(result.category);
    
    return (
      <div className="relative max-w-2xl mx-auto">
        {/* Close button handled by parent modal */}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0A0C10]/90 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-white/[0.06] text-center">
            <div className={cn(
              "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4",
              categoryInfo.bgColor
            )}>
              <PieChart className={cn("h-8 w-8", categoryInfo.color)} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Risk Profile</h2>
            <div className={cn(
              "inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold",
              categoryInfo.bgColor,
              categoryInfo.color
            )}>
              {categoryInfo.label}
            </div>
          </div>

          {/* Scores */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Capacity Score */}
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs text-cyan-400 uppercase tracking-wider">Capacity</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {result.capacityScore.normalizedScore.toFixed(1)}
                  <span className="text-sm text-white/40 ml-1">/ 5.0</span>
                </div>
              </div>

              {/* Willingness Score */}
              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-violet-400" />
                  <span className="text-xs text-violet-400 uppercase tracking-wider">Willingness</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {result.willingnessScore.normalizedScore.toFixed(1)}
                  <span className="text-sm text-white/40 ml-1">/ 5.0</span>
                </div>
              </div>

              {/* Final Score */}
              <div className={cn("p-4 rounded-xl border", categoryInfo.bgColor, categoryInfo.borderColor)}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className={cn("h-4 w-4", categoryInfo.color)} />
                  <span className={cn("text-xs uppercase tracking-wider", categoryInfo.color)}>Final Score</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {result.finalScore.toFixed(2)}
                  <span className="text-sm text-white/40 ml-1">/ 5.0</span>
                </div>
              </div>
            </div>

            {/* Asset Allocation */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white mb-4">Recommended Asset Allocation</h3>
              <div className="flex items-center gap-1 h-8 rounded-lg overflow-hidden">
                {result.assetAllocation.stocks > 0 && (
                  <div 
                    className="h-full bg-emerald-500/80 flex items-center justify-center"
                    style={{ width: `${result.assetAllocation.stocks}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {result.assetAllocation.stocks}%
                    </span>
                  </div>
                )}
                {result.assetAllocation.bonds > 0 && (
                  <div 
                    className="h-full bg-blue-500/80 flex items-center justify-center"
                    style={{ width: `${result.assetAllocation.bonds}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {result.assetAllocation.bonds}%
                    </span>
                  </div>
                )}
                {(result.assetAllocation.alternatives || 0) > 0 && (
                  <div 
                    className="h-full bg-violet-500/80 flex items-center justify-center"
                    style={{ width: `${result.assetAllocation.alternatives}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {result.assetAllocation.alternatives}%
                    </span>
                  </div>
                )}
                {(result.assetAllocation.cash || 0) > 0 && (
                  <div 
                    className="h-full bg-amber-500/80 flex items-center justify-center"
                    style={{ width: `${result.assetAllocation.cash}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {result.assetAllocation.cash}%
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-white/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Stocks
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/60">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Bonds
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/60">
                  <span className="w-2 h-2 rounded-full bg-violet-500" /> Alternatives
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/60">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Cash
                </span>
              </div>
            </div>

            {/* Characteristics */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white mb-3">Your Characteristics</h3>
              <ul className="space-y-2">
                {result.characteristics.map((char, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    {char}
                  </li>
                ))}
              </ul>
            </div>

            {/* Done Button */}
            <Button
              onClick={handleFinish}
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Continue to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative max-w-2xl mx-auto pt-8">
      {/* Close button handled by parent modal */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0A0C10]/90 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        {/* Section Header */}
        <div className={cn("p-4 sm:p-6 border-b border-white/[0.06]", sectionInfo.bgColor)}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", sectionInfo.bgColor)}>
              <SectionIcon className={cn("h-5 w-5", sectionInfo.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">{sectionInfo.title}</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-xs text-white/50">
                  {sectionInfo.subtitle}
                </span>
              </div>
              <p className="text-sm text-white/50 mt-0.5">{sectionInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="px-4 sm:px-6 py-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/40">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm text-violet-400 font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Question Title with Icon */}
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">{currentQuestion.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {currentQuestion.title}
                  </h3>
                  {'weight' in currentQuestion && typeof currentQuestion.weight === 'number' && currentQuestion.weight > 1 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs mt-1">
                      Weight: ×{currentQuestion.weight}
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <p className="text-white/80 mb-6 leading-relaxed">
                {currentQuestion.question}
              </p>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all duration-200",
                      currentAnswer === option.value
                        ? "bg-violet-500/20 border-violet-500/50 text-white"
                        : "bg-white/[0.02] border-white/[0.06] text-white/80 hover:bg-white/[0.04] hover:border-white/[0.12]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                        currentAnswer === option.value
                          ? "border-violet-400 bg-violet-400"
                          : "border-white/30"
                      )}>
                        {currentAnswer === option.value && (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm">{option.label}</span>
                    </div>
                    {'description' in option && option.description && (
                      <p className="text-xs text-white/40 mt-2 ml-8">{option.description}</p>
                    )}
                  </button>
                ))}
              </div>

              {/* Why Important (for capacity questions) */}
              {'whyImportant' in currentQuestion && (
                <div className="mt-4 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                  <p className="text-xs text-cyan-400/80">
                    <strong>Why this matters:</strong> {currentQuestion.whyImportant}
                  </p>
                </div>
              )}

              {/* Bias Note (for bias questions) */}
              {'note' in currentQuestion && (
                <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-xs text-amber-400/80">
                    <strong>Note:</strong> {currentQuestion.note}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-4 sm:mx-6 mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <span className="text-sm text-rose-400">{error}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="p-4 sm:p-6 border-t border-white/[0.06] flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.05]"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!currentAnswer || isSubmitting}
              className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Assessment
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!currentAnswer}
              className="bg-white/[0.08] hover:bg-white/[0.12] text-white"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
