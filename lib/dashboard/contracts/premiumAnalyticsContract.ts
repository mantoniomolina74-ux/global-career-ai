/**
 * ============================================================
 * Global Career AI
 * Premium Analytics Contract V1.0
 * ============================================================
 *
 * Aggregated analytics contract for the Premium Dashboard.
 *
 * Analytics does not execute ATS, Matching, Competency,
 * Knowledge, or Application engines.
 *
 * It consumes existing intelligence and persisted application
 * data and provides a unified analytical view.
 *
 * No historical trend is represented until real persisted
 * snapshots exist.
 * ============================================================
 */

export interface PremiumAnalyticsInsight {
  careerPerformance: CareerPerformanceAnalytics;

  applicationPerformance: ApplicationPerformanceAnalytics;

  opportunityPerformance: OpportunityPerformanceAnalytics;

  careerSignals: CareerSignalsAnalytics;
}

/**
 * ============================================================
 * CAREER PERFORMANCE
 * ============================================================
 *
 * Current professional intelligence.
 *
 * Scores originate from existing intelligence engines.
 * Analytics does not recalculate them.
 * ============================================================
 */

export interface CareerPerformanceAnalytics {
  ats: number;

  matching: number;

  competency: number;

  knowledge: number;

  careerHealth: number;

  marketReadiness: number;
}

/**
 * ============================================================
 * APPLICATION PERFORMANCE
 * ============================================================
 *
 * Real persisted application performance.
 *
 * Values originate from applicationInsights.
 * ============================================================
 */

export interface ApplicationPerformanceAnalytics {
  totalApplications: number;

  activePipeline: number;

  responseRate: number;

  rejectionRate: number;

  conversionRate: number;

  offerRate: number;

  successRate: number;

  statusBreakdown: Record<string, number>;
}

/**
 * ============================================================
 * OPPORTUNITY PERFORMANCE
 * ============================================================
 *
 * Real opportunities evaluated by Matching.
 *
 * Values originate from CareerState Matching intelligence.
 * ============================================================
 */

export interface OpportunityPerformanceAnalytics {
  evaluatedOpportunities: number;

  averageScore: number;

  topScore: number;

  topOpportunities: AnalyticsOpportunity[];

  targetRoles: string[];

  matchedSkills: string[];

  matchedIndustries: string[];
}

export interface AnalyticsOpportunity {
  id: string;

  title: string;

  score: number;

  country?: string;
}

/**
 * ============================================================
 * CAREER SIGNALS
 * ============================================================
 *
 * Cross-intelligence signals already produced by the product.
 *
 * Analytics may aggregate these signals but must not invent
 * new candidate evidence.
 * ============================================================
 */

export interface CareerSignalsAnalytics {
  strengths: string[];

  gaps: string[];

  improvementAreas: string[];

  recommendations: string[];
}