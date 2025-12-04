import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { detailedRiskAssessments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { userQueries, detailedRiskAssessmentQueries } from '@/lib/db/queries';
import { 
  calculateRiskProfile, 
  type AllRiskAssessmentAnswers 
} from '@/lib/risk-assessment';

// GET - Check if user has risk assessment
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await userQueries.getByClerkId(clerkId);
    
    if (!user) {
      return NextResponse.json({
        hasAssessment: false,
        result: null,
      });
    }

    // Get risk assessment
    const assessment = await detailedRiskAssessmentQueries.getByUserId(user.id);

    if (!assessment) {
      return NextResponse.json({
        hasAssessment: false,
        result: null,
      });
    }

    // Return the stored result
    return NextResponse.json({
      hasAssessment: true,
      result: {
        capacityScore: {
          ...assessment.fullResult?.capacityScore,
          normalizedScore: parseFloat(assessment.capacityScore),
        },
        willingnessScore: {
          ...assessment.fullResult?.willingnessScore,
          normalizedScore: parseFloat(assessment.willingnessScore),
        },
        biasScore: {
          ...assessment.fullResult?.biasScore,
          normalizedScore: parseFloat(assessment.biasScore),
        },
        finalScore: parseFloat(assessment.finalScore),
        category: assessment.category,
        characteristics: assessment.fullResult?.characteristics || [],
        recommendedProducts: assessment.fullResult?.recommendedProducts || [],
        assetAllocation: assessment.fullResult?.assetAllocation || {
          stocks: 50,
          bonds: 50,
        },
        answers: assessment.answers,
        completedAt: assessment.createdAt.toISOString(),
        version: assessment.fullResult?.version || '2.0',
      },
    });
  } catch (error) {
    console.error('Error getting risk assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update risk assessment
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { answers } = body as { answers: AllRiskAssessmentAnswers };

    if (!answers) {
      return NextResponse.json(
        { error: 'Missing answers in request body' },
        { status: 400 }
      );
    }

    // Validate all 25 questions are answered
    const requiredKeys = [
      'q1_emergency_fund', 'q2_income_stability', 'q3_investment_to_income_ratio',
      'q4_investment_horizon', 'q5_liquidity_needs', 'q6_debt_ratio',
      'q7_age', 'q8_dependents', 'q9_insurance_coverage', 'q10_investment_experience',
      'q11_reaction_to_20_drop', 'q12_max_tolerable_loss', 'q13_return_preference',
      'q14_reaction_to_30_gain', 'q15_diversification_preference', 'q16_market_volatility_reaction',
      'q17_uncertainty_comfort', 'q18_investment_goal_priority', 'q19_past_loss_experience',
      'q20_financial_knowledge_self_assessment', 'q21_decision_confidence',
      'q22_loss_vs_gain_focus', 'q23_investment_idea_sources', 'q24_selling_decision',
      'q25_post_decision_review',
    ];

    for (const key of requiredKeys) {
      if (answers[key as keyof AllRiskAssessmentAnswers] === undefined) {
        return NextResponse.json(
          { error: `Missing answer for ${key}` },
          { status: 400 }
        );
      }
    }

    // Get or create user in database
    let user = await userQueries.getByClerkId(clerkId);
    
    if (!user) {
      // Create user if doesn't exist
      const { currentUser } = await import('@clerk/nextjs/server');
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      user = (await userQueries.create({
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
      })) as NonNullable<typeof user>;
    }

    // Calculate risk profile
    const result = calculateRiskProfile(answers);

    // Prepare data for storage
    const assessmentData = {
      capacityScore: result.capacityScore.normalizedScore.toString(),
      willingnessScore: result.willingnessScore.normalizedScore.toString(),
      biasScore: result.biasScore.normalizedScore.toString(),
      finalScore: result.finalScore.toString(),
      category: result.category,
      answers: answers,
      fullResult: {
        capacityScore: result.capacityScore,
        willingnessScore: result.willingnessScore,
        biasScore: result.biasScore,
        characteristics: result.characteristics,
        recommendedProducts: result.recommendedProducts,
        assetAllocation: result.assetAllocation,
        version: result.version,
      },
    };

    // Upsert assessment
    await detailedRiskAssessmentQueries.upsert(user.id, assessmentData);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Error saving risk assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove risk assessment
export async function DELETE() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await userQueries.getByClerkId(clerkId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await detailedRiskAssessmentQueries.delete(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting risk assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
