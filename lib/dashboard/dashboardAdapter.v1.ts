/**
 * ============================================================
 * Global Career AI
 * Dashboard Adapter V1.1 (Product Read Layer)
 * ============================================================
 *
 * Compatibility adapter between:
 *
 * Dashboard Experience
 *        ?
 * Dashboard Aggregation Layer
 *
 * Maintains backward compatibility
 * with previous dashboard consumers.
 *
 * Supports CareerState intelligence injection.
 *
 * Analytics V1.0 is exposed as an additive read model.
 * ============================================================
 */

import type {
  CareerState,
} from "@/lib/engine/contracts/careerState";

import {
  aggregateDashboard,
} from "./aggregation/dashboardAggregator";

import {
  buildAnalytics,
} from "@/lib/analytics/analyticsEngine.v1";


export async function getDashboardData(

  userId: string,

  tenantId: string = "default",

  applicationId?: number,

  professionalText?: string,

  careerState?: CareerState

) {

  const dashboard =
    await aggregateDashboard({

      userId,

      tenantId,

      applicationId,

      professionalText,

      careerState,

    });


  const ats =
    dashboard.intelligence.ats;


  const analyticsV1 =
    buildAnalytics(dashboard);


  console.log("[DASHBOARD ADAPTER DEBUG]", {
    userId,
    dashboardATS:
      dashboard.intelligence.ats,
    avgATS:
      dashboard.intelligence.ats?.score,
    analyticsV1,
    partialData:
      dashboard.diagnostics.dataQuality.partialData,
  });


  const matching =
    dashboard.intelligence.matching;


  const learning =
    dashboard.intelligence.learning;


  const application =
    dashboard.intelligence.application;


  return {

    userId,

    /**
     * V1.1 CONTRACT
     */
    dashboard,


    /**
     * ANALYTICS V1.0
     *
     * New analytical read model built from
     * the existing DashboardContract.
     */
    analyticsV1,


    /**
     * LEGACY COMPATIBILITY
     */
    empty: false,

    analytics: {

      performance: {

        avgATS:
          ats.score,

        avgRanking:
          matching.matchScore,

      },

      funnel: {

        applications:
          application.totalApplications,

      },

      ats:
        ats,

      matching:
        matching,

      application:
        application,

      insights: [

        ...ats.improvements,

        ...matching.alignmentFactors,

        ...learning.recommendedActions,

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
