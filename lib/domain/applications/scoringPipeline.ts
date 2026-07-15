import { calculateATS } from "@/lib/engine/applications/atsEngine";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

export interface ScoringInput {
  userId: string;
  organizationId?: string;

  applicationId?: string;

  company?: string;
  position?: string;

  jobDescription: string;
  requiredSkills?: string[];
  candidateSkills?: string[];

  cvStrengthScore?: number;
}

export interface ScoringOutput {
  userId: string;
  applicationId?: string;

  atsScore: number;
  passProbability: number;

  keywordScore: number;
  cvStrengthScore: number;

  matchedSkills: string[];
  missingSkills: string[];

  recommendation: string;

  riskLevel: "low" | "medium" | "high";

  signals: {
    isStrongMatch: boolean;
    needsUpskilling: boolean;
    priorityRank: number;
  };

  meta: {
    version: "v2";
    generatedAt: string;
  };
}

/**
 * =========================================================
 * CORE SCORING PIPELINE (V2 - ENGINE ALIGNED)
 * =========================================================
 */

export async function scoringPipelineV2(
  input: ScoringInput
): Promise<ScoringOutput> {

  const atsResult = await calculateATS(
    input.requiredSkills || [],
    input.candidateSkills || [],
    input.jobDescription || "",
    input.cvStrengthScore || 50
  );

  const ats = atsResult.data;

  /**
   * =========================================================
   * RISK ENGINE
   * =========================================================
   */

  let riskLevel: "low" | "medium" | "high" = "medium";

  if (ats.atsScore >= 75) riskLevel = "low";
  else if (ats.atsScore >= 50) riskLevel = "medium";
  else riskLevel = "high";

  /**
   * =========================================================
   * SIGNAL ENGINE
   * =========================================================
   */

  const isStrongMatch = ats.atsScore >= 75;
  const needsUpskilling = ats.missingSkills.length > 3;

  const priorityRank =
    ats.atsScore * 0.7 +
    ats.keywordScore * 0.2 +
    ats.passProbability * 0.1;

  /**
   * =========================================================
   * OUTPUT NORMALIZATION
   * =========================================================
   */

  return {
    userId: input.userId,
    applicationId: input.applicationId,

    atsScore: ats.atsScore,
    passProbability: ats.passProbability,

    keywordScore: ats.keywordScore,
    cvStrengthScore: ats.cvStrengthScore,

    matchedSkills: ats.matchedSkills,
    missingSkills: ats.missingSkills,

    recommendation: ats.recommendation,

    riskLevel,

    signals: {
      isStrongMatch,
      needsUpskilling,
      priorityRank: Math.round(priorityRank),
    },

    meta: {
      version: "v2",
      generatedAt: new Date().toISOString(),
    },
  };
}