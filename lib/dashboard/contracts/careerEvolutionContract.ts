/**
 * ============================================================
 * Global Career AI
 * Career Evolution Contract V1.0
 * ============================================================
 *
 * Professional trajectory intelligence derived from the
 * candidate's current real career state.
 *
 * Career Evolution does not generate historical trends.
 * Historical evolution will require persisted snapshots.
 *
 * It consumes existing professional intelligence and identifies
 * the candidate's current position, career direction, strengths,
 * development areas, priority skills, and recommended actions.
 * ============================================================
 */

export interface CareerEvolutionInsight {
  currentPosition: CareerEvolutionCurrentPosition;

  careerDirection: CareerEvolutionDirection;

  strengths: string[];

  developmentAreas: string[];

  prioritySkills: string[];

  recommendedActions: string[];
}

export interface CareerEvolutionCurrentPosition {
  careerLevel: string;

  marketFit: number;

  readinessScore: number;
}

export interface CareerEvolutionDirection {
  nextCareerStep: string;

  targetRoles: string[];

  targetIndustries: string[];
}
