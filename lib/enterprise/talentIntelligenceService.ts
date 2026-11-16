import {
  getTalentSupplyIntelligence,
} from "@/lib/enterprise/talentSupplyService";

import {
  getTalentDemandIntelligence,
} from "@/lib/enterprise/talentDemandService";

import {
  getTalentGapIntelligence,
} from "@/lib/enterprise/talentGapService";

import type {
  TalentIntelligence,
} from "@/lib/engine/contracts/intelligence/talentIntelligence";

/**
 * ============================================================
 * Global Career AI
 * Talent Intelligence Service V1.0
 * ============================================================
 *
 * Enterprise organizational intelligence orchestrator.
 *
 * Combines:
 * - Talent Supply V1.0
 * - Talent Demand V1.0
 * - Talent Gap V1.0
 *
 * Source of truth:
 * - real organization members
 * - real persisted CV analysis
 * - real persisted Hirebase jobs
 * - existing Job Intelligence
 *
 * Does NOT:
 * - calculate ATS
 * - calculate Matching
 * - calculate Ranking
 * - create another score
 * - invent candidate data
 * - invent job data
 *
 * ============================================================
 */

export async function getTalentIntelligence(
  requestingUserId: string,
  organizationId: string
): Promise<TalentIntelligence> {
  if (
    !requestingUserId ||
    !organizationId
  ) {
    throw new Error(
      "User and organization context are required"
    );
  }

  const [
    supply,
    demand,
    gaps,
  ] = await Promise.all([
    getTalentSupplyIntelligence(
      requestingUserId,
      organizationId
    ),
    getTalentDemandIntelligence(
      organizationId
    ),
    getTalentGapIntelligence(
      requestingUserId,
      organizationId
    ),
  ]);

  return {
    scope: {
      organizationId,
      generatedAt:
        new Date().toISOString(),
    },
    supply,
    demand,
    gaps,
  };
}