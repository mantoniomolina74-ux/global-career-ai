/**
 * ============================================================
 * Global Career AI
 * Learning Memory Layer
 * ============================================================
 */

export interface SkillEvolution {
  skill: string;
  exposure: number;
  success: number;
  lastSeen: string;
}

export interface DecisionHistory {
  decisionId: string;
  score: number;
  priority: string;
  timestamp: string;
}

export interface UserLearningMemory {
  userId: string;

  skillEvolution: Record<string, SkillEvolution>;

  decisionHistory: DecisionHistory[];

  atsTrend: number[];

  rankingTrend: number[];

  recommendationTrend: number[];

  lastUpdated: string;
}