import {
  CompetencyEvidenceWeight,
  CompetencyEvidenceStrength,
  CompetencyEvidenceType,
  CompetencyEvidenceIndicators
} from "./competencyTypes";


export type CompetencyEvidenceInput = {
  competencyId: string;

  baseScore: number;

  matchedPatterns: string[];

  text: string;
};


function calculateStrengthLevel(
  score: number
): CompetencyEvidenceStrength {

  if (score >= 0.85) {
    return "expert";
  }

  if (score >= 0.70) {
    return "strong";
  }

  if (score >= 0.45) {
    return "moderate";
  }

  return "weak";
}


function detectIndicators(
  text: string
): CompetencyEvidenceIndicators {

  const normalized =
    text.toLowerCase();


  return {

    actionVerb:
      /(managed|led|created|implemented|negotiated|optimized|coordinated)/
        .test(normalized),


    domainSpecific:
      /(supplier|vendor|purchase|procurement|contract|cost)/
        .test(normalized),


    responsibility:
      /(managed|led|owned|responsible|oversaw)/
        .test(normalized),


    experience:
      /\b\d+\s+(year|years)\b/
        .test(normalized)

  };

}


function calculateEvidenceStrength(
  baseScore: number,

  indicators: CompetencyEvidenceIndicators
): number {

  let score =
    baseScore * 0.50;


  if (indicators.actionVerb) {
    score += 0.15;
  }


  if (indicators.domainSpecific) {
    score += 0.15;
  }


  if (indicators.responsibility) {
    score += 0.10;
  }


  if (indicators.experience) {
    score += 0.10;
  }


  return Math.min(
    Number(score.toFixed(2)),
    1
  );

}


function determineEvidenceType(
  score: number
): CompetencyEvidenceType {

  if (score >= 0.70) {
    return "direct";
  }


  if (score >= 0.45) {
    return "related";
  }


  return "transferable";

}


export function evaluateCompetencyEvidence(
  input: CompetencyEvidenceInput
): CompetencyEvidenceWeight {


  const indicators =
    detectIndicators(
      input.text
    );


  const strengthScore =
    calculateEvidenceStrength(
      input.baseScore,
      indicators
    );


  return {

    competencyId:
      input.competencyId,


    strengthScore,


    strengthLevel:
      calculateStrengthLevel(
        strengthScore
      ),


    confidence:
      strengthScore,


    evidenceType:
      determineEvidenceType(
        strengthScore
      ),


    matchedPatterns:
      input.matchedPatterns,


    indicators

  };

}