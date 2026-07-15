import { CareerContext } from "@/lib/engine/context/contextEngine";
import { LearningSignals } from "@/lib/engine/learning/signals/learningSignalEngine.v1";
import type { SemanticSignal } from "@/lib/engine/learning/semantic/semanticSignal";
import { getCalibrationWeights } from "@/lib/engine/learning/semantic/semanticCalibration";

/**
 * ============================================================
 * Global Career AI
 * Decision Engine V3 (Signal-Aware Intelligence Layer)
 * ============================================================
 */

export type DecisionPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface DecisionResult {
  overallScore: number;
  priority: DecisionPriority;
  action: string;
  reason: string;
  confidence: number;
}

export interface DecisionInputV3 {
  context: CareerContext;
  recommendationScore: number;
  signals: LearningSignals;

  // Semantic Memory Layer (optional)
  semantic?: SemanticSignal;
}

/**
 * ============================================================
 * ENGINE
 * ============================================================
 */

export function runDecisionEngineV3(
  input: DecisionInputV3
): DecisionResult {
  const { context, recommendationScore, signals, semantic } = input;

  const weights = getCalibrationWeights();

  const ats = context.signals.atsScore || 0;
  const ranking = context.signals.rankingScore || 0;
  const cv = context.profile.cvStrength || 50;

  /**
   * ============================================================
   * SIGNAL WEIGHTING
   * ============================================================
   */

  const signalBoost =
    signals.performance.trend === "UP"
      ? 1.1
      : signals.performance.trend === "DOWN"
      ? 0.9
      : 1.0;

  const skillFactor =
    Object.values(signals.skills.successCorrelations || {}).reduce(
      (a, b) => a + b,
      0
    ) /
    Math.max(
      1,
      Object.keys(signals.skills.successCorrelations).length
    );

  /**
   * ============================================================
   * SEMANTIC MEMORY LAYER
   * ============================================================
   */

  const semanticBoost = semantic
    ? semantic.confidence * semantic.influence
    : 0;

  const semanticAdjustment = semantic
    ? Math.min(1.15, 1 + semanticBoost * weights.semantic)
    : 1;

  /**
   * ============================================================
   * CORE SCORE (CALIBRATED)
   * ============================================================
   */

  const baseScore =
    ats * weights.ats +
    ranking * weights.ranking +
    recommendationScore * weights.recommendation +
    cv * weights.cv +
    signals.decisions.successScoreAvg * weights.learning;

  const overallScore = Math.round(
    baseScore * signalBoost * semanticAdjustment
  );

  /**
   * ============================================================
   * PRIORITY LOGIC
   * ============================================================
   */

  let priority: DecisionPriority = "LOW";
  let action = "Maintain current strategy.";
  let reason = "System stable with no critical signals.";

  if (overallScore < 50 || signals.performance.trend === "DOWN") {
    priority = "CRITICAL";
    action = "Rebuild profile and correct weak signals.";
    reason = "Negative performance trend or low market fit detected.";
  } else if (overallScore < 70) {
    priority = "HIGH";
    action = "Improve skill alignment and targeting strategy.";
    reason = "Moderate performance with improvement opportunities.";
  } else if (overallScore < 85) {
    priority = "MEDIUM";
    action = "Continue optimized application strategy.";
    reason = "Competitive profile with stable signals.";
  } else {
    priority = "LOW";
    action = "Scale applications and maximize exposure.";
    reason = "Strong performance and positive trend detected.";
  }

  /**
   * ============================================================
   * CONFIDENCE MODEL
   * ============================================================
   */

  const confidence = Number(
    Math.min(
      0.98,
      (overallScore +
        skillFactor * 100 +
        (semantic?.confidence ?? 0) * 20) / 220
    ).toFixed(2)
  );

  return {
    overallScore,
    priority,
    action,
    reason,
    confidence,
  };
}