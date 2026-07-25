import { LearningSignal } from "../weights/learningWeights.engine";

import {
  LearningPattern,
  LearningPolicyResult,
} from "./learningPolicyTypes";

export function evaluateLearningPolicies(
  patterns: LearningPattern[]
): LearningPolicyResult {
  const signals: LearningSignal[] = [];
  const reasoning: string[] = [];

  for (const pattern of patterns) {
    switch (pattern.type) {
      case "FAILURE_PATTERN":
        signals.push({
          atsDelta: -0.02,
          decisionDelta: 0.03,
          weight: pattern.confidence,
        });

        reasoning.push(
          `FAILURE_PATTERN detected (confidence=${pattern.confidence})`
        );
        break;

      case "SUCCESS_PATTERN":
        signals.push({
          rankingDelta: 0.02,
          decisionDelta: -0.01,
          weight: pattern.confidence,
        });

        reasoning.push(
          `SUCCESS_PATTERN detected (confidence=${pattern.confidence})`
        );
        break;

      case "SKILL_GAP":
        signals.push({
          atsDelta: -0.01,
          rankingDelta: 0.01,
          weight: pattern.confidence,
        });

        reasoning.push(
          `SKILL_GAP detected (confidence=${pattern.confidence})`
        );
        break;
    }
  }

  return {
    signals,
    reasoning,
  };
}