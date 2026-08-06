/**
 * ============================================================
 * Global Career AI
 * Career State Dashboard Adapter V1.1
 * ============================================================
 *
 * Adapter between:
 *
 * CareerState Intelligence Core
 *          ↓
 * Dashboard Intelligence Contract
 *
 * No business logic.
 * No persistence.
 * Only domain transformation.
 * ============================================================
 */

import type {
  CareerState,
} from "@/lib/engine/contracts/careerState";

import type {
  DashboardIntelligence,
} from "@/lib/dashboard/contracts/dashboardContract";


export function adaptCareerStateToDashboard(
  careerState: CareerState
): DashboardIntelligence {


  const ats =
    careerState.intelligence.ats;


  const matching =
    careerState.intelligence.matching;


  const competency =
    careerState.intelligence.competency;


  const knowledge =
    careerState.intelligence.knowledge;


  const application =
    careerState.intelligence.application;


  const learning =
    careerState.intelligence.learning;


  const decision =
    careerState.intelligence.decision;


  return {


    ats: {

      score:
        ats?.score ?? 0,

      strengths:
        ats?.matchedSkills ?? [],

      improvements:
        [
          ...(ats?.missingSkills ?? []),

          ...(ats?.recommendation
            ? [ats.recommendation]
            : []),
        ],

    },


    matching: {

      matchScore:
        matching?.score ?? 0,

      targetRoles:
        matching?.recommendations ?? [],

      alignmentFactors:
        matching?.strengths ?? [],

    },


    competency: {

      overallScore:
        competency?.overallScore ?? 0,

      strongestCompetencies:
        competency?.strengths ?? [],

      competencyGaps:
        competency?.gaps ?? [],

    },


    knowledge: {

      dominantDomains:
        knowledge?.domains.map(
          (domain) =>
            domain.domain.name
        ) ?? [],


      averageScore:
        knowledge?.averageScore ?? 0,


      knowledgeGaps:
        [],

    },


    application: {

      totalApplications:
        application?.totalApplications ?? 0,

      activePipeline:
        application?.activePipeline ?? 0,

      responseRate:
        application?.responseRate ?? 0,

      rejectionRate:
        application?.rejectionRate ?? 0,

      conversionRate:
        application?.conversionRate ?? 0,

      offerRate:
        application?.offerRate ?? 0,

      successRate:
        application?.successRate ?? 0,

    },


    learning: {

      activePatterns:
        extractLearningArray(
          learning,
          "activePatterns"
        ),

      learningSignals:
        extractLearningArray(
          learning,
          "learningSignals"
        ),

      recommendedActions:
        extractLearningArray(
          learning,
          "recommendedActions"
        ),

    },


    decision: {

      recommendations:
        extractLearningArray(
          decision,
          "recommendations"
        ),

      confidence:
        extractConfidence(
          decision
        ),

    },


  };

}


/**
 * Safe extraction helpers
 *
 * CareerState keeps learning and decision
 * contracts flexible during V1.1 evolution.
 */


function extractLearningArray(
  source: unknown,
  key: string
): string[] {

  if (
    typeof source !== "object" ||
    source === null
  ) {
    return [];
  }


  const value =
    (source as Record<string, unknown>)[key];


  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string"
      )
    : [];

}



function extractConfidence(
  source: unknown
): number {

  if (
    typeof source !== "object" ||
    source === null
  ) {
    return 0;
  }


  const value =
    (source as Record<string, unknown>)
      .confidence;


  return typeof value === "number"
    ? value
    : 0;

}