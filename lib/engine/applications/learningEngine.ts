import { ScoreInput } from "@/lib/validation/applicationSchemas";

/**
 * =========================================================
 * LEARNING ENGINE v2
 * - Feedback loop system for ATS optimization
 * - Adjusts scoring behavior based on recruiter decisions
 * - Prepares foundation for ML / embeddings tuning
 * =========================================================
 */

export interface LearningInput {
  jobId: string;
  applications: (ScoreInput & {
    finalScore?: number;
    decision?: "shortlist" | "reject" | "review";
  })[];

  marketFitScore?: number;
}

export interface LearningOutput {
  jobId: string;

  adjustedWeights: {
    skillMatch: number;
    cvStrength: number;
    aiSignals: number;
  };

  systemInsights: {
    biasDetected: boolean;
    avgShortlistScore: number;
    avgRejectScore: number;
    learningSignalStrength: number;
  };
}

type ScoreRecord = {
  finalScore?: number;
};

/**
 * =========================================================
 * CORE LEARNING ENGINE
 * =========================================================
 */

export async function runLearningEngine(
  input: LearningInput
): Promise<LearningOutput> {
  const { jobId, applications } = input;

  /**
   * =====================================================
   * 1. SEGMENTATION
   * =====================================================
   */

  const shortlisted = applications.filter(
    (a) => a.decision === "shortlist"
  );

  const rejected = applications.filter(
    (a) => a.decision === "reject"
  );

  /**
   * =====================================================
   * 2. SCORE ANALYSIS
   * =====================================================
   */

  const avg = (arr: ScoreRecord[]) =>
    arr.reduce((sum, a) => sum + (a.finalScore ?? 0), 0) /
    Math.max(arr.length, 1);

  const avgShortlistScore = avg(shortlisted);
  const avgRejectScore = avg(rejected);

  /**
   * =====================================================
   * 3. BIAS DETECTION (SIMPLE SIGNAL MODEL v2)
   * =====================================================
   */

  const biasDetected =
    avgShortlistScore - avgRejectScore < 10;

  /**
   * =====================================================
   * 4. LEARNING SIGNAL STRENGTH
   * =====================================================
   */

  const learningSignalStrength =
    Math.min(
      Math.abs(avgShortlistScore - avgRejectScore) / 100,
      1
    );

  /**
   * =====================================================
   * 5. ADJUSTED WEIGHTS (SELF-TUNING SYSTEM)
   * =====================================================
   */

  let skillMatch = 0.5;
  let cvStrength = 0.3;
  let aiSignals = 0.2;

  if (biasDetected) {
    // reduce reliance on weak signals, increase AI weighting
    skillMatch = 0.4;
    cvStrength = 0.2;
    aiSignals = 0.4;
  }

  if (learningSignalStrength > 0.3) {
    // strong learning signal → reinforce structure
    skillMatch += 0.05;
    cvStrength += 0.05;
    aiSignals -= 0.1;
  }

  /**
   * =====================================================
   * 6. OUTPUT
   * =====================================================
   */

  return {
    jobId,

    adjustedWeights: {
      skillMatch,
      cvStrength,
      aiSignals,
    },

    systemInsights: {
      biasDetected,
      avgShortlistScore,
      avgRejectScore,
      learningSignalStrength,
    },
  };
}