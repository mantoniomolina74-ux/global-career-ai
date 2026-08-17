/**
 * ============================================================
 * Global Career AI
 * Matching Dashboard Service V1.1
 * ============================================================
 *
 * Adapter between Matching Intelligence
 * and Dashboard Experience.
 * ============================================================
 */

import { analyzeMatchingProfile } from "@/lib/engine/services/matchingProfileService";

import type { MatchingInsight } from "../contracts/dashboardContract";

export interface MatchingDashboardContext {
  userId: string;

  tenantId: string;
}

async function getMatchingSource(
  _context: MatchingDashboardContext
) {
  /**
   * TODO (V1.1)
   * Replace this placeholder with:
   *
   * - Candidate profile repository
   * - Recommended jobs repository
   *
   * Then invoke analyzeMatchingProfile()
   * using real data.
   */

  return analyzeMatchingProfile([], {
    skills: [],
    industries: [],
  });
}

export async function getMatchingDashboardInsight(
  context: MatchingDashboardContext
): Promise<MatchingInsight> {

  const matching =
    await getMatchingSource(context);

  return {
    matchScore:
      matching.averageMatchScore,

    targetRoles:
      matching.bestMatches
        .slice(0, 5)
        .map(job => job.title ?? ""),

    alignmentFactors: [],
    opportunities: [],
  };
}