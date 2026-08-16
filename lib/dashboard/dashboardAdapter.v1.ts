/**
 * ============================================================
 * Global Career AI
 * Dashboard Adapter V1.1 (Product Read Layer)
 * ============================================================
 *
 * Compatibility adapter between:
 *
 * Dashboard Experience
 *        ↓
 * Dashboard Aggregation Layer
 *
 * Maintains backward compatibility
 * with previous dashboard consumers.
 *
 * Supports CareerState intelligence injection.
 * ============================================================
 */

import type {
  CareerState,
} from "@/lib/engine/contracts/careerState";

import {
  aggregateDashboard,
} from "./aggregation/dashboardAggregator";


export async function getDashboardData(

  userId: string,

  tenantId: string = "default",

  applicationId?: string,

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


  console.log("[DASHBOARD ADAPTER DEBUG]", {
    userId,
    dashboardATS: dashboard.intelligence.ats,
    avgATS: dashboard.intelligence.ats?.score,
    partialData:
      dashboard.diagnostics.dataQuality.partialData,
  });


  const matching =
    dashboard.intelligence.matching;


  const decision =
    dashboard.intelligence.decision;


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


        estimatedHireProbability:
          decision.confidence,



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