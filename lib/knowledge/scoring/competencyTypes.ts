/**
 * Competency evidence strength classification.
 */
export type CompetencyEvidenceStrength =
  | "weak"
  | "moderate"
  | "strong"
  | "expert";


/**
 * Competency evidence origin.
 */
export type CompetencyEvidenceType =
  | "direct"
  | "related"
  | "transferable";


/**
 * Indicators used to evaluate professional competency evidence.
 */
export type CompetencyEvidenceIndicators = {
  actionVerb: boolean;

  domainSpecific: boolean;

  responsibility: boolean;

  experience: boolean;
};


/**
 * Weighted professional competency evidence result.
 *
 * Produced by ADR-011.7.8 Competency Evidence Weighting.
 */
export type CompetencyEvidenceWeight = {
  competencyId: string;

  strengthScore: number;

  strengthLevel: CompetencyEvidenceStrength;

  confidence: number;

  evidenceType: CompetencyEvidenceType;

  matchedPatterns: string[];

  indicators: CompetencyEvidenceIndicators;
};


/**
 * Complete competency evaluation contract.
 *
 * Produced by ADR-011.8 Competency Evaluation Contract.
 *
 * Separates competency scoring from evidence analysis,
 * allowing the evaluation model to evolve without
 * continuously expanding the root object.
 */
export interface CompetencyEvaluationResult {
  competency: {
    id: string;

    score: number;
  };

  evidence: CompetencyEvidenceWeight;

  analysis: {
    matchedPatterns: string[];
  };
}