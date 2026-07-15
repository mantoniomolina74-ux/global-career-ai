export interface UserAnalytics {
  userId: string;
  tenantId?: string;

  performance: {
    avgATS: number;
    avgRanking: number;
    avgDecisionScore: number;
    avgRecommendationScore: number;
  };

  funnel: {
    applications: number;
    highScoreApplications: number;
    estimatedInterviewRate: number;
    estimatedHireProbability: number;
  };

  trends: {
    improvementRate: number;
    volatility: number;
  };

  insights: string[];
}