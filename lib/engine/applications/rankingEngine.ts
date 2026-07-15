import {
  RankingResult,
  RankingResultItem,
  ScoringResult,
} from "../contracts/engineContracts";

import { getLearningWeights } from "@/lib/engine/learning/learningWeights.bridge";

/**
 * ============================================================
 * Ranking Engine V3 (Stable + Learning-Aware)
 * ============================================================
 */

export function runRankingEngine(
  scoring: ScoringResult
): RankingResult {
  if (!Array.isArray(scoring.items)) {
    throw new Error("Invalid scoring input");
  }

  const weights = getLearningWeights();

  /**
   * ============================================================
   * STEP 1 — NORMALIZE SCORES
   * ============================================================
   */
  const normalized = scoring.items.map((item) => {
    const base = Number(item.score) || 0;

    // bounded learning influence (safe adjustment)
    const learningFactor =
      0.9 + (weights.rankingMultiplier - 1) * 0.3;

    const adjusted = base * learningFactor;

    return {
      ...item,
      normalizedScore: Math.min(100, adjusted),
    };
  });

  /**
   * ============================================================
   * STEP 2 — STABLE SORT (ANTI FLUCTUATION)
   * ============================================================
   */
  const sorted = [...normalized].sort((a, b) => {
    const diff = b.normalizedScore - a.normalizedScore;

    // stability threshold → avoids micro rank flips
    if (Math.abs(diff) < 1.5) {
      return 0;
    }

    return diff;
  });

  /**
   * ============================================================
   * STEP 3 — RANK ASSIGNMENT
   * ============================================================
   */
  const items: RankingResultItem[] = sorted.map((item, index) =>
    Object.freeze({
      applicationId: item.applicationId,
      finalScore: Math.round(item.normalizedScore),
      rank: index + 1,
    })
  );

  /**
   * ============================================================
   * OUTPUT (CONTRACT-COMPLIANT)
   * ============================================================
   */
  return {
    items,
    metadata: {
      strategy: "hybrid",
      processedAt: new Date().toISOString(),
    },
  };
}