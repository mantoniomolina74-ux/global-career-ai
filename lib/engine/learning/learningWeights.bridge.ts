/**
 * ============================================================
 * GLOBAL LEARNING WEIGHTS STATE
 * ============================================================
 */

export type LearningWeights = {
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
 * PUBLIC ACCESSOR
 * ============================================================
 */

export function getLearningWeights(): LearningWeights {
  return { ...cachedWeights };
}

/**
 * ============================================================
 * STATE UPDATE
 * ============================================================
 */

export function updateLearningWeights(
  weights: LearningWeights
): void {
  cachedWeights = {
    atsMultiplier: weights.atsMultiplier,
    rankingMultiplier: weights.rankingMultiplier,
    decisionSensitivity: weights.decisionSensitivity,
  };
}
