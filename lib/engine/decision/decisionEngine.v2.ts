/**
 * ============================================================
 * Global Career AI
 * Decision Engine V2 (Context-Aware Intelligence Layer)
 * ============================================================
 */

import { CareerContext } from "@/lib/engine/context/contextEngine";

/* ============================================================
 * TYPES
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

/* ============================================================
 * ENGINE
 * ============================================================
 */

export function runDecisionEngineV2(
  context: CareerContext,
  recommendationScore: number
): DecisionResult {

  const ats = context.signals.atsScore || 0;
  const ranking = context.signals.rankingScore || 0;
  const recommendation = recommendationScore || 0;
  const cv = context.profile.cvStrength || 50;

  /**
   * ============================================================
   * CONTEXTUAL WEIGHTING (V2 CORE IMPROVEMENT)
   * ============================================================
   */

  const overallScore = Math.round(
    ats * 0.35 +
    ranking * 0.30 +
    recommendation * 0.25 +
    cv * 0.10
  );

  /**
   * ============================================================
   * DECISION LOGIC (CONTEXT-DRIVEN)
   * ============================================================
   */

  let priority: DecisionPriority = "LOW";
  let action = "Maintain current strategy.";
  let reason = "System signals are stable.";

  if (overallScore < 50) {
    priority = "CRITICAL";
    action = "Rebuild CV, improve ATS alignment, and re-skill.";
    reason = "Low market competitiveness detected across signals.";
  } else if (overallScore < 70) {
    priority = "HIGH";
    action = "Focus on skill gaps and optimize job targeting.";
    reason = "Moderate alignment with market requirements.";
  } else if (overallScore < 85) {
    priority = "MEDIUM";
    action = "Continue applying with targeted optimization.";
    reason = "Competitive profile with improvement potential.";
  } else {
    priority = "LOW";
    action = "Scale applications and maximize exposure.";
    reason = "High readiness and strong market fit.";
  }

  /**
   * ============================================================
   * CONFIDENCE MODEL (V2 IMPROVED)
   * ============================================================
   */

  const confidence = Number(
    Math.min(0.98, (overallScore + cv) / 200).toFixed(2)
  );

  return {
    overallScore,
    priority,
    action,
    reason,
    confidence,
  };
}