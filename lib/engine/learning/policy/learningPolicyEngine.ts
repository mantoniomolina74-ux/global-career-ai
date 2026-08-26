import {
  LearningPolicyResult,
} from "./learningPolicyTypes";

import {
  LearningPattern,
} from "../../learning-intelligence/learningPatternTypes";

import {
  LearningPolicySignal,
} from "./learningPolicySignal";


export function evaluateLearningPolicies(
  patterns: LearningPattern[]
): LearningPolicyResult {
  const signals: LearningPolicySignal[] = [];

  for (const pattern of patterns) {
    switch (pattern.type) {
      case "FAILURE_PATTERN": {
        const signal: LearningPolicySignal = {
          atsDelta: -0.02,
          decisionDelta: 0.03,
          weight: pattern.confidence,
        };

        signals.push(signal);

        break;
      }

      case "SUCCESS_PATTERN": {
        const signal: LearningPolicySignal = {
          rankingDelta: 0.02,
          decisionDelta: -0.01,
          weight: pattern.confidence,
        };

        signals.push(signal);

        break;
      }

      case "SKILL_GAP": {
        const signal: LearningPolicySignal = {
          atsDelta: -0.01,
          rankingDelta: 0.01,
          weight: pattern.confidence,
        };

        signals.push(signal);

        break;
      }
    }
  }

  return {
    signals,
  };
}
