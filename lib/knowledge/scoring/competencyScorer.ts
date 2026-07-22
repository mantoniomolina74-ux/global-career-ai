import {
  procurementCompetencies
} from "../competencies/procurementCompetencies";

import {
  normalizeTokens
} from "../utils/tokenNormalizer";

import {
  evaluateCompetencyEvidence
} from "./competencyEvidenceWeighting";

import {
  CompetencyEvaluationResult
} from "./competencyTypes";


export function scoreCompetencies(
  text: string
): CompetencyEvaluationResult[] {

  const normalizedText =
    text.toLowerCase();


  const tokens =
    normalizeTokens(text);


  return procurementCompetencies
    .map(
      competency => {

        const matchedPatterns: string[] = [];


        const recognitionMatches =
          (
            competency.recognitionPatterns ?? []
          )
          .filter(
            pattern =>
              normalizedText.includes(
                pattern.toLowerCase()
              )
          );


        matchedPatterns.push(
          ...recognitionMatches
        );


        const semanticMatches =
          (
            competency.semanticPatterns ?? []
          )
          .filter(
            pattern => {

              const matched =
                pattern.requiredTokens.every(
                  requiredToken =>
                    tokens.includes(
                      requiredToken.toLowerCase()
                    )
                );


              if (matched) {

                matchedPatterns.push(
                  pattern.requiredTokens.join(" + ")
                );

              }


              return matched;
            }
          );


        const recognitionScore =
          Math.min(
            recognitionMatches.length / 3,
            1
          );


        const semanticScore =
          semanticMatches.length > 0
            ? Math.min(
                semanticMatches.reduce(
                  (
                    total,
                    pattern
                  ) =>
                    total + pattern.weight,
                  0
                ) / 3,
                1
              )
            : 0;


        const score =
          Math.min(
            recognitionScore + semanticScore,
            1
          );


        const evidence =
          evaluateCompetencyEvidence({
            competencyId:
              competency.id,

            baseScore:
              score,

            matchedPatterns,

            text

          });


        return {

          competency: {
            id: competency.id,

            score
          },

          evidence,

          analysis: {
            matchedPatterns
          }

        };
      }
    )
    .filter(
      result =>
        result.competency.score > 0
    );
}