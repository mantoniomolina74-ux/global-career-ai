/**
 * ============================================================
 * Adaptive Weights Store V1 (CLOSED LOOP CORE)
 * ============================================================
 */

type WeightMap = {
  atsMultiplier: number;
  rankingMultiplier: number;
  decisionSensitivity: number;
};

const defaultWeights: WeightMap = {
  atsMultiplier: 1,
  rankingMultiplier: 1,
  decisionSensitivity: 1,
};

let currentWeights: WeightMap = { ...defaultWeights };

export function getAdaptiveWeights(): WeightMap {
  return currentWeights;
}

/**
 * ============================================================
 * UPDATE ENGINE (CORE LEARNING RULE)
 * ============================================================
 */

export function updateWeightsFromFeedback(signal: {
  outcome: "HIRED" | "REJECTED" | "NO_RESPONSE";
  systemDecision: "SHORTLIST" | "REJECT" | "INTERVIEW";
}) {
  let adjustment = 1;

  // POSITIVE OUTCOME
  if (
    signal.outcome === "HIRED" &&
    signal.systemDecision === "INTERVIEW"
  ) {
    adjustment = 1.05;
  }

  // NEGATIVE OUTCOME
  if (
    signal.outcome === "REJECTED" &&
    signal.systemDecision !== "REJECT"
  ) {
    adjustment = 0.95;
  }

  // APPLY STABLE UPDATE (bounded learning rate)
  currentWeights = {
    atsMultiplier: clamp(currentWeights.atsMultiplier * adjustment),
    rankingMultiplier: clamp(currentWeights.rankingMultiplier * adjustment),
    decisionSensitivity: clamp(currentWeights.decisionSensitivity),
  };

  return currentWeights;
}

/**
 * ============================================================
 * SAFETY CLAMP
 * ============================================================
 */

function clamp(value: number) {
  return Math.max(0.7, Math.min(1.3, value));
}