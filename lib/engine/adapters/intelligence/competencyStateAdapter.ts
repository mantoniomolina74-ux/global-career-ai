import type { CompetencyProfile } from "@/lib/knowledge/services/competencyProfileService";

import { CompetencyState } from "../../contracts/intelligence/competencyState";

/**
 * ============================================================
 * Competency State Adapter (V1.1)
 * ============================================================
 * Maps Knowledge Intelligence CompetencyProfile output
 * into the CareerState competency domain contract.
 * ============================================================
 */
export function buildCompetencyState(
  profile: CompetencyProfile
): CompetencyState {
  const competencies =
    profile.competencies.map(
      competency => ({
        id: competency.id,
        score: competency.score,
        matchedPatterns:
          competency.matchedPatterns,
      })
    );

  const strengths =
    [...competencies]
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 5)
      .map(
        competency =>
          competency.id
      );

  const gaps =
    [...competencies]
      .sort(
        (a, b) =>
          a.score - b.score
      )
      .slice(0, 5)
      .map(
        competency =>
          competency.id
      );

  return {
    overallScore:
      profile.averageScore,

    competencies,

    strengths,

    gaps,

    confidence:
      profile.competencies.length > 0
        ? profile.averageScore
        : 0,
  };
}