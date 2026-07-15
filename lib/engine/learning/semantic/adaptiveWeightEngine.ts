import { getLearningEvents } from "../learningMemory.store";
import {
  getCalibrationWeights,
  updateCalibrationWeights,
} from "./semanticCalibration";

/**
 * ============================================================
 * ADAPTIVE WEIGHT ENGINE (8C.9)
 * ============================================================
 *
 * Learns from historical decision outcomes and adjusts
 * global scoring weights automatically.
 * ============================================================
 */

type OutcomeType = "SUCCESS" | "FAILURE";

type LearningEventInput = {
  type: string;
  payload?: {
    atsScore?: number;
    avgScore?: number;
  };
};

function evaluateOutcome(event: LearningEventInput): OutcomeType {
  // Heurística inicial (puede evolucionar a ML después)
  const score = event.payload?.atsScore ?? event.payload?.avgScore ?? 0;

  return score >= 75 ? "SUCCESS" : "FAILURE";
}

/**
 * ============================================================
 * MAIN ADAPTATION LOOP
 * ============================================================
 */

export function runAdaptiveWeightLearning() {
  const events = getLearningEvents();
  const weights = getCalibrationWeights();

  let successCount = 0;
  let failureCount = 0;

  let atsBias = 0;
  let rankingBias = 0;
  let learningBias = 0;

  for (const event of events) {
    const outcome = evaluateOutcome(event);

    const influence = outcome === "SUCCESS" ? 1 : -1;

    if (outcome === "SUCCESS") successCount++;
    else failureCount++;

    switch (event.type) {
      case "ATS_EVALUATED":
        atsBias += influence;
        break;

      case "RANKING_GENERATED":
        rankingBias += influence;
        break;

      case "DECISION_CREATED":
        learningBias += influence;
        break;
    }
  }

  const total = Math.max(1, successCount + failureCount);

  const successRate = successCount / total;

  /**
   * ============================================================
   * WEIGHT ADJUSTMENT LOGIC
   * ============================================================
   */

  const adjusted = {
    ats: clamp(weights.ats + atsBias * 0.01, 0.1, 0.6),
    ranking: clamp(weights.ranking + rankingBias * 0.01, 0.1, 0.6),
    recommendation: weights.recommendation,
    cv: weights.cv,
    learning: clamp(weights.learning + learningBias * 0.005, 0.05, 0.3),
    semantic: weights.semantic,
  };

  /**
   * Normalize to keep system stable
   */
  const sum =
    adjusted.ats +
    adjusted.ranking +
    adjusted.recommendation +
    adjusted.cv +
    adjusted.learning;

  const normalized = {
    ...adjusted,
    ats: adjusted.ats / sum,
    ranking: adjusted.ranking / sum,
    recommendation: adjusted.recommendation / sum,
    cv: adjusted.cv / sum,
    learning: adjusted.learning / sum,
  };

  updateCalibrationWeights(normalized);

  return {
    successRate,
    updatedWeights: normalized,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}