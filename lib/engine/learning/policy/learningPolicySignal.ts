export interface LearningPolicySignal {
  atsDelta?: number;
  rankingDelta?: number;
  decisionDelta?: number;
  weight: number;
}
