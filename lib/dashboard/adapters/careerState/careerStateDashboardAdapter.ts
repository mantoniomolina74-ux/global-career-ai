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


    learning: {

      activePatterns:
        [],

      learningSignals:
        [],

      recommendedActions:
        [],

    },


    decision: {

      recommendations:
        Array.isArray(decision)
          ? decision
          : [],

      confidence:
        0,

    },

  };

}