export interface LearningMemory {
  userId: string;

  trends: {
    atsHistory: number[];
    rankingHistory: number[];
    recommendationHistory: number[];
    decisionHistory: {
      decisionId: string;
      score: number;
      priority: string;
      timestamp: string;
    }[];
  };

  skills: {
    evolution: Record<
      string,
      {
        successRate: number;
        occurrences: number;
      }
    >;
  };

  metadata: {
    lastUpdated: string;
  };
}
