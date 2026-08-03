/**
 * ============================================================
 * Global Career AI
 * Application State Adapter V1.1
 * ============================================================
 *
 * Domain adapter between Application Intelligence
 * and CareerState.
 *
 * No business logic.
 * No persistence.
 * No engine execution.
 *
 * Responsibility:
 * Adapt ApplicationInsightsResult into ApplicationState.
 * ============================================================
 */

import type {
  ApplicationInsightsResult,
} from "@/lib/engine/contracts/engineContracts";

import type {
  ApplicationState,
} from "@/lib/engine/contracts/intelligence/applicationState";

export function buildApplicationState(
  result: ApplicationInsightsResult
): ApplicationState {

  return {

    totalApplications:
      result.performance.totalApplications,

    activePipeline:
      result.performance.activePipeline,

    responseRate:
      result.performance.responseRate,

    rejectionRate:
      result.performance.rejectionRate,

    conversionRate:
      result.funnel.conversionRate,

    offerRate:
      result.funnel.offerRate,

    successRate:
      result.funnel.successRate,

    confidence: 1,
  };

}