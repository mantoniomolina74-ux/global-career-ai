/**
 * ============================================================
 * Global Career AI
 * Dashboard Adapter V1.1 (Product Read Layer)
 * ============================================================
 *
 * Compatibility adapter between:
 *
 * Dashboard Experience
 *          ↓
 * Dashboard Aggregation Layer
 *
 * Maintains backward compatibility
 * with previous dashboard consumers.
 * ============================================================
 */

import { aggregateDashboard } from "./aggregation/dashboardAggregator";


export async function getDashboardData(
  userId: string,
  tenantId: string = "default",
  professionalText?: string
) {

  const dashboard =
    await aggregateDashboard({
      userId,
      tenantId,
      professionalText,
    });


  return {
    userId,

    /**
     * V1.1 CONTRACT
     */
    dashboard,


    /**
     * LEGACY COMPATIBILITY
     */
    empty: false,

    analytics: {

      performance: {
        avgATS:
          dashboard.intelligence.ats.score,

        avgRanking:
          dashboard.intelligence.matching.matchScore,
      },


      funnel: {
        estimatedHireProbability:
          dashboard.intelligence.decision.confidence,

        applications: 0,
      },


      ats:
        dashboard.intelligence.ats,


      matching:
        dashboard.intelligence.matching,


      insights: [
        ...dashboard.intelligence.ats.improvements,

        ...dashboard.intelligence.matching.alignmentFactors,

        ...dashboard.intelligence.learning.recommendedActions,
      ],

    },


    /**
     * UI STATUS
     */
    ui: {
      status:
        dashboard.diagnostics.executionStatus === "SUCCESS"
          ? "READY"
          : "PARTIAL",
    },
  };
}