/**
 * ============================================================
 * Global Career AI
 * Knowledge Dashboard Service V1.1
 * ============================================================
 *
 * Adapter between Knowledge Intelligence
 * and Dashboard Experience.
 *
 * Responsibilities:
 * - Read knowledge intelligence results
 * - Transform domain output
 * - Return Dashboard-compatible structure
 *
 * Does not modify knowledge evaluation behavior.
 * ============================================================
 */

import type { KnowledgeInsight } from "../contracts/dashboardContract";


export interface KnowledgeDashboardContext {
  userId: string;

  tenantId: string;
}


export async function getKnowledgeDashboardInsight(
  context: KnowledgeDashboardContext
): Promise<KnowledgeInsight> {

  return {
    dominantDomains: [],

    averageScore: 0,

    knowledgeGaps: [],
  };
}