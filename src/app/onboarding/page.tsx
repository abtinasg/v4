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
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  question: string
  description: string
  icon: React.ReactNode
  options: {
    value: string
    label: string
    description: string
    score: number
  }[]
}

const questions: Question[] = [
  {
    id: 'q1_investment_goal',
    question: 'What is your primary investment goal?',
    description: 'This helps us understand what you want to achieve with your investments.',
    icon: <Target className="h-6 w-6" />,
    options: [
      { value: 'preserve_capital', label: 'Preserve Capital', description: 'Protect my money from losing value', score: 1 },
      { value: 'generate_income', label: 'Generate Income', description: 'Regular income from dividends and interest', score: 2 },
      { value: 'balanced_growth', label: 'Balanced Growth', description: 'Moderate growth with some income', score: 3 },
      { value: 'aggressive_growth', label: 'Aggressive Growth', description: 'Maximum growth, accepting higher risk', score: 4 },
    ],
  },
  {
    id: 'q2_time_horizon',
    question: 'What is your investment time horizon?',
    description: 'How long do you plan to keep your money invested?',
    icon: <Clock className="h-6 w-6" />,
    options: [
      { value: 'less_than_1_year', label: 'Less than 1 year', description: 'Short-term needs', score: 1 },
      { value: '1_to_3_years', label: '1-3 years', description: 'Medium-term goals', score: 2 },
      { value: '3_to_10_years', label: '3-10 years', description: 'Long-term planning', score: 3 },
      { value: 'more_than_10_years', label: 'More than 10 years', description: 'Very long-term wealth building', score: 4 },
    ],
  },
  {
    id: 'q3_risk_reaction',
    question: 'If your portfolio dropped 20% in a month, what would you do?',
    description: 'Your reaction to market volatility helps us assess your risk tolerance.',
    icon: <AlertTriangle className="h-6 w-6" />,
    options: [
      { value: 'sell_all', label: 'Sell Everything', description: 'Cut losses immediately', score: 1 },
      { value: 'sell_some', label: 'Sell Some Holdings', description: 'Reduce exposure to limit further losses', score: 2 },
      { value: 'hold', label: 'Hold and Wait', description: 'Wait for the market to recover', score: 3 },
      { value: 'buy_more', label: 'Buy More', description: 'See it as a buying opportunity', score: 4 },
    ],
  },
  {
    id: 'q4_loss_tolerance',
    question: 'What is the maximum loss you could tolerate in a year?',
    description: 'This helps us understand your comfort level with potential losses.',
    icon: <Shield className="h-6 w-6" />,
    options: [
      { value: '5_percent', label: 'Up to 5%', description: 'Very low risk tolerance', score: 1 },
      { value: '10_percent', label: 'Up to 10%', description: 'Low risk tolerance', score: 2 },
      { value: '20_percent', label: 'Up to 20%', description: 'Moderate risk tolerance', score: 3 },
      { value: 'more_than_20_percent', label: 'More than 20%', description: 'High risk tolerance', score: 4 },
    ],
  },
  {
    id: 'q5_investment_experience',
    question: 'How would you describe your investment experience?',
    description: 'Your experience level helps us tailor recommendations.',
    icon: <BookOpen className="h-6 w-6" />,
    options: [
      { value: 'none', label: 'No Experience', description: 'Never invested before', score: 1 },
      { value: 'basic', label: 'Basic', description: 'Some experience with simple investments', score: 2 },
      { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with various investment types', score: 3 },
      { value: 'advanced', label: 'Advanced', description: 'Extensive experience with complex strategies', score: 4 },
    ],
  },
  {
    id: 'q6_income_stability',
    question: 'How stable is your income?',
    description: 'Income stability affects your ability to take investment risks.',
    icon: <Briefcase className="h-6 w-6" />,
    options: [
      { value: 'unstable', label: 'Unstable', description: 'Income varies significantly or uncertain', score: 1 },
      { value: 'somewhat_stable', label: 'Somewhat Stable', description: 'Some variation but generally reliable', score: 2 },
      { value: 'stable', label: 'Stable', description: 'Consistent and reliable income', score: 3 },
      { value: 'very_stable', label: 'Very Stable', description: 'Very secure, multiple income sources', score: 4 },
    ],
  },
  {
    id: 'q7_emergency_fund',
    question: 'Do you have an emergency fund?',
    description: 'Having emergency savings affects your investment risk capacity.',
    icon: <DollarSign className="h-6 w-6" />,
    options: [
      { value: 'none', label: 'No Emergency Fund', description: 'No dedicated emergency savings', score: 1 },
      { value: 'partial', label: '1-3 Months Expenses', description: 'Basic emergency coverage', score: 2 },
      { value: 'moderate', label: '3-6 Months Expenses', description: 'Moderate emergency coverage', score: 3 },
      { value: 'substantial', label: '6+ Months Expenses', description: 'Substantial emergency coverage', score: 4 },
    ],
  },
  {
    id: 'q8_investment_knowledge',
    question: 'How would you rate your investment knowledge?',
    description: 'Understanding your knowledge level helps us provide appropriate guidance.',
    icon: <TrendingUp className="h-6 w-6" />,
    options: [
      { value: 'limited', label: 'Limited', description: 'Basic understanding of savings and stocks', score: 1 },
      { value: 'moderate', label: 'Moderate', description: 'Understand diversification and risk', score: 2 },
      { value: 'good', label: 'Good', description: 'Can analyze financial statements', score: 3 },
      { value: 'excellent', label: 'Excellent', description: 'Deep understanding of markets and strategies', score: 4 },
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
            // User already completed onboarding, redirect to dashboard
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

  const calculateRiskProfile = () => {
    let totalScore = 0
    questions.forEach(q => {
      const answer = answers[q.id]
      const option = q.options.find(o => o.value === answer)
      if (option) {
        totalScore += option.score
      }
    })

    const maxScore = questions.length * 4
    const percentage = (totalScore / maxScore) * 100

    let riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    let investmentHorizon: 'short_term' | 'medium_term' | 'long_term'
    let investmentExperience: 'beginner' | 'intermediate' | 'advanced'

    // Determine risk tolerance
    if (percentage < 40) {
      riskTolerance = 'conservative'
    } else if (percentage < 70) {
      riskTolerance = 'moderate'
    } else {
      riskTolerance = 'aggressive'
    }

    // Determine investment horizon based on time horizon answer
    const timeAnswer = answers['q2_time_horizon']
    if (timeAnswer === 'less_than_1_year' || timeAnswer === '1_to_3_years') {
      investmentHorizon = 'short_term'
    } else if (timeAnswer === '3_to_10_years') {
      investmentHorizon = 'medium_term'
    } else {
      investmentHorizon = 'long_term'
    }

    // Determine experience level
    const expAnswer = answers['q5_investment_experience']
    if (expAnswer === 'none' || expAnswer === 'basic') {
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
      // Still show results even if save fails
      setRiskProfile(profile)
      setShowResults(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = () => {
    // Use window.location to ensure cookies are properly sent
    window.location.href = '/dashboard'
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

  const getRiskDescription = (tolerance: string) => {
    switch (tolerance) {
      case 'conservative':
        return 'You prefer stability and capital preservation. We\'ll focus on lower-risk investments with steady returns.'
      case 'moderate':
        return 'You\'re comfortable with some volatility for better returns. We\'ll balance growth and stability.'
      case 'aggressive':
        return 'You\'re willing to accept higher risk for potentially higher returns. We\'ll focus on growth opportunities.'
      default:
        return ''
    }
  }

  if (showResults && riskProfile) {
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <div className={cn('text-lg font-semibold capitalize', getRiskColor(riskProfile.riskTolerance))}>
                    {riskProfile.riskTolerance}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Risk Tolerance</div>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <div className="text-lg font-semibold text-white capitalize">
                    {riskProfile.investmentHorizon.replace('_', ' ')}
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
                    className={cn(
                      'h-3 rounded-full',
                      riskProfile.riskScore < 40 ? 'bg-blue-500' :
                      riskProfile.riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                  />
                </div>
              </div>

              <p className="text-zinc-300 text-center text-sm leading-relaxed">
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
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                {currentQ?.icon}
              </div>
              <div>
                <p className="text-xs text-zinc-500">Question {currentQuestion + 1} of {questions.length}</p>
                <CardTitle className="text-lg font-semibold text-white">Risk Assessment</CardTitle>
              </div>
            </div>
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
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50'
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={cn(
                          'font-medium',
                          answers[currentQ.id] === option.value ? 'text-emerald-400' : 'text-white'
                        )}>
                          {option.label}
                        </div>
                        <div className="text-sm text-zinc-500 mt-0.5">{option.description}</div>
                      </div>
                      {answers[currentQ.id] === option.value && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
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
                onClick={() => setCurrentQuestion(prev => prev + 1)}
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
