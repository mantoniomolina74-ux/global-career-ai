/**
 * ============================================================
 * Global Career AI
 * Enterprise Analytics Contract V1.0
 * ============================================================
 *
 * Stable organizational analytics read model.
 *
 * This contract contains domain types only.
 * No database access.
 * No intelligence calculation.
 * No authorization logic.
 *
 * Source of truth:
 * Enterprise persisted candidate/application/ATS intelligence.
 * ============================================================
 */

export interface EnterpriseAnalyticsContract {
  organizationId: string;

  candidates: EnterpriseAnalyticsCandidates;

  applications: EnterpriseAnalyticsApplications;

  ats: EnterpriseAnalyticsATS;

  decisions: EnterpriseAnalyticsDecisions;

  ranking: EnterpriseAnalyticsRanking;

  meta: EnterpriseAnalyticsMeta;
}


export interface EnterpriseAnalyticsCandidates {
  candidatesProcessed: number;
}


export interface EnterpriseAnalyticsApplications {
  applicationsProcessed: number;

  atsApplicationsProcessed: number;

  atsCoverageRate: number;
}


export interface EnterpriseAnalyticsATS {
  averageScore: number | null;
}


export interface EnterpriseAnalyticsDecisions {
  shortlisted: number;

  review: number;

  rejected: number;
}


export interface EnterpriseAnalyticsRanking {
  available: boolean;
}


export interface EnterpriseAnalyticsMeta {
  generatedAt: string;

  strategy: "enterprise-analytics-v1";
}