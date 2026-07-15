import { aggregateLearningEvents } from "./learningAggregator.v1";
import { computeAdaptiveWeights } from "./adaptiveWeights.v1";
import { LearningDomainEvent } from "./learningTypes";

/**
 * ============================================================
 * Learning Integration Layer V1
 * ============================================================
 *
 * Connects events → learning state → adaptive behavior
 */

export interface LearningContext {
  weights: ReturnType<typeof computeAdaptiveWeights>;
  state: ReturnType<typeof aggregateLearningEvents>;
}

export function buildLearningContext(
  events: LearningDomainEvent[]
): LearningContext {

  /**
   * STEP 1 — aggregate raw events
   */
  const state = aggregateLearningEvents(events);

  /**
   * STEP 2 — compute adaptive weights
   */
  const weights = computeAdaptiveWeights(state);

  /**
   * STEP 3 — return unified learning context
   */
  return {
    state,
    weights,
  };
}