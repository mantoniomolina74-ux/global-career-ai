import {
  getTalentSupplyIntelligence,
} from "@/lib/enterprise/talentSupplyService";

import {
  getTalentDemandIntelligence,
} from "@/lib/enterprise/talentDemandService";

import type {
  TalentGap,
  TalentGapIntelligence,
} from "@/lib/engine/contracts/intelligence/talentIntelligence";

/**
 * ============================================================
 * Global Career AI
 * Talent Gap Intelligence V1.0
 * ============================================================
 *
 * Crosses real Talent Supply against real Talent Demand.
 *
 * Sources:
 * - Talent Supply V1.0
 * - Talent Demand V1.0
 *
 * Responsibilities:
 * - Compare capability demand with candidate supply.
 * - Distinguish direct and transferable candidate supply.
 * - Classify organizational capability gaps.
 *
 * Does NOT:
 * - calculate ATS
 * - calculate Matching
 * - calculate Ranking
 * - calculate Talent Score
 * - calculate Market Score
 * - invent candidates
 * - invent jobs
 *
 * ============================================================
 */

function normalizeCapability(
  value: string
): string {
  return value.trim();
}

function capabilityKey(
  value: string
): string {
  return normalizeCapability(
    value
  ).toLowerCase();
}

function classifyGap(
  demandCount: number,
  supplyCandidateCount: number,
  directSupplyCount: number,
  transferableSupplyCount: number
): TalentGap["gapType"] {
  if (
    directSupplyCount > 0 &&
    directSupplyCount >= demandCount
  ) {
    return "BALANCED";
  }

  if (
    directSupplyCount === 0 &&
    transferableSupplyCount > 0
  ) {
    return "TRANSFERABLE_SUPPLY";
  }

  if (
    directSupplyCount === 0 &&
    transferableSupplyCount === 0
  ) {
    return "NO_DIRECT_SUPPLY";
  }

  if (
    supplyCandidateCount < demandCount
  ) {
    return "LOW_SUPPLY";
  }

  return "BALANCED";
}

export async function getTalentGapIntelligence(
  requestingUserId: string,
  organizationId: string
): Promise<TalentGapIntelligence> {
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
  ] = await Promise.all([
    getTalentSupplyIntelligence(
      requestingUserId,
      organizationId
    ),
    getTalentDemandIntelligence(
      organizationId
    ),
  ]);

  const supplyMap =
    new Map<
      string,
      (typeof supply.capabilities)[number]
    >();

  for (const capability of supply.capabilities) {
    supplyMap.set(
      capabilityKey(
        capability.capability
      ),
      capability
    );
  }

  const gaps: TalentGap[] = [];

  for (const demandCapability of demand.capabilities) {
    const key =
      capabilityKey(
        demandCapability.capability
      );

    const supplyCapability =
      supplyMap.get(key);

    const supplyCandidateCount =
      supplyCapability?.candidateCount ??
      0;

    const directSupplyCount =
      supplyCapability?.directCandidateCount ??
      0;

    const transferableSupplyCount =
      supplyCapability?.transferableCandidateCount ??
      0;

    const gapType =
      classifyGap(
        demandCapability.jobCount,
        supplyCandidateCount,
        directSupplyCount,
        transferableSupplyCount
      );

    gaps.push({
      capability:
        normalizeCapability(
          demandCapability.capability
        ),
      category:
        demandCapability.category,
      demandCount:
        demandCapability.jobCount,
      supplyCandidateCount,
      directSupplyCount,
      transferableSupplyCount,
      gapType,
    });
  }

  return {
    gaps: gaps.sort(
      (a, b) => {
        const gapPriority: Record<
          TalentGap["gapType"],
          number
        > = {
          NO_DIRECT_SUPPLY: 1,
          LOW_SUPPLY: 2,
          TRANSFERABLE_SUPPLY: 3,
          BALANCED: 4,
        };

        return (
          gapPriority[a.gapType] -
            gapPriority[b.gapType] ||
          b.demandCount -
            a.demandCount ||
          a.capability.localeCompare(
            b.capability
          )
        );
      }
    ),
  };
}