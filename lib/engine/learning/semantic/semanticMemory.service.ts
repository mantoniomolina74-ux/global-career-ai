import {
  findSimilarProfiles,
  buildVectorMemory,
} from "../vectorMemory.engine";

import type { SemanticSignal } from "./semanticSignal";

/**
 * ============================================================
 * SEMANTIC MEMORY SERVICE (SIGNAL LAYER V1)
 * ============================================================
 */

export function initialize(): void {
  buildVectorMemory();
}

export function searchSimilar(input: {
  candidateSkills: string[];
}): SemanticSignal {
  const matches = findSimilarProfiles(input.candidateSkills);

  if (!matches.length) {
    return {
      matchedProfiles: 0,
      averageHistoricalScore: 0,
      confidence: 0,
      influence: 0,
      inferredPatterns: [],
    };
  }

  const avgScore =
    matches.reduce((acc, m) => acc + (m.successScore || 0), 0) /
    matches.length;

  const confidence = Math.min(1, matches.length / 10);

  const influence = Math.min(0.2, confidence * 0.2);

  return {
    matchedProfiles: matches.length,
    averageHistoricalScore: avgScore,
    confidence,
    influence,
    inferredPatterns: [],
  };
}