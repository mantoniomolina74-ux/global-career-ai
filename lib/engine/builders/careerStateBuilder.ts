/**

* ============================================================
* Global Career AI
* Career State Builder V1.1
* ============================================================
*
* Domain adapter between OrchestratorResult and CareerState.
*
* No business logic.
* No persistence.
* No engine execution.
*
* Responsibility:
* Compose the Career Intelligence domain state.
* ============================================================
  */

import {
OrchestratorResult,
} from "@/lib/engine/contracts/engineContracts";

import {
CareerState,
} from "@/lib/engine/contracts/careerState";

import {
  buildATSState,
} from "@/lib/engine/adapters/intelligence/atsStateAdapter";

import {
  buildMatchingState,
} from "@/lib/engine/adapters/intelligence/matchingStateAdapter";

export function buildCareerState(
result: OrchestratorResult
): CareerState {

return {
readiness: {
score: result.summary.averageATS,


  level:
    result.summary.averageATS >= 80
      ? "HIGH"
      : result.summary.averageATS >= 60
      ? "MEDIUM"
      : "LOW",

  atsScore: result.summary.averageATS,

  skillCount: 0,

  certificationCount: 0,

  recommendations: [],
},

metrics: {
  averageMatch: result.summary.averageATS,

  topMatches: result.summary.topScore,

  skillsCount: 0,

  atsScore: result.summary.averageATS,
},

gapAnalysis: {
  readiness: "UNKNOWN",

  nextCareerStep: "UNKNOWN",

  missingSkills: [],

  recommendedCertifications: [],
},

profileIntelligence: {
  careerLevel: "UNKNOWN",

  marketFit: 0,

  improvementAreas: [],
},

intelligence: {
  ats: buildATSState(result.ats),

  matching: buildMatchingState(
    result.matching.items
  ),

  knowledge: result.knowledge,

  decision: result.decision,

  learning: result.context,
},


};
}
