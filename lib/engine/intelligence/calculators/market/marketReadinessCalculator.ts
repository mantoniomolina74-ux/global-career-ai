
import { CareerState } from "../../../contracts/careerState";

export function calculateMarketReadiness(
  state: CareerState
): number {
  const atsScore =
    state.intelligence.ats?.score ??
    state.readiness.atsScore ??
    0;

  const matchingScore =
    state.intelligence.matching?.score ??
    0;

  const competencyScore =
    (state.intelligence.competency?.overallScore ?? 0) * 100;

  const knowledgeScore =
    (state.intelligence.knowledge?.averageScore ?? 0) * 100;

  const profileReadiness =
    calculateProfileReadiness(state);

  const marketReadiness =
    atsScore * 0.25 +
    matchingScore * 0.25 +
    competencyScore * 0.20 +
    knowledgeScore * 0.15 +
    profileReadiness * 0.15;

  return Math.round(
    Math.min(
      Math.max(marketReadiness, 0),
      100
    )
  );
}

function calculateProfileReadiness(
  state: CareerState
): number {
  const readiness =
    state.readiness;

  const skillsScore =
    Math.min(
      readiness.skillCount * 10,
      100
    );

  const certificationScore =
    Math.min(
      readiness.certificationCount * 20,
      100
    );

  const hasProfessionalProfile =
    Boolean(
      state.profileIntelligence.careerLevel
    );

  const profileCompleteness =
    hasProfessionalProfile
      ? 100
      : 0;

  return Math.round(
    skillsScore * 0.50 +
    certificationScore * 0.25 +
    profileCompleteness * 0.25
  );
}
