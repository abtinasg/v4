// ==================== RISK ASSESSMENT TYPES ====================

// Question weight for scoring
export type QuestionWeight = 1 | 2 | 3;

// Risk capacity question (Part 1: 10 questions)
export interface RiskCapacityQuestion {
  id: number;
  key: string;
  title: string;
  question: string;
  weight: QuestionWeight;
  icon: string;
  whyImportant: string;
  options: {
    value: number; // 1-5
    label: string;
    description?: string;
  }[];
}

// Risk willingness question (Part 2: 10 questions)
export interface RiskWillingnessQuestion {
  id: number;
  key: string;
  title: string;
  question: string;
  icon: string;
  options: {
    value: number; // 1-5
    label: string;
  }[];
}

// Behavioral bias question (Part 3: 5 questions)
export interface BehavioralBiasQuestion {
  id: number;
  key: string;
  title: string;
  biasType: 'overconfidence' | 'loss_aversion' | 'herding' | 'disposition_effect' | 'hindsight_bias';
  question: string;
  icon: string;
  note: string;
  options: {
    value: number; // 1-5 (reversed scoring)
    label: string;
  }[];
}

// Answer types
export interface RiskCapacityAnswers {
  q1_emergency_fund: number;
  q2_income_stability: number;
  q3_investment_to_income_ratio: number;
  q4_investment_horizon: number;
  q5_liquidity_needs: number;
  q6_debt_ratio: number;
  q7_age: number;
  q8_dependents: number;
  q9_insurance_coverage: number;
  q10_investment_experience: number;
}

export interface RiskWillingnessAnswers {
  q11_reaction_to_20_drop: number;
  q12_max_tolerable_loss: number;
  q13_return_preference: number;
  q14_reaction_to_30_gain: number;
  q15_diversification_preference: number;
  q16_market_volatility_reaction: number;
  q17_uncertainty_comfort: number;
  q18_investment_goal_priority: number;
  q19_past_loss_experience: number;
  q20_financial_knowledge_self_assessment: number;
}

export interface BehavioralBiasAnswers {
  q21_decision_confidence: number;
  q22_loss_vs_gain_focus: number;
  q23_investment_idea_sources: number;
  q24_selling_decision: number;
  q25_post_decision_review: number;
}

export interface AllRiskAssessmentAnswers extends RiskCapacityAnswers, RiskWillingnessAnswers, BehavioralBiasAnswers {}

// Score results
export interface RiskCapacityScore {
  rawScore: number;
  weightedScore: number;
  normalizedScore: number; // 1.0 - 5.0
  interpretation: 'very_low' | 'low_to_moderate' | 'moderate_to_good' | 'high';
}

export interface RiskWillingnessScore {
  rawScore: number;
  normalizedScore: number; // 1.0 - 5.0
  interpretation: 'very_low' | 'low_to_moderate' | 'moderate_to_high' | 'high';
}

export interface BehavioralBiasScore {
  rawScore: number;
  normalizedScore: number; // 1.0 - 5.0 (lower is better)
  interpretation: 'low' | 'moderate' | 'high';
  biasDetails: {
    overconfidence: number;
    lossAversion: number;
    herding: number;
    dispositionEffect: number;
    hindsightBias: number;
  };
}

// Risk profile categories
export type RiskProfileCategory = 
  | 'conservative'
  | 'moderate_conservative'
  | 'balanced'
  | 'growth'
  | 'aggressive';

// Final risk profile result
export interface RiskProfileResult {
  // Scores
  capacityScore: RiskCapacityScore;
  willingnessScore: RiskWillingnessScore;
  biasScore: BehavioralBiasScore;
  
  // Final composite score
  finalScore: number; // 1.0 - 5.0
  category: RiskProfileCategory;
  
  // Recommendations
  characteristics: string[];
  recommendedProducts: string[];
  assetAllocation: {
    stocks: number;
    bonds: number;
    alternatives?: number;
    cash?: number;
  };
  
  // Raw answers for storage
  answers: AllRiskAssessmentAnswers;
  
  // Metadata
  completedAt: string;
  version: string;
}

// Database storage type
export interface StoredRiskAssessment {
  id: string;
  userId: string;
  
  // Score components
  capacityScore: number;
  willingnessScore: number;
  biasScore: number;
  finalScore: number;
  
  // Category
  category: RiskProfileCategory;
  
  // Full result (JSONB)
  fullResult: RiskProfileResult;
  
  // Answers (JSONB)
  answers: AllRiskAssessmentAnswers;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// API request/response types
export interface SubmitRiskAssessmentRequest {
  answers: AllRiskAssessmentAnswers;
}

export interface SubmitRiskAssessmentResponse {
  success: boolean;
  result: RiskProfileResult;
}

export interface GetRiskAssessmentResponse {
  hasAssessment: boolean;
  result: RiskProfileResult | null;
}
