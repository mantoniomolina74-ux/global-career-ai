import {
  findSimilarProfiles,
} from "../vectorMemory.engine";

import type { SemanticMemoryProvider } from "./semanticMemory.bridge";
import type { SemanticSignal } from "./semanticSignal";

/**
 * ============================================================
 * VECTOR MEMORY PROVIDER V1 (LEGACY ADAPTER)
 * ============================================================
 */

export const vectorMemoryProviderV1: SemanticMemoryProvider = {
  async search(input): Promise<SemanticSignal> {
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
  },
};