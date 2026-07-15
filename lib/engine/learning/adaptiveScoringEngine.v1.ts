import { getLearningSignals } from "./learningEngine.v1";

/**
 * ============================================================
 * Global Career AI
 * Adaptive Scoring Engine V1
 * ============================================================
 */

type SkillWeights = Record<string, number>;

const DEFAULT_WEIGHTS: SkillWeights = {
  javascript: 1.0,
  typescript: 1.1,
  react: 1.2,
  node: 1.1,
  python: 1.2,
  aws: 1.3,
};

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
}

/**
 * ============================================================
 * MAIN OPTIMIZER
 * ============================================================
 */

export function getAdaptiveWeights(): SkillWeights {
  const signals = getLearningSignals();

  const weights: SkillWeights = {
    ...DEFAULT_WEIGHTS,
  };

  for (const signal of signals) {
    /**
     * =========================================
     * SKILL GAP → INCREASE WEIGHT
     * =========================================
     */
    if (signal.signalType === "SKILL_GAP") {
      const missingSkills = signal.metadata?.missingSkills;

      if (isStringArray(missingSkills)) {
        for (const skill of missingSkills) {
          weights[skill] = (weights[skill] || 1.0) + 0.05;
        }
      }
    }

    /**
     * =========================================
     * SUCCESS PATTERN → REINFORCE
     * =========================================
     */
    if (signal.signalType === "SUCCESS_PATTERN") {
      const matchedSkills = signal.metadata?.matchedSkills;

      if (isStringArray(matchedSkills)) {
        for (const skill of matchedSkills) {
          weights[skill] = (weights[skill] || 1.0) + 0.1;
        }
      }
    }

    /**
     * =========================================
     * IMPROVE SCORING → GLOBAL TUNING
     * =========================================
     */
    if (signal.signalType === "IMPROVE_SCORING") {
      for (const key of Object.keys(weights)) {
        weights[key] *= 1.01;
      }
    }
  }

  return weights;
}