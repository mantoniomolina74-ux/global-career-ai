/**
 * ============================================================
 * Global Career AI
 * Competency Dashboard Service V1.1
 * ============================================================
 *
 * Adapter between Competency Intelligence
 * and Dashboard Experience.
 *
 * Responsibilities:
 * - Read competency intelligence results
 * - Transform domain output
 * - Return Dashboard-compatible structure
 *
 * Does not modify competency evaluation behavior.
 * ============================================================
 */

import type { CompetencyInsight } from "../contracts/dashboardContract";


export interface CompetencyDashboardContext {
  userId: string;

  tenantId: string;
}


export async function getCompetencyDashboardInsight(
  context: CompetencyDashboardContext
): Promise<CompetencyInsight> {

  return {
    overallScore: 0,

    strongestCompetencies: [],

    competencyGaps: [],
  };
}