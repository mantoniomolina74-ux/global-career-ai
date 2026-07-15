import type { SemanticSignal } from "./semanticSignal";

/**
 * ============================================================
 * SEMANTIC LEARNING LOOP (V1 STABLE)
 * ============================================================
 */

type DecisionOutcome = {
  overallScore: number;
  priority: string;
  confidence: number;
};

let semanticWeight = 1.0;

/**
 * ============================================================
 * UPDATE SEMANTIC WEIGHT
 * ============================================================
 */
export function updateSemanticWeight(
  signal: SemanticSignal,
  outcome: DecisionOutcome
): number {
  const success =
    outcome.overallScore > 75 && outcome.confidence > 0.7;

  const strongSignal =
    signal.confidence > 0.6 && signal.matchedProfiles > 2;

  if (success && strongSignal) {
    semanticWeight = Math.min(1.25, semanticWeight + 0.02);
  }

  if (!success && strongSignal) {
    semanticWeight = Math.max(0.7, semanticWeight - 0.03);
  }

  return semanticWeight;
}

/**
 * ============================================================
 * GET CURRENT WEIGHT
 * ============================================================
 */
export function getSemanticWeight(): number {
  return semanticWeight;
}