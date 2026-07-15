 /**
 * ============================================================
 * Global Career AI
 * Decision Engine V1 (Strategic Layer)
 * ============================================================
 *
 * Purpose:
 * --------
 * Aggregates intelligence from ATS, Ranking and Recommendation
 * engines to produce a unified strategic decision.
 *
 * This is the top-level reasoning layer (pre-Context Engine integration).
 * ============================================================
 */

/* ============================================================
 * TYPES
 * ============================================================
 */

import { RecommendationResult } from "../recommendations/recommendationEngine";

export type DecisionPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface DecisionInput {
  atsScore: number;
  rankingScore: number;
  recommendations: RecommendationResult;
}

export interface DecisionResult {
  overallScore: number;
  priority: DecisionPriority;
  action: string;
  reason: string;
  confidence: number;
}

/* ============================================================
 * ENGINE
 * ============================================================
 */

export function runDecisionEngine(
  input: DecisionInput
): DecisionResult {
  const ats = input.atsScore || 0;
  const ranking = input.rankingScore || 0;
  const rec = input.recommendations?.overallScore || 0;

  // Weighted synthesis (stable baseline model)
  const overallScore = Math.round(
    ats * 0.4 +
      ranking * 0.35 +
      rec * 0.25
  );

  let priority: DecisionPriority = "LOW";
  let action = "Maintain current strategy.";
  let reason = "System indicators are stable.";

  if (overallScore < 50) {
    priority = "CRITICAL";
    action = "Rebuild profile and focus on ATS optimization.";
    reason = "Low competitiveness across key signals.";
  } else if (overallScore < 70) {
    priority = "HIGH";
    action = "Improve skills and optimize targeting strategy.";
    reason = "Moderate gaps affecting interview probability.";
  } else if (overallScore < 85) {
    priority = "MEDIUM";
    action = "Continue applying with targeted improvements.";
    reason = "Competitive profile with optimization opportunities.";
  } else {
    priority = "LOW";
    action = "Scale applications aggressively.";
    reason = "High market readiness detected.";
  }

  const confidence = Number(
    Math.min(0.95, rec / 100 + 0.2).toFixed(2)
  );

  return {
    overallScore,
    priority,
    action,
    reason,
    confidence,
  };
}