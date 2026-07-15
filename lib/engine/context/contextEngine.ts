/**
 * ============================================================
 * Global Career AI
 * Context Engine V1.1 (Unified State Builder - Hardened)
 * ============================================================
 */

export interface CareerContext {
  userId: string;

  profile: {
    skills: string[];
    targetSkills: string[];
    cvStrength: number;
  };

  job: {
    description: string;
  };

  signals: {
    atsScore: number;
    rankingScore: number;
    recommendationScore: number;
  };

  system: {
    timestamp: string;
    version: "context-v1.1";
    fingerprint: string;
  };
}

/**
 * ============================================================
 * CONTEXT BUILDER
 * ============================================================
 */

export function buildCareerContext(input: {
  userId: string;

  atsScore: number;
  rankingScore: number;
  recommendationScore: number;

  candidateSkills?: string[];
  requiredSkills?: string[];
  jobDescription?: string;

  cvStrengthScore?: number;
}): CareerContext {

  const safeNumber = (v: unknown, fallback = 0) =>
    typeof v === "number" && !isNaN(v) ? v : fallback;

  const ats = safeNumber(input.atsScore);
  const ranking = safeNumber(input.rankingScore);
  const rec = safeNumber(input.recommendationScore);

  const skills = input.candidateSkills || [];
  const targetSkills = input.requiredSkills || [];

  /**
   * ============================================================
   * CONTEXT FINGERPRINT (FOR LEARNING SYSTEM)
   * ============================================================
   */

  const fingerprint = Buffer.from(
    `${input.userId}-${ats}-${ranking}-${rec}-${skills.length}-${targetSkills.length}`
  ).toString("base64");

  return {
    userId: input.userId,

    profile: {
      skills,
      targetSkills,
      cvStrength: safeNumber(input.cvStrengthScore, 50),
    },

    job: {
      description: input.jobDescription || "",
    },

    signals: {
      atsScore: ats,
      rankingScore: ranking,
      recommendationScore: rec,
    },

    system: {
      timestamp: new Date().toISOString(),
      version: "context-v1.1",
      fingerprint,
    },
  };
}