/**
 * ============================================================
 * Global Career AI
 * ATS State Adapter V1.1
 * ============================================================
 *
 * Transforms ATS engine output into ATS domain state.
 *
 * Responsibilities:
 * - Aggregate ATS results
 * - Normalize intelligence state
 * - Preserve domain boundaries
 *
 * No dashboard logic.
 * No persistence.
 * No engine execution.
 * ============================================================
 */

import type {
  ATSResult,
} from "@/lib/engine/contracts/engineContracts";

import type {
  ATSState,
} from "@/lib/engine/contracts/intelligence/atsState";


export function buildATSState(
  results: ATSResult[]
): ATSState {

  if (results.length === 0) {
    return {
      score: 0,

      keywordScore: 0,

      semanticScore: 0,

      hiringScore: 0,

      matchedSkills: [],

      missingSkills: [],

      recommendation: "No ATS data available",

      confidence: 0,
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


  return {
    score: average(
      results.map(
        (item) => item.atsScore
      )
    ),

    keywordScore: average(
      results.map(
        (item) => item.keywordScore
      )
    ),

    semanticScore: average(
      results.map(
        (item) => item.semanticScore
      )
    ),

    hiringScore: average(
      results.map(
        (item) => item.hiringScore
      )
    ),

    matchedSkills: [
      ...new Set(
        results.flatMap(
          (item) => item.matchedSkills
        )
      ),
    ],

    missingSkills: [
      ...new Set(
        results.flatMap(
          (item) => item.missingSkills
        )
      ),
    ],

    recommendation:
      results[0].recommendation,

    confidence: average(
      results.map(
        (item) => item.learningSignal * 100
      )
    ) / 100,
  };
}