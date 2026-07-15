import { LearningState } from "./learningAggregator.v1";

/**
 * ============================================================
 * Adaptive Weights Engine V1
 * ============================================================
 *
 * Adjusts system weights based on observed learning signals.
 */

export interface AdaptiveWeights {
  atsMultiplier: number;
  rankingMultiplier: number;
  decisionSensitivity: number;
  skillWeights: Record<string, number>;
}

/**
 * Core adaptation logic
 */
export function computeAdaptiveWeights(
  state: LearningState
): AdaptiveWeights {

  const baseATS = 1;
  const baseRanking = 1;
  const baseDecision = 1;

  /**
   * ============================================================
   * SIGNAL NORMALIZATION
   * ============================================================
   */

  const totalSignals =
    state.successSignals + state.rejectionSignals || 1;

  const successRatio =
    state.successSignals / totalSignals;

  const rejectionRatio =
    state.rejectionSignals / totalSignals;

  /**
   * ============================================================
   * GLOBAL ADJUSTMENTS
   * ============================================================
   */

  const atsMultiplier =
    successRatio > 0.6
      ? baseATS * 1.1
      : rejectionRatio > 0.6
      ? baseATS * 0.9
      : baseATS;

  const rankingMultiplier =
    state.avgDecisionScore > 70
      ? baseRanking * 1.05
      : baseRanking * 0.95;

  const decisionSensitivity =
    state.avgATS > 75
      ? baseDecision * 1.1
      : baseDecision * 0.95;

  /**
   * ============================================================
   * SKILL WEIGHTS EVOLUTION
   * ============================================================
   */

  const skillWeights: Record<string, number> = {
    javascript: successRatio > 0.6 ? 1.2 : 1,
    typescript: successRatio > 0.6 ? 1.15 : 1,
    react: successRatio > 0.6 ? 1.1 : 1,
    node: successRatio > 0.5 ? 1.1 : 1,
    python: rejectionRatio > 0.6 ? 1.2 : 1,
    aws: rejectionRatio > 0.5 ? 1.15 : 1,
  };

  return {
    atsMultiplier,
    rankingMultiplier,
    decisionSensitivity,
    skillWeights,
  };
}