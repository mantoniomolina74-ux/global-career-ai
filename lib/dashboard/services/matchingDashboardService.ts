/**
 * ============================================================
 * Global Career AI
 * Matching Dashboard Service V1.1
 * ============================================================
 *
 * Adapter between Matching Intelligence
 * and Dashboard Experience.
 *
 * Responsibilities:
 * - Read matching intelligence results
 * - Transform domain output
 * - Return Dashboard-compatible structure
 *
 * Does not modify matching behavior.
 * ============================================================
 */

import type { MatchingInsight } from "../contracts/dashboardContract";


export interface MatchingDashboardContext {
  userId: string;

  tenantId: string;
}


export async function getMatchingDashboardInsight(
  context: MatchingDashboardContext
): Promise<MatchingInsight> {

  return {
    matchScore: 0,

    targetRoles: [],

    alignmentFactors: [],
  };
}