import { supabase } from "@/lib/supabase";
import { calculateATS } from "../applications/atsEngine";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

export interface ScoringInput {
  userId: string;

  applicationId: string;

  company: string;
  position: string;

  jobDescription: string;
  requiredSkills: string[];
  candidateSkills: string[];

  cvStrengthScore: number;
}

export interface AdaptiveWeights {
  skill: string;
  weight: number;
  successRate: number;
}

/**
 * =========================================================
 * LOAD LEARNING SIGNALS
 * =========================================================
 */

async function loadAdaptiveWeights(): Promise<Record<string, number>> {
  const { data } = await supabase
    .from("skill_learning_stats")
    .select("*");

  const weights: Record<string, number> = {};

  if (!data) return weights;

  for (const row of data) {
    const successRate =
      row.total_success > 0
        ? row.success_count / row.total_success
        : 0;

    weights[row.skill] =
      successRate > 0.7
        ? 1.25
        : successRate < 0.3
        ? 0.75
        : 1.0;
  }

  return weights;
}

/**
 * =========================================================
 * APPLY ADAPTIVE SKILL ENHANCEMENT
 * =========================================================
 */

function enhanceSkillsWithLearning(
  skills: string[],
  weights: Record<string, number>
): string[] {
  return skills
    .map((skill) => {
      const weight = weights[skill.toLowerCase()] || 1;

      return weight > 1.2 ? `${skill}*` : skill;
    })
    .map((skill) => skill.replace("*", ""));
}

/**
 * =========================================================
 * SCORING PIPELINE V3
 * =========================================================
 */

export async function scoringPipelineV3(input: ScoringInput) {

  /**
   * =====================================================
   * 1. LOAD LEARNING SIGNALS
   * =====================================================
   */

  const adaptiveWeights = await loadAdaptiveWeights();

  /**
   * =====================================================
   * 2. ENHANCE INPUT
   * =====================================================
   */

  const enhancedRequired = enhanceSkillsWithLearning(
    input.requiredSkills,
    adaptiveWeights
  );

  const enhancedCandidate = enhanceSkillsWithLearning(
    input.candidateSkills,
    adaptiveWeights
  );

  /**
   * =====================================================
   * 3. ATS ENGINE
   * =====================================================
   */

  const atsResult = await calculateATS(
  enhancedRequired,
  enhancedCandidate,
  input.jobDescription,
  input.cvStrengthScore,
  undefined,
  {
    userId: input.userId,
    applicationId: input.applicationId,
  }
);

const ats = atsResult.data;

  /**
   * =====================================================
   * 4. LEARNING BOOST
   * =====================================================
   */

  const matchedAdaptiveSkills = Object.keys(adaptiveWeights)
    .filter((skill) => ats.matchedSkills.includes(skill));

  const learningBoost =
    matchedAdaptiveSkills.length > 0
      ? matchedAdaptiveSkills.reduce(
          (acc, skill) => acc + (adaptiveWeights[skill] || 1),
          0
        ) / matchedAdaptiveSkills.length
      : 1;

  /**
   * =====================================================
   * 5. FINAL SCORE
   * =====================================================
   */

  const finalScore = Math.min(
    100,
    Math.round(ats.atsScore * learningBoost)
  );

  /**
   * =====================================================
   * OUTPUT
   * =====================================================
   */

  return {
    applicationId: input.applicationId,

    atsScore: finalScore,

    baseScore: ats.atsScore,

    passProbability: Math.round(finalScore * 0.9),

    matchedSkills: ats.matchedSkills,

    missingSkills: ats.missingSkills,

    keywordScore: ats.keywordScore,

    cvStrengthScore: ats.cvStrengthScore,

    learningBoost: Number(
      learningBoost.toFixed(2)
    ),

    recommendation: ats.recommendation,

    meta: {
      version: "scoring-v3-adaptive",
      usedLearningSignals:
        Object.keys(adaptiveWeights).length > 0,
    },
  };
}