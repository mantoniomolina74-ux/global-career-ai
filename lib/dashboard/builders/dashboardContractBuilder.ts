/**
 * ============================================================
 * Global Career AI
 * Dashboard Contract Builder V1.1
 * ============================================================
 *
 * Responsible for assembling the final DashboardContract.
 *
 * Responsibilities:
 * - Combine intelligence outputs
 * - Guarantee contract completeness
 * - Provide safe defaults
 *
 * Does not execute intelligence logic.
 * ============================================================
 */

import type {
  DashboardContract,
  DashboardExecutiveSummary,
  DashboardIntelligence,
  DashboardRecommendations,
  DashboardEvidence,
  DashboardTimeline,
  DashboardDiagnostics,
  DashboardMetadata,
} from "../contracts/dashboardContract";


export interface DashboardBuilderInput {
  metadata: DashboardMetadata;

  executiveSummary: DashboardExecutiveSummary;

  intelligence: DashboardIntelligence;

  recommendations: DashboardRecommendations;

  evidence: DashboardEvidence;

  timeline: DashboardTimeline;

  diagnostics: DashboardDiagnostics;
}


export function buildDashboardContract(
  input: DashboardBuilderInput
): DashboardContract {

  return {
    metadata: input.metadata,

    executiveSummary: input.executiveSummary,

    intelligence: input.intelligence,

    recommendations: input.recommendations,

    evidence: input.evidence,

    timeline: input.timeline,

    diagnostics: input.diagnostics,
  };
}