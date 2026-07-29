import { scoreCompetencies } from "../scoring/competencyScorer";

export interface CompetencyProfile {
  averageScore: number;

  competencies: {
    id: string;
    score: number;
    matchedPatterns: string[];
  }[];
}

export function analyzeCompetencyProfile(
  professionalText: string
): CompetencyProfile {

  const competencyResults =
    scoreCompetencies(
      professionalText
    );

  const competencies =
    competencyResults.map(
      result => ({
        id:
          result.competency.id,

        score:
          result.competency.score,

        matchedPatterns:
          result.analysis.matchedPatterns,
      })
    );

  const averageScore =
    competencies.length > 0
      ? competencies.reduce(
          (sum, competency) =>
            sum + competency.score,
          0
        ) / competencies.length
      : 0;

  return {
    averageScore,
    competencies,
  };
}