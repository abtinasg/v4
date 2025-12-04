// ==================== RISK ASSESSMENT CALCULATOR ====================
// Scoring and calculation logic for the risk assessment

import type {
  AllRiskAssessmentAnswers,
  RiskCapacityScore,
  RiskWillingnessScore,
  BehavioralBiasScore,
  RiskProfileResult,
  RiskProfileCategory,
} from './types';
import { riskCapacityQuestions } from './questions';

// Question weights for capacity scoring
const CAPACITY_WEIGHTS: Record<string, number> = {
  q1_emergency_fund: 3,
  q2_income_stability: 2,
  q3_investment_to_income_ratio: 3,
  q4_investment_horizon: 2,
  q5_liquidity_needs: 2,
  q6_debt_ratio: 3,
  q7_age: 1,
  q8_dependents: 1,
  q9_insurance_coverage: 1,
  q10_investment_experience: 2,
};

// Total weight for capacity questions
const TOTAL_CAPACITY_WEIGHT = Object.values(CAPACITY_WEIGHTS).reduce((a, b) => a + b, 0); // 20

/**
 * Calculate Risk Capacity Score
 * Formula: (Q1×3 + Q2×2 + Q3×3 + Q4×2 + Q5×2 + Q6×3 + Q7×1 + Q8×1 + Q9×1 + Q10×2) / 20
 * Range: 1.0 - 5.0
 */
export function calculateCapacityScore(answers: AllRiskAssessmentAnswers): RiskCapacityScore {
  let weightedSum = 0;
  let rawSum = 0;
  
  for (const [key, weight] of Object.entries(CAPACITY_WEIGHTS)) {
    const answer = answers[key as keyof AllRiskAssessmentAnswers] || 0;
    weightedSum += answer * weight;
    rawSum += answer;
  }
  
  const normalizedScore = weightedSum / TOTAL_CAPACITY_WEIGHT;
  
  // Determine interpretation
  let interpretation: RiskCapacityScore['interpretation'];
  if (normalizedScore <= 2.0) {
    interpretation = 'very_low';
  } else if (normalizedScore <= 3.0) {
    interpretation = 'low_to_moderate';
  } else if (normalizedScore <= 4.0) {
    interpretation = 'moderate_to_good';
  } else {
    interpretation = 'high';
  }
  
  return {
    rawScore: rawSum,
    weightedScore: weightedSum,
    normalizedScore: Math.round(normalizedScore * 100) / 100,
    interpretation,
  };
}

/**
 * Calculate Risk Willingness Score
 * Formula: (Q11 + Q12 + Q13 + Q14 + Q15 + Q16 + Q17 + Q18 + Q19 + Q20) / 10
 * Range: 1.0 - 5.0
 */
export function calculateWillingnessScore(answers: AllRiskAssessmentAnswers): RiskWillingnessScore {
  const willingnessKeys = [
    'q11_reaction_to_20_drop',
    'q12_max_tolerable_loss',
    'q13_return_preference',
    'q14_reaction_to_30_gain',
    'q15_diversification_preference',
    'q16_market_volatility_reaction',
    'q17_uncertainty_comfort',
    'q18_investment_goal_priority',
    'q19_past_loss_experience',
    'q20_financial_knowledge_self_assessment',
  ];
  
  let rawSum = 0;
  for (const key of willingnessKeys) {
    rawSum += answers[key as keyof AllRiskAssessmentAnswers] || 0;
  }
  
  const normalizedScore = rawSum / 10;
  
  // Determine interpretation
  let interpretation: RiskWillingnessScore['interpretation'];
  if (normalizedScore <= 2.0) {
    interpretation = 'very_low';
  } else if (normalizedScore <= 3.0) {
    interpretation = 'low_to_moderate';
  } else if (normalizedScore <= 4.0) {
    interpretation = 'moderate_to_high';
  } else {
    interpretation = 'high';
  }
  
  return {
    rawScore: rawSum,
    normalizedScore: Math.round(normalizedScore * 100) / 100,
    interpretation,
  };
}

/**
 * Calculate Behavioral Bias Score
 * Formula: 6 - [(Q21 + Q22 + Q23 + Q24 + Q25) / 5]
 * Range: 1.0 - 5.0 (lower is better)
 */
export function calculateBiasScore(answers: AllRiskAssessmentAnswers): BehavioralBiasScore {
  const biasKeys = [
    'q21_decision_confidence',
    'q22_loss_vs_gain_focus',
    'q23_investment_idea_sources',
    'q24_selling_decision',
    'q25_post_decision_review',
  ];
  
  let rawSum = 0;
  const biasDetails = {
    overconfidence: answers.q21_decision_confidence || 0,
    lossAversion: answers.q22_loss_vs_gain_focus || 0,
    herding: answers.q23_investment_idea_sources || 0,
    dispositionEffect: answers.q24_selling_decision || 0,
    hindsightBias: answers.q25_post_decision_review || 0,
  };
  
  for (const key of biasKeys) {
    rawSum += answers[key as keyof AllRiskAssessmentAnswers] || 0;
  }
  
  // Reverse scoring: 6 - average
  const normalizedScore = 6 - (rawSum / 5);
  
  // Determine interpretation (lower is better)
  let interpretation: BehavioralBiasScore['interpretation'];
  if (normalizedScore <= 2.0) {
    interpretation = 'low'; // Good ✅
  } else if (normalizedScore <= 3.5) {
    interpretation = 'moderate'; // Acceptable
  } else {
    interpretation = 'high'; // Needs awareness ⚠️
  }
  
  return {
    rawScore: rawSum,
    normalizedScore: Math.round(normalizedScore * 100) / 100,
    interpretation,
    biasDetails,
  };
}

/**
 * Calculate Final Risk Profile Score
 * Formula: (Capacity × 0.5) + (Willingness × 0.4) - (Bias × 0.1)
 * Range: 1.0 - 5.0
 */
export function calculateFinalScore(
  capacityScore: number,
  willingnessScore: number,
  biasScore: number
): number {
  const finalScore = (capacityScore * 0.5) + (willingnessScore * 0.4) - (biasScore * 0.1);
  return Math.round(Math.max(1, Math.min(5, finalScore)) * 100) / 100;
}

/**
 * Determine Risk Profile Category
 */
export function determineCategory(finalScore: number): RiskProfileCategory {
  if (finalScore <= 2.0) return 'conservative';
  if (finalScore <= 2.8) return 'moderate_conservative';
  if (finalScore <= 3.5) return 'balanced';
  if (finalScore <= 4.3) return 'growth';
  return 'aggressive';
}

/**
 * Get characteristics for each risk profile category
 */
export function getCategoryCharacteristics(category: RiskProfileCategory): string[] {
  const characteristics: Record<RiskProfileCategory, string[]> = {
    conservative: [
      'Capital preservation is the top priority',
      'Very low risk tolerance',
      'Prefers stable and predictable returns',
      'Avoids volatility and market fluctuations',
    ],
    moderate_conservative: [
      'High emphasis on safety with some growth',
      'Low to moderate risk tolerance',
      'Willing to accept small fluctuations for slightly higher returns',
      'Prefers income-generating investments',
    ],
    balanced: [
      'Balance between risk and return',
      'Moderate risk tolerance',
      'Can handle market volatility in the medium term',
      'Seeks diversified portfolio across asset classes',
    ],
    growth: [
      'Higher growth is the priority',
      'Moderate to high risk tolerance',
      'Comfortable with significant market fluctuations',
      'Long-term investment horizon',
    ],
    aggressive: [
      'Maximum growth potential',
      'High risk tolerance',
      'Can tolerate large portfolio swings',
      'Very long-term perspective (10+ years)',
      'Willing to invest in volatile assets',
    ],
  };
  
  return characteristics[category];
}

/**
 * Get recommended products for each risk profile category
 */
export function getRecommendedProducts(category: RiskProfileCategory): string[] {
  const products: Record<RiskProfileCategory, string[]> = {
    conservative: [
      'High-yield savings accounts',
      'Treasury bonds',
      'Fixed income funds',
      'Money market funds',
      'Investment-grade corporate bonds',
    ],
    moderate_conservative: [
      'Conservative allocation funds (20% stocks, 80% bonds)',
      'Dividend-focused ETFs',
      'Short-term bond funds',
      'Municipal bonds',
      'Real estate investment trusts (REITs)',
    ],
    balanced: [
      'Balanced funds (50% stocks, 50% bonds)',
      'Target-date funds',
      'Index funds (S&P 500)',
      'Diversified ETF portfolio',
      'Blue-chip dividend stocks',
    ],
    growth: [
      'Growth-oriented funds (70% stocks, 30% bonds)',
      'Large-cap growth ETFs',
      'Sector-specific funds',
      'International equity funds',
      'Individual growth stocks',
    ],
    aggressive: [
      'Equity funds (90%+ stocks)',
      'Small-cap growth stocks',
      'Emerging market funds',
      'Cryptocurrency (small allocation)',
      'Venture capital / Private equity',
      'Options and derivatives (if experienced)',
    ],
  };
  
  return products[category];
}

/**
 * Get asset allocation for each risk profile category
 */
export function getAssetAllocation(category: RiskProfileCategory): RiskProfileResult['assetAllocation'] {
  const allocations: Record<RiskProfileCategory, RiskProfileResult['assetAllocation']> = {
    conservative: {
      stocks: 10,
      bonds: 70,
      alternatives: 5,
      cash: 15,
    },
    moderate_conservative: {
      stocks: 30,
      bonds: 55,
      alternatives: 10,
      cash: 5,
    },
    balanced: {
      stocks: 50,
      bonds: 40,
      alternatives: 10,
      cash: 0,
    },
    growth: {
      stocks: 70,
      bonds: 20,
      alternatives: 10,
      cash: 0,
    },
    aggressive: {
      stocks: 85,
      bonds: 5,
      alternatives: 10,
      cash: 0,
    },
  };
  
  return allocations[category];
}

/**
 * Calculate complete risk profile from answers
 */
export function calculateRiskProfile(answers: AllRiskAssessmentAnswers): RiskProfileResult {
  // Calculate individual scores
  const capacityScore = calculateCapacityScore(answers);
  const willingnessScore = calculateWillingnessScore(answers);
  const biasScore = calculateBiasScore(answers);
  
  // Calculate final score
  const finalScore = calculateFinalScore(
    capacityScore.normalizedScore,
    willingnessScore.normalizedScore,
    biasScore.normalizedScore
  );
  
  // Determine category
  const category = determineCategory(finalScore);
  
  // Build result
  return {
    capacityScore,
    willingnessScore,
    biasScore,
    finalScore,
    category,
    characteristics: getCategoryCharacteristics(category),
    recommendedProducts: getRecommendedProducts(category),
    assetAllocation: getAssetAllocation(category),
    answers,
    completedAt: new Date().toISOString(),
    version: '2.0',
  };
}

/**
 * Get category display info
 */
export function getCategoryDisplayInfo(category: RiskProfileCategory): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  scoreRange: string;
} {
  const info: Record<RiskProfileCategory, ReturnType<typeof getCategoryDisplayInfo>> = {
    conservative: {
      label: 'Conservative',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      scoreRange: '1.0 - 2.0',
    },
    moderate_conservative: {
      label: 'Moderate Conservative',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      scoreRange: '2.1 - 2.8',
    },
    balanced: {
      label: 'Balanced',
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30',
      scoreRange: '2.9 - 3.5',
    },
    growth: {
      label: 'Growth-Oriented',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      scoreRange: '3.6 - 4.3',
    },
    aggressive: {
      label: 'Aggressive',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      scoreRange: '4.4 - 5.0',
    },
  };
  
  return info[category];
}
