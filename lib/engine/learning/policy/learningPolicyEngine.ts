import {
  LearningPattern,
  LearningPolicyResult,
} from "./learningPolicyTypes";

import {
  LearningPolicySignal,
} from "./learningPolicySignal";


export function evaluateLearningPolicies(
  patterns: LearningPattern[]
): LearningPolicyResult {
  const signals: LearningPolicySignal[] = [];
  const reasoning: string[] = [];

  for (const pattern of patterns) {
    switch (pattern.type) {
      case "FAILURE_PATTERN": {
        const signal: LearningPolicySignal = {
          atsDelta: -0.02,
          decisionDelta: 0.03,
          weight: pattern.confidence,
        };

        signals.push(signal);

        reasoning.push(
          `FAILURE_PATTERN detected (confidence=${pattern.confidence})`
        );

        break;
      }

      case "SUCCESS_PATTERN": {
        const signal: LearningPolicySignal = {
          rankingDelta: 0.02,
          decisionDelta: -0.01,
          weight: pattern.confidence,
        };

        signals.push(signal);

        reasoning.push(
          `SUCCESS_PATTERN detected (confidence=${pattern.confidence})`
        );

        break;
      }

      case "SKILL_GAP": {
        const signal: LearningPolicySignal = {
          atsDelta: -0.01,
          rankingDelta: 0.01,
          weight: pattern.confidence,
        };

        signals.push(signal);

        reasoning.push(
          `SKILL_GAP detected (confidence=${pattern.confidence})`
        );

        break;
      }
    }
  }

  return {
    signals,
    reasoning,
  };
}
