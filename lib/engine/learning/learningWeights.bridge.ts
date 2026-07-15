import { getLearningEvents } from "./learningMemory.store";

/**
 * ============================================================
 * GLOBAL LEARNING WEIGHTS STATE
 * ============================================================
 */

type LearningWeights = {
  atsMultiplier: number;
  rankingMultiplier: number;
  decisionSensitivity: number;
};

let cachedWeights: LearningWeights = {
  atsMultiplier: 1,
  rankingMultiplier: 1,
  decisionSensitivity: 1,
};

/**
 * ============================================================
 * CORE WEIGHT COMPUTATION
 * ============================================================
 */

export function computeLearningWeights(): LearningWeights {
  const events = getLearningEvents();

  const recent = events.slice(-100); // stability window

  if (recent.length === 0) return cachedWeights;

  /**
   * ============================================================
   * SIGNAL ANALYSIS
   * ============================================================
   */

  let successSignals = 0;
  let failureSignals = 0;

  
for (const e of recent) {
  if (e.type === "DECISION_CREATED") {
    const score = e.payload?.avgScore || 0;

    if (score >= 80) successSignals++;
    if (score < 60) failureSignals++;
  }

  if (e.type === "ATS_EVALUATED") {
    const score = e.payload?.atsScore || 0;

    if (score >= 75) successSignals++;
    if (score < 50) failureSignals++;
  }
}
  const total = successSignals + failureSignals || 1;

  const successRatio = successSignals / total;
  const failureRatio = failureSignals / total;

  /**
   * ============================================================
   * STABLE WEIGHT ADJUSTMENT (NO DRIFT)
   * ============================================================
   */

  const driftFactor = 0.05; // VERY IMPORTANT (stability control)

  const atsMultiplier =
    1 + (successRatio - failureRatio) * driftFactor;

  const rankingMultiplier =
    1 + (successRatio * 0.5 - failureRatio * 0.5) * driftFactor;

  const decisionSensitivity =
    1 + (successRatio - 0.5) * driftFactor;

  /**
   * ============================================================
   * CLAMPING (CRITICAL SAFETY LAYER)
   * ============================================================
   */

  cachedWeights = {
    atsMultiplier: clamp(atsMultiplier, 0.85, 1.15),
    rankingMultiplier: clamp(rankingMultiplier, 0.85, 1.15),
    decisionSensitivity: clamp(decisionSensitivity, 0.85, 1.15),
  };

  return cachedWeights;
}

/**
 * ============================================================
 * PUBLIC ACCESSOR
 * ============================================================
 */

export function getLearningWeights(): LearningWeights {
  return cachedWeights;
}

/**
 * ============================================================
 * INTERNAL UTILITY
 * ============================================================
 */

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}