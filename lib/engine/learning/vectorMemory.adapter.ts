import { findSimilarProfiles } from "./vectorMemory.engine";

/**
 * ============================================================
 * VECTOR MEMORY ADAPTER (ATS INTEGRATION LAYER)
 * ============================================================
 *
 * Purpose:
 * Inject semantic learning influence into ATS scoring
 * without breaking deterministic logic.
 * ============================================================
 */

export function applyVectorMemoryBoost(input: {
  candidateSkills: string[];
  baseScore: number;
}) {
  const similar = findSimilarProfiles(input.candidateSkills);

  if (!similar.length) {
    return {
      boostedScore: input.baseScore,
      memoryInfluence: 0,
    };
  }

  /**
   * ============================================================
   * MEMORY SIGNAL EXTRACTION
   * ============================================================
   */

  const topMatch = similar[0];

  const memoryInfluence = topMatch.similarity * 0.15; // controlled impact

  /**
   * ============================================================
   * SCORE ADJUSTMENT (SAFE BOUNDARIES)
   * ============================================================
   */

  const boostedScore = Math.min(
    100,
    Math.round(input.baseScore * (1 + memoryInfluence))
  );

  return {
    boostedScore,
    memoryInfluence: Number(memoryInfluence.toFixed(3)),
    matchedPatternScore: topMatch.successScore,
  };
}