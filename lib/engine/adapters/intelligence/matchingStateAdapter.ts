/**
 * ============================================================
 * Global Career AI
 * Matching State Adapter V1.1
 * ============================================================
 *
 * Transforms Matching Engine output into Matching domain state.
 *
 * Responsibilities:
 * - Aggregate matching results
 * - Normalize intelligence state
 * - Preserve domain boundaries
 *
 * No dashboard logic.
 * No persistence.
 * No engine execution.
 * ============================================================
 */

import type {
  MatchingResultItem,
} from "@/lib/engine/contracts/matchingContracts";

import type {
  MatchingState,
} from "@/lib/engine/contracts/intelligence/matchingState";


export function buildMatchingState(
  results: MatchingResultItem[]
): MatchingState {

  if (results.length === 0) {
    return {
      score: 0,

      confidence: 0,

      strengths: [],

      weaknesses: [],

      evidence: [],

      recommendations: [],
    };
  }


  const average = (
    values: number[]
  ) =>
    Math.round(
      values.reduce(
        (sum, value) => sum + value,
        0
      ) / values.length
    );


  const bestMatches =
    results.slice(0, 5);


  return {
    score: average(
      results.map(
        (item) => item.match_score
      )
    ),

    confidence:
      results.length > 0
        ? Math.min(
            results.length / 10,
            1
          )
        : 0,

    strengths: [
      ...new Set(
        bestMatches.flatMap(
          (item) =>
            item.match_explanation.matched_skills
        )
      ),
    ],

    weaknesses: [
      ...new Set(
        results.flatMap(
          (item) =>
            item.match_explanation.matched_industries
        )
      ),
    ],

    evidence: [
      ...new Set(
        results.flatMap(
          (item) =>
            item.match_reasons
        )
      ),
    ],

    recommendations: [
      ...new Set(
        results
          .map(
            (item) =>
              item.match_reasons[0]
          )
          .filter(Boolean)
      ),
    ],
  };
}