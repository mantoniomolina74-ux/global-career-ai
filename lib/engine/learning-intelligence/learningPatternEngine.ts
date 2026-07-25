/**
 * ============================================================
 * Global Career AI
 * ADR-014.2
 * Learning Pattern Engine
 * ============================================================
 */

import { LearningSignal } from "./learningIntelligenceTypes";
import {
  LearningPattern,
  LearningPatternConfidence,
  LearningPatternType,
} from "./learningPatternTypes";

/**
 * Convert numeric confidence into
 * a confidence level.
 */
function confidenceLevel(
  confidence: number
): LearningPatternConfidence {
  if (confidence >= 0.80) return "HIGH";
  if (confidence >= 0.50) return "MEDIUM";
  return "LOW";
}

/**
 * Detect learning patterns from
 * a collection of learning signals.
 *
 * Initial implementation:
 * one signal = one pattern.
 *
 * Future ADRs will aggregate
 * multiple signals into higher-order
 * behavioral patterns.
 */
export function detectLearningPatterns(
  signals: LearningSignal[]
): LearningPattern[] {
  return signals.map((signal, index) => {
    const type: LearningPatternType =
      signal.type.includes("REJECTION")
        ? "FAILURE_PATTERN"
        : signal.type.includes("INTERVIEW") ||
          signal.type.includes("OFFER")
        ? "SUCCESS_PATTERN"
        : signal.type.includes("KNOWLEDGE")
        ? "SKILL_GAP"
        : "IMPROVEMENT";

    const confidence =
      signal.strength === "HIGH"
        ? 0.90
        : signal.strength === "MEDIUM"
        ? 0.70
        : 0.40;

    return {
      id: `pattern-${index + 1}`,
      type,
      description: signal.description,
      confidence,
      confidenceLevel: confidenceLevel(confidence),
      signals: [signal],
      createdAt: new Date(),
    };
  });
}