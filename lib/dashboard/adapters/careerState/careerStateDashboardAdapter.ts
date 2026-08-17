
/**
 * ============================================================
 * Global Career AI
 * Career State Dashboard Adapter V1.2.1
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

    /**
     * ==========================================================
     * ATS
     * ==========================================================
     */

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


    /**
     * ==========================================================
     * MATCHING
     * ==========================================================
     *
     * MatchingState is the source of truth for Career
     * Intelligence.
     *
     * Opportunities are preserved from real Matching Engine
     * results and exposed to the Dashboard without generating
     * or inferring additional information.
     */

    matching: {

      matchScore:
        matching?.score ?? 0,

      targetRoles:
        matching?.targetRoles ?? [],

      alignmentFactors:
        matching?.strengths ?? [],

      opportunities:
        matching?.opportunities?.map(
          (opportunity) => ({

            id:
              opportunity.id,

            title:
              opportunity.title,

            matchScore:
              opportunity.score,

            country:
              opportunity.country,

            reasons:
              opportunity.reasons,

            matchedSkills:
              opportunity.matchedSkills,

            matchedIndustries:
              opportunity.matchedIndustries,

          })
        ) ?? [],

    },


    /**
     * ==========================================================
     * COMPETENCY
     * ==========================================================
     */

    competency: {

      overallScore:
        competency?.overallScore ?? 0,

      strongestCompetencies:
        competency?.strengths ?? [],

      competencyGaps:
        competency?.gaps ?? [],

    },


    /**
     * ==========================================================
     * KNOWLEDGE
     * ==========================================================
     */

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


    /**
     * ==========================================================
     * APPLICATION
     * ==========================================================
     */

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


    /**
     * ==========================================================
     * LEARNING
     * ==========================================================
     */

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


    /**
     * ==========================================================
     * DECISION
     * ==========================================================
     */

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
 * ============================================================
 * Safe extraction helpers
 * ============================================================
 *
 * CareerState keeps learning and decision contracts flexible
 * during V1.1 evolution.
 */


/**
 * Extracts a string array safely from an unknown source.
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


/**
 * Extracts confidence safely from an unknown source.
 */

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