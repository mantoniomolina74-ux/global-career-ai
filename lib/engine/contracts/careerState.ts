/**

* ============================================================
* Global Career AI
* Career State Contract V1.1
* ============================================================
*
* Single Source of Truth for Career Intelligence.
*
* This contract represents the complete professional state
* of a candidate after all intelligence engines have been
* composed.
*
* This is a Domain Contract.
* No business logic belongs here.
* ============================================================
  */

import type { ATSState } from "./intelligence/atsState";
import type { MatchingState } from "./intelligence/matchingState";
import type { CompetencyState } from "./intelligence/competencyState";
import type { KnowledgeState } from "./intelligence/knowledgeState";
import type { ApplicationState } from "./intelligence/applicationState";

export interface CareerState {
readiness: CareerReadiness;

metrics: CareerMetrics;

gapAnalysis: CareerGapAnalysis;

profileIntelligence: CareerProfileIntelligence;

intelligence: CareerIntelligence;
}

export interface CareerReadiness {
score: number;

level: string;

atsScore: number;

skillCount: number;

certificationCount: number;

recommendations: string[];
}

export interface CareerMetrics {
averageMatch: number;

topMatches: number;

skillsCount: number;

atsScore: number;
}

export interface CareerGapAnalysis {
readiness: string;

nextCareerStep: string;

missingSkills: string[];

recommendedCertifications: string[];
}

export interface CareerProfileIntelligence {
careerLevel: string;

marketFit: number;

improvementAreas: string[];

application?: ApplicationState;
}

export interface CareerIntelligence {
  ats?: ATSState;

  matching?: MatchingState;

  competency?: CompetencyState;

  knowledge?: KnowledgeState;

  learning?: unknown;

  decision?: unknown;
}