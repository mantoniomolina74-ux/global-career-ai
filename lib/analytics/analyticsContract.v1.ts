/**
 * ============================================================
 * Global Career AI
 * Analytics Contract V1.0
 * ============================================================
 *
 * Stable analytical read model built from real career
 * intelligence already produced by the system.
 *
 * This contract contains domain types only.
 * No intelligence calculation belongs here.
 * ============================================================
 */

export interface AnalyticsContract {

  performance: AnalyticsPerformance;

  applicationPerformance: AnalyticsApplicationPerformance;

  careerInsights: AnalyticsCareerInsights;

  evolution: AnalyticsEvolution;

}


export interface AnalyticsPerformance {

  atsScore: number;

  matchingScore: number;

  competencyScore: number;

  knowledgeScore: number;

}


export interface AnalyticsApplicationPerformance {

  totalApplications: number;

  activePipeline: number;

  responseRate: number;

  rejectionRate: number;

  conversionRate: number;

  offerRate: number;

  successRate: number;

}


export interface AnalyticsCareerInsights {

  strengths: string[];

  improvementAreas: string[];

  targetRoles: string[];

  alignmentFactors: string[];

  learningSignals: string[];

  recommendations: string[];

}


export interface AnalyticsEvolution {

  available: boolean;

  snapshots: AnalyticsEvolutionSnapshot[];

  improvements: string[];

  trend: string;

}


export interface AnalyticsEvolutionSnapshot {

  date: string;

  overallScore: number;

  competencies: string[];

  knowledgeAreas: string[];

  achievements: string[];

}
