/**
 * ============================================================
 * Global Career AI
 * Workforce Planning Intelligence Service V1.0
 * ============================================================
 *
 * Converts real Talent Intelligence signals into workforce
 * planning priorities and recommended strategies.
 *
 * No fake data.
 * No ATS scores.
 * No Matching scores.
 * No Ranking scores.
 * No hiring probability.
 * No invented market scores.
 *
 * ============================================================
 */

import {
  getTalentIntelligence,
} from "@/lib/enterprise/talentIntelligenceService";

import type {
  TalentGap,
} from "@/lib/engine/contracts/intelligence/talentIntelligence";

import type {
  WorkforcePlanning,
  WorkforcePlanningCapability,
  WorkforcePlanningPriority,
  WorkforcePlanningStrategy,
} from "@/lib/engine/contracts/intelligence/workforce/workforcePlanning";


function calculatePriority(
  gap: TalentGap
): WorkforcePlanningPriority {

  if (
    gap.gapType === "NO_DIRECT_SUPPLY" &&
    gap.demandCount >= 100
  ) {
    return "HIGH";
  }

  if (
    gap.gapType === "LOW_SUPPLY" &&
    gap.demandCount >= 50
  ) {
    return "HIGH";
  }

  if (
    gap.gapType === "TRANSFERABLE_SUPPLY" &&
    gap.demandCount >= 50
  ) {
    return "MEDIUM";
  }

  if (
    gap.gapType === "NO_DIRECT_SUPPLY" ||
    gap.gapType === "LOW_SUPPLY" ||
    gap.gapType === "TRANSFERABLE_SUPPLY"
  ) {
    return "MEDIUM";
  }

  return "LOW";
}


function calculateStrategy(
  gap: TalentGap
): WorkforcePlanningStrategy {

  if (
    gap.gapType === "NO_DIRECT_SUPPLY" &&
    gap.transferableSupplyCount === 0
  ) {
    return "SOURCE";
  }

  if (
    gap.gapType === "TRANSFERABLE_SUPPLY" &&
    gap.directSupplyCount === 0
  ) {
    return "LEVERAGE_TRANSFERABLE";
  }

  if (
    gap.gapType === "LOW_SUPPLY" &&
    gap.directSupplyCount > 0
  ) {
    return "DEVELOP";
  }

  if (
    gap.gapType === "BALANCED"
  ) {
    return "MONITOR";
  }

  return "HIRE";
}


function buildRationale(
  gap: TalentGap,
  priority: WorkforcePlanningPriority,
  strategy: WorkforcePlanningStrategy
): string {

  if (strategy === "SOURCE") {
    return (
      `${gap.capability} has demand across ` +
      `${gap.demandCount} jobs with no direct or ` +
      `transferable candidate supply. ` +
      `External sourcing is recommended. ` +
      `Priority: ${priority}.`
    );
  }

  if (strategy === "LEVERAGE_TRANSFERABLE") {
    return (
      `${gap.capability} has demand across ` +
      `${gap.demandCount} jobs with ` +
      `${gap.transferableSupplyCount} transferable ` +
      `candidate(s) and no direct supply. ` +
      `Transferable talent should be evaluated. ` +
      `Priority: ${priority}.`
    );
  }

  if (strategy === "DEVELOP") {
    return (
      `${gap.capability} has demand across ` +
      `${gap.demandCount} jobs and existing direct ` +
      `candidate supply, but supply remains below demand. ` +
      `Capability development should be considered. ` +
      `Priority: ${priority}.`
    );
  }

  if (strategy === "MONITOR") {
    return (
      `${gap.capability} has sufficient direct supply ` +
      `relative to observed demand. ` +
      `Continue monitoring workforce balance. ` +
      `Priority: ${priority}.`
    );
  }

  return (
    `${gap.capability} has direct candidate supply ` +
    `against observed demand across ` +
    `${gap.demandCount} jobs. ` +
    `Additional hiring capacity may be required. ` +
    `Priority: ${priority}.`
  );
}


function buildPlanningCapability(
  gap: TalentGap
): WorkforcePlanningCapability {

  const priority =
    calculatePriority(gap);

  const strategy =
    calculateStrategy(gap);

  return {
    capability:
      gap.capability,

    category:
      gap.category,

    demandCount:
      gap.demandCount,

    supplyCandidateCount:
      gap.supplyCandidateCount,

    directSupplyCount:
      gap.directSupplyCount,

    transferableSupplyCount:
      gap.transferableSupplyCount,

    gapType:
      gap.gapType,

    priority,

    strategy,

    rationale:
      buildRationale(
        gap,
        priority,
        strategy
      ),
  };
}


function priorityRank(
  priority: WorkforcePlanningPriority
): number {

  if (priority === "HIGH") {
    return 1;
  }

  if (priority === "MEDIUM") {
    return 2;
  }

  return 3;
}


function strategyRank(
  strategy: WorkforcePlanningStrategy
): number {

  if (strategy === "SOURCE") {
    return 1;
  }

  if (strategy === "LEVERAGE_TRANSFERABLE") {
    return 2;
  }

  if (strategy === "DEVELOP") {
    return 3;
  }

  if (strategy === "HIRE") {
    return 4;
  }

  return 5;
}


export async function getWorkforcePlanning(
  requestingUserId: string,
  organizationId: string
): Promise<WorkforcePlanning> {

  if (
    !requestingUserId ||
    !organizationId
  ) {
    throw new Error(
      "User and organization context are required"
    );
  }

  const talentIntelligence =
    await getTalentIntelligence(
      requestingUserId,
      organizationId
    );

  const planning =
    talentIntelligence.gaps.gaps
      .map(
        buildPlanningCapability
      )
      .sort(
        (a, b) => {

          const priorityDifference =
            priorityRank(a.priority) -
            priorityRank(b.priority);

          if (
            priorityDifference !== 0
          ) {
            return priorityDifference;
          }

          const strategyDifference =
            strategyRank(a.strategy) -
            strategyRank(b.strategy);

          if (
            strategyDifference !== 0
          ) {
            return strategyDifference;
          }

          if (
            b.demandCount !==
            a.demandCount
          ) {
            return (
              b.demandCount -
              a.demandCount
            );
          }

          return a.capability.localeCompare(
            b.capability
          );
        }
      );

  return {
    scope: {
      organizationId,

      generatedAt:
        new Date().toISOString(),
    },

    planning: {
      capabilities:
        planning,
    },
  };
}