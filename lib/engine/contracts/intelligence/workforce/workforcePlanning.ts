/**
 * ============================================================
 * Global Career AI
 * Workforce Planning Intelligence Contract V1.0
 * ============================================================
 *
 * Converts real Talent Intelligence supply, demand and gap
 * signals into workforce planning priorities and actions.
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

import type {
  TalentGapType,
} from "@/lib/engine/contracts/intelligence/talentIntelligence";

/**
 * Planning priority derived from observable demand/supply
 * conditions.
 */
export type WorkforcePlanningPriority =
  | "HIGH"
  | "MEDIUM"
  | "LOW";

/**
 * Recommended workforce strategy.
 *
 * HIRE:
 * Direct talent exists but additional capacity is required.
 *
 * SOURCE:
 * Demand exists with no direct or transferable supply.
 *
 * LEVERAGE_TRANSFERABLE:
 * Transferable talent exists and may be redirected or
 * considered for the capability.
 *
 * DEVELOP:
 * Existing direct talent exists but demand materially
 * exceeds current direct supply.
 *
 * MONITOR:
 * Supply and demand are sufficiently balanced for V1.0.
 */
export type WorkforcePlanningStrategy =
  | "HIRE"
  | "SOURCE"
  | "LEVERAGE_TRANSFERABLE"
  | "DEVELOP"
  | "MONITOR";

/**
 * Observable workforce planning signal for one capability.
 */
export type WorkforcePlanningCapability = {
  capability: string;

  category: string;

  demandCount: number;

  supplyCandidateCount: number;

  directSupplyCount: number;

  transferableSupplyCount: number;

  gapType: TalentGapType;

  priority: WorkforcePlanningPriority;

  strategy: WorkforcePlanningStrategy;

  rationale: string;
};

/**
 * Aggregated workforce planning intelligence.
 */
export type WorkforcePlanningIntelligence = {
  capabilities: WorkforcePlanningCapability[];
};

/**
 * Scope of the workforce planning analysis.
 */
export type WorkforcePlanningScope = {
  organizationId: string;

  generatedAt: string;
};

/**
 * Complete Workforce Planning Intelligence V1.0 contract.
 */
export type WorkforcePlanning = {
  scope: WorkforcePlanningScope;

  planning: WorkforcePlanningIntelligence;
};