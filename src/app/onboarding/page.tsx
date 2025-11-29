'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Shield, 
  Target, 
  Clock, 
  DollarSign,
  AlertTriangle,
  BookOpen,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  XCircle,
  PiggyBank,
  LineChart,
  Wallet,
  Scale,
  GraduationCap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  question: string
  description: string
  icon: React.ReactNode
  isBlockingQuestion?: boolean // If true, score 0 blocks the user
  options: {
    value: string
    label: string
    description: string
    score: number
  }[]
}

const questions: Question[] = [
  // Question 1: Emergency Fund (BLOCKING QUESTION)
  {
    id: 'q1_emergency_fund',
    question: 'How much cash or liquid assets do you have available for emergencies?',
    description: 'This is a gateway question. Having an emergency fund is essential before investing.',
    icon: <PiggyBank className="h-6 w-6" />,
    isBlockingQuestion: true,
    options: [
      { value: 'less_than_3_months', label: 'Less than 3 months of expenses', description: 'Limited emergency coverage', score: 0 },
      { value: '3_to_6_months', label: '3-6 months of expenses', description: 'Basic emergency coverage', score: 1 },
      { value: '6_to_12_months', label: '6-12 months of expenses', description: 'Solid emergency coverage', score: 2 },
      { value: 'more_than_12_months', label: 'More than 12 months of expenses', description: 'Comprehensive emergency coverage', score: 3 },
    ],
  },
  // Question 2: Investment Time Horizon
  {
    id: 'q2_time_horizon',
    question: 'When do you expect to need this money?',
    description: 'Your investment timeline directly impacts your risk capacity.',
    icon: <Clock className="h-6 w-6" />,
    options: [
      { value: 'less_than_1_year', label: 'Less than 1 year', description: 'Very short-term needs', score: 1 },
      { value: '1_to_3_years', label: '1-3 years', description: 'Short-term goals', score: 2 },
      { value: '3_to_5_years', label: '3-5 years', description: 'Medium-term planning', score: 3 },
      { value: '5_to_10_years', label: '5-10 years', description: 'Long-term goals', score: 4 },
      { value: 'more_than_10_years', label: 'More than 10 years', description: 'Very long-term wealth building', score: 5 },
    ],
  },
  // Question 3: Reaction to Market Decline
  {
    id: 'q3_market_decline',
    question: 'If your portfolio lost 25% of its value in one month, what would you do?',
    description: 'Your emotional response to volatility reveals your true risk tolerance.',
    icon: <TrendingUp className="h-6 w-6" />,
    options: [
      { value: 'sell_everything', label: 'Sell everything immediately', description: 'Cannot tolerate any more losses', score: 1 },
      { value: 'sell_some', label: 'Sell some to reduce risk', description: 'Want to limit further downside', score: 2 },
      { value: 'hold_steady', label: 'Hold and wait for recovery', description: 'Trust the long-term process', score: 3 },
      { value: 'buy_more', label: 'Buy more at lower prices', description: 'See opportunity in volatility', score: 4 },
    ],
  },
  // Question 4: Maximum Acceptable Loss
  {
    id: 'q4_max_loss',
    question: 'What is the maximum portfolio decline you could accept in a year?',
    description: 'Be honest - this determines appropriate risk levels for you.',
    icon: <Shield className="h-6 w-6" />,
    options: [
      { value: 'up_to_5_percent', label: 'Up to 5%', description: 'Very conservative risk tolerance', score: 1 },
      { value: 'up_to_10_percent', label: 'Up to 10%', description: 'Conservative risk tolerance', score: 2 },
      { value: 'up_to_20_percent', label: 'Up to 20%', description: 'Moderate risk tolerance', score: 3 },
      { value: 'up_to_30_percent', label: 'Up to 30%', description: 'Aggressive risk tolerance', score: 4 },
      { value: 'more_than_30_percent', label: 'More than 30%', description: 'Very aggressive risk tolerance', score: 5 },
    ],
  },
  // Question 5: Investment Experience
  {
    id: 'q5_experience',
    question: 'How would you describe your investment experience?',
    description: 'Your experience level helps us calibrate recommendations.',
    icon: <GraduationCap className="h-6 w-6" />,
    options: [
      { value: 'none', label: 'No experience', description: 'Never invested before', score: 1 },
      { value: 'beginner', label: 'Beginner', description: '1-2 years of basic investing', score: 2 },
      { value: 'intermediate', label: 'Intermediate', description: '3-5 years with various asset types', score: 3 },
      { value: 'advanced', label: 'Advanced', description: '5+ years with complex strategies', score: 4 },
    ],
  },
  // Question 6: Income Stability
  {
    id: 'q6_income_stability',
    question: 'How stable and predictable is your income?',
    description: 'Stable income allows for higher investment risk capacity.',
    icon: <Briefcase className="h-6 w-6" />,
    options: [
      { value: 'very_unstable', label: 'Very unstable', description: 'Irregular or unpredictable income', score: 1 },
      { value: 'somewhat_unstable', label: 'Somewhat unstable', description: 'Variable but generally manageable', score: 2 },
      { value: 'stable', label: 'Stable', description: 'Consistent salary or income', score: 3 },
      { value: 'very_stable', label: 'Very stable', description: 'Secure job with multiple income sources', score: 4 },
    ],
  },
  // Question 7: Investment Goal
  {
    id: 'q7_investment_goal',
    question: 'What is your primary investment objective?',
    description: 'Different goals require different risk approaches.',
    icon: <Target className="h-6 w-6" />,
    options: [
      { value: 'capital_preservation', label: 'Capital Preservation', description: 'Protect principal above all else', score: 1 },
      { value: 'income_generation', label: 'Income Generation', description: 'Steady dividends and interest', score: 2 },
      { value: 'balanced_growth', label: 'Balanced Growth', description: 'Mix of growth and income', score: 3 },
      { value: 'aggressive_growth', label: 'Aggressive Growth', description: 'Maximize long-term returns', score: 4 },
    ],
  },
  // Question 8: Risk vs Return Preference
  {
    id: 'q8_risk_return',
    question: 'Which statement best describes your investment philosophy?',
    description: 'This helps us understand your risk-return tradeoff preference.',
    icon: <Scale className="h-6 w-6" />,
    options: [
      { value: 'minimize_risk', label: 'I want to minimize risk even if returns are lower', description: 'Safety is my priority', score: 1 },
      { value: 'balanced', label: 'I want balanced risk and return', description: 'Moderate approach', score: 2 },
      { value: 'higher_returns', label: 'I\'m willing to take more risk for higher returns', description: 'Growth focused', score: 3 },
      { value: 'maximize_returns', label: 'I want maximum returns and can handle significant volatility', description: 'Aggressive approach', score: 4 },
    ],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showBlockedScreen, setShowBlockedScreen] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [riskProfile, setRiskProfile] = useState<{
    riskTolerance: string
    investmentHorizon: string
    investmentExperience: string
    riskScore: number
  } | null>(null)

  // Check if user already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isLoaded || !user) return
      
      try {
        const response = await fetch('/api/onboarding/status')
        if (response.ok) {
          const { needsOnboarding } = await response.json()
          if (!needsOnboarding) {
            window.location.href = '/dashboard'
            return
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      }
      setIsChecking(false)
    }

    checkOnboardingStatus()
  }, [isLoaded, user])

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const checkBlockingQuestion = () => {
    const currentQ = questions[currentQuestion]
    if (currentQ.isBlockingQuestion) {
      const answer = answers[currentQ.id]
      const option = currentQ.options.find(o => o.value === answer)
      if (option && option.score === 0) {
        return true // User is blocked
      }
    }
    return false
  }

  const handleNext = () => {
    // Check if this is a blocking question with score 0
    if (checkBlockingQuestion()) {
      setShowBlockedScreen(true)
      return
    }
    setCurrentQuestion(prev => prev + 1)
  }

  const calculateRiskProfile = () => {
    let totalScore = 0
    let maxPossibleScore = 0
    
    questions.forEach(q => {
      const answer = answers[q.id]
      const option = q.options.find(o => o.value === answer)
      if (option) {
        totalScore += option.score
      }
      // Calculate max possible score for this question
      const maxOptionScore = Math.max(...q.options.map(o => o.score))
      maxPossibleScore += maxOptionScore
    })

    const percentage = (totalScore / maxPossibleScore) * 100

    let riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    let investmentHorizon: 'short_term' | 'medium_term' | 'long_term'
    let investmentExperience: 'beginner' | 'intermediate' | 'advanced'

    // Determine risk tolerance based on overall score
    if (percentage < 35) {
      riskTolerance = 'conservative'
    } else if (percentage < 65) {
      riskTolerance = 'moderate'
    } else {
      riskTolerance = 'aggressive'
    }

    // Determine investment horizon based on time horizon answer
    const timeAnswer = answers['q2_time_horizon']
    if (timeAnswer === 'less_than_1_year' || timeAnswer === '1_to_3_years') {
      investmentHorizon = 'short_term'
    } else if (timeAnswer === '3_to_5_years' || timeAnswer === '5_to_10_years') {
      investmentHorizon = 'medium_term'
    } else {
      investmentHorizon = 'long_term'
    }

    // Determine experience level
    const expAnswer = answers['q5_experience']
    if (expAnswer === 'none' || expAnswer === 'beginner') {
      investmentExperience = 'beginner'
    } else if (expAnswer === 'intermediate') {
      investmentExperience = 'intermediate'
    } else {
      investmentExperience = 'advanced'
    }

    return {
      riskTolerance,
      investmentHorizon,
      investmentExperience,
      riskScore: percentage,
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const profile = calculateRiskProfile()
    
    try {
      const response = await fetch('/api/onboarding/risk-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          answers,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save risk profile')
      }

      setRiskProfile(profile)
      setShowResults(true)
    } catch (error) {
      console.error('Error saving risk profile:', error)
      setRiskProfile(profile)
      setShowResults(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = () => {
    window.location.href = '/dashboard'
  }

  const handleGoToEducation = () => {
    window.location.href = '/education/emergency-fund'
  }

  const currentQ = questions[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1
  const canProceed = answers[currentQ?.id]

  // Show loading while checking onboarding status
  if (isChecking || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show blocked screen if user doesn't have emergency fund
  if (showBlockedScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-2xl border-0 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl font-bold text-white">Build Your Emergency Fund First</CardTitle>
              <CardDescription className="text-zinc-400 mt-2">
                Before you start investing, it&apos;s important to have a financial safety net.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-amber-400 mb-3">Why This Matters</h3>
                <ul className="space-y-2 text-zinc-300 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>An emergency fund protects you from having to sell investments at a loss during unexpected events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>It provides peace of mind and allows you to take appropriate investment risks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>Financial experts recommend 3-6 months of expenses before investing</span>
                  </li>
                </ul>
              </div>

              <div className="bg-zinc-800/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Recommended Next Steps</h3>
                <ol className="space-y-2 text-zinc-300 text-sm list-decimal list-inside">
                  <li>Calculate your monthly essential expenses</li>
                  <li>Set a goal to save 3-6 months worth</li>
                  <li>Keep it in a high-yield savings account</li>
                  <li>Come back once you&apos;ve built your safety net</li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleGoToEducation}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white py-6"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Learn About Emergency Funds
                </Button>
              </div>

              <p className="text-xs text-zinc-500 text-center">
                Once you&apos;ve built your emergency fund, you can sign out and sign back in to retake the assessment.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const getRiskColor = (tolerance: string) => {
    switch (tolerance) {
      case 'conservative':
        return 'text-blue-500'
      case 'moderate':
        return 'text-yellow-500'
      case 'aggressive':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getRiskBgColor = (tolerance: string) => {
    switch (tolerance) {
      case 'conservative':
        return 'bg-blue-500'
      case 'moderate':
        return 'bg-yellow-500'
      case 'aggressive':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRiskDescription = (tolerance: string) => {
    switch (tolerance) {
      case 'conservative':
        return 'You prefer stability and capital preservation. We recommend focusing on bonds, dividend stocks, and low-volatility investments. Your portfolio should prioritize steady, reliable returns over aggressive growth.'
      case 'moderate':
        return 'You\'re comfortable with some volatility for better returns. A balanced mix of stocks and bonds would suit you well. You can handle market fluctuations but prefer not to take extreme risks.'
      case 'aggressive':
        return 'You\'re willing to accept significant volatility for potentially higher returns. Growth stocks and higher-risk investments could be appropriate. You have the temperament and time horizon to ride out market downturns.'
      default:
        return ''
    }
  }

  const getRecommendedAllocation = (tolerance: string) => {
    switch (tolerance) {
      case 'conservative':
        return { stocks: 30, bonds: 50, cash: 20 }
      case 'moderate':
        return { stocks: 60, bonds: 30, cash: 10 }
      case 'aggressive':
        return { stocks: 85, bonds: 10, cash: 5 }
      default:
        return { stocks: 60, bonds: 30, cash: 10 }
    }
  }

  if (showResults && riskProfile) {
    const allocation = getRecommendedAllocation(riskProfile.riskTolerance)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-0 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl font-bold text-white">Your Risk Profile</CardTitle>
              <CardDescription className="text-zinc-400">
                Based on your answers, here&apos;s your personalized investment profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Profile Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <div className={cn('text-lg font-semibold capitalize', getRiskColor(riskProfile.riskTolerance))}>
                    {riskProfile.riskTolerance}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Risk Tolerance</div>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <div className="text-lg font-semibold text-white capitalize">
                    {riskProfile.investmentHorizon.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Time Horizon</div>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <div className="text-lg font-semibold text-white capitalize">
                    {riskProfile.investmentExperience}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Experience Level</div>
                </div>
              </div>

              {/* Risk Score */}
              <div className="bg-zinc-800/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-zinc-400">Risk Score</span>
                  <span className="text-2xl font-bold text-white">{Math.round(riskProfile.riskScore)}/100</span>
                </div>
                <div className="w-full bg-zinc-700/50 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${riskProfile.riskScore}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className={cn('h-3 rounded-full', getRiskBgColor(riskProfile.riskTolerance))}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mt-2">
                  <span>Conservative</span>
                  <span>Moderate</span>
                  <span>Aggressive</span>
                </div>
              </div>

              {/* Recommended Allocation */}
              <div className="bg-zinc-800/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-zinc-400 mb-4">Suggested Asset Allocation</h3>
                <div className="flex h-4 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${allocation.stocks}%` }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="bg-emerald-500"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${allocation.bonds}%` }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="bg-blue-500"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${allocation.cash}%` }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                    className="bg-zinc-500"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-zinc-300">Stocks {allocation.stocks}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-zinc-300">Bonds {allocation.bonds}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-500" />
                    <span className="text-zinc-300">Cash {allocation.cash}%</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-zinc-300 text-sm leading-relaxed">
                {getRiskDescription(riskProfile.riskTolerance)}
              </p>

              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-6 text-lg font-medium"
              >
                Continue to Dashboard
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl border-0 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center text-emerald-400">
                {currentQ?.icon}
              </div>
              <div>
                <p className="text-xs text-zinc-500">Question {currentQuestion + 1} of {questions.length}</p>
                <CardTitle className="text-lg font-semibold text-white">Risk Assessment</CardTitle>
              </div>
            </div>
            {currentQ?.isBlockingQuestion && (
              <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs text-amber-400 font-medium">Gateway Question</span>
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-zinc-800 rounded-full h-1.5">
            <motion.div
              className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-2">{currentQ?.question}</h2>
              <p className="text-sm text-zinc-400 mb-6">{currentQ?.description}</p>

              <div className="grid grid-cols-1 gap-3">
                {currentQ?.options.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleAnswer(currentQ.id, option.value)}
                    className={cn(
                      'w-full p-4 rounded-xl border text-left transition-all duration-200',
                      answers[currentQ.id] === option.value
                        ? option.score === 0 
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-emerald-500 bg-emerald-500/10'
                        : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50'
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={cn(
                          'font-medium',
                          answers[currentQ.id] === option.value 
                            ? option.score === 0 ? 'text-amber-400' : 'text-emerald-400'
                            : 'text-white'
                        )}>
                          {option.label}
                        </div>
                        <div className="text-sm text-zinc-500 mt-0.5">{option.description}</div>
                      </div>
                      {answers[currentQ.id] === option.value && (
                        option.score === 0 ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        )
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Warning for blocking answer */}
              {currentQ?.isBlockingQuestion && answers[currentQ.id] === 'less_than_3_months' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-400 font-medium">Important Notice</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        We recommend building an emergency fund before investing. Proceeding will show you resources to help you get started.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
              className="text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    See Results
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
