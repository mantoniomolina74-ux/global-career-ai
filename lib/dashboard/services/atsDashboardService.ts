/**
 * ============================================================
 * Global Career AI
 * ATS Dashboard Service V1.1
 * ============================================================
 *
 * Adapter between ATS Intelligence
 * and Dashboard Experience.
 *
 * Responsibilities:
 * - Read ATS intelligence results
 * - Transform domain output
 * - Return Dashboard-compatible structure
 *
 * Does not modify ATS evaluation behavior.
 * ============================================================
 */

import type { ATSInsight } from "../contracts/dashboardContract";


export interface ATSDashboardContext {
  userId: string;

  tenantId: string;
}


export async function getATSDashboardInsight(
  context: ATSDashboardContext
): Promise<ATSInsight> {

  return {
    score: 0,

    strengths: [],

    improvements: [],
  };
}