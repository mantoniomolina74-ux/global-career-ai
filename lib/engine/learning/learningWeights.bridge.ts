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
