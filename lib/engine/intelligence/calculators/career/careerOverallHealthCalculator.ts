import { CareerState } from "../../../contracts/careerState";
import { CAREER_INSIGHTS_WEIGHTS } from "../../weights/careerInsightsWeights";

export function calculateCareerOverallHealth(
  state: CareerState
): number {
  const atsScore =
    state.intelligence.ats?.score ?? 0;

  const matchingScore =
    state.intelligence.matching?.score ?? 0;

  const competencyScore =
    state.intelligence.competency?.overallScore ?? 0;

  const knowledgeScore =
    state.intelligence.knowledge?.averageScore ?? 0;

  const overallHealth =
    atsScore * CAREER_INSIGHTS_WEIGHTS.ats +
    matchingScore * CAREER_INSIGHTS_WEIGHTS.matching +
    competencyScore * CAREER_INSIGHTS_WEIGHTS.competency +
    knowledgeScore * CAREER_INSIGHTS_WEIGHTS.knowledge;

  return Math.round(overallHealth);
}