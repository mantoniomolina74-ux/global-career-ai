/**
 * ============================================================
 * Global Career AI
 * Application State Adapter V1.1
 * ============================================================
 *
 * Transforms Application Intelligence output into
 * Application domain state.
 *
 * Responsibilities:
 * - Normalize application insights
 * - Build ApplicationState contract
 * - Preserve domain boundaries
 *
 * No dashboard logic.
 * No persistence.
 * No engine execution.
 * ============================================================
 */

import type {
  ApplicationState,
} from "@/lib/engine/contracts/intelligence/applicationState";


type ApplicationInsightsInput = {
  funnel: {
    total: number;
    conversionRate: number;
    offerRate: number;
    successRate: number;
  };

  performance: {
    totalApplications: number;
    activePipeline: number;
    responseRate: number;
    rejectionRate: number;
  };
};


export function buildApplicationState(
  insights: ApplicationInsightsInput
): ApplicationState {

  return {
    totalApplications:
      insights.performance.totalApplications,

    activePipeline:
      insights.performance.activePipeline,

    responseRate:
      insights.performance.responseRate,

    rejectionRate:
      insights.performance.rejectionRate,

    conversionRate:
      insights.funnel.conversionRate,

    offerRate:
      insights.funnel.offerRate,

    successRate:
      insights.funnel.successRate,

    confidence:
      insights.performance.totalApplications > 0
        ? 1
        : 0,
  };
}