/**
 * ============================================================
 * Global Career AI
 * Analytics Engine V1.0
 * ============================================================
 *
 * Builds the Analytics read model from the existing
 * Dashboard intelligence contract.
 *
 * This layer does not execute intelligence engines.
 * It does not query the database.
 * It does not invent historical data.
 *
 * Source of truth:
 * DashboardContract
 * ============================================================
 */

import type {
  DashboardContract,
} from "@/lib/dashboard/contracts/dashboardContract";

import type {
  AnalyticsContract,
} from "./analyticsContract.v1";


export function buildAnalytics(
  dashboard: DashboardContract
): AnalyticsContract {

  const intelligence =
    dashboard.intelligence;


  return {

    performance: {

      atsScore:
        intelligence.ats.score,

      matchingScore:
        intelligence.matching.matchScore,

      competencyScore:
        intelligence.competency.overallScore,

      knowledgeScore:
        intelligence.knowledge.averageScore,

    },


    applicationPerformance: {

      totalApplications:
        intelligence.application.totalApplications,

      activePipeline:
        intelligence.application.activePipeline,

      responseRate:
        intelligence.application.responseRate,

      rejectionRate:
        intelligence.application.rejectionRate,

      conversionRate:
        intelligence.application.conversionRate,

      offerRate:
        intelligence.application.offerRate,

      successRate:
        intelligence.application.successRate,

    },


    careerInsights: {

      strengths:
        intelligence.ats.strengths,

      improvementAreas:
        intelligence.ats.improvements,

      targetRoles:
        intelligence.matching.targetRoles,

      alignmentFactors:
        intelligence.matching.alignmentFactors,

      learningSignals:
        intelligence.learning.learningSignals,

      recommendations:
        intelligence.decision.recommendations,

    },


    evolution: {

      available:
        dashboard.timeline.snapshots.length > 0,

      snapshots:
        dashboard.timeline.snapshots.map(
          (snapshot) => ({

            date:
              snapshot.date,

            overallScore:
              snapshot.overallScore,

            competencies:
              snapshot.competencies,

            knowledgeAreas:
              snapshot.knowledgeAreas,

            achievements:
              snapshot.achievements,

          })
        ),

      improvements:
        dashboard.timeline.improvements,

      trend:
        dashboard.timeline.evolutionTrend,

    },

  };

}
