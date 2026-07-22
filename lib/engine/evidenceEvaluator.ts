import { EVIDENCE_WEIGHTS } from "./weights";
import {
  CandidateEvidence,
  EvidenceEvaluationResult
} from "./matchingTypes";

function calculateExperienceMultiplier(
  yearsOfExperience?: number
): number {
  if (!yearsOfExperience) {
    return EVIDENCE_WEIGHTS.experience.lessThanOneYear;
  }

  if (yearsOfExperience < 1) {
    return EVIDENCE_WEIGHTS.experience.lessThanOneYear;
  }

  if (yearsOfExperience < 3) {
    return EVIDENCE_WEIGHTS.experience.oneToThreeYears;
  }

  if (yearsOfExperience < 5) {
    return EVIDENCE_WEIGHTS.experience.threeToFiveYears;
  }

  return EVIDENCE_WEIGHTS.experience.moreThanFiveYears;
}

function getConfidenceMultiplier(
  confidence: CandidateEvidence["confidence"]
): number {
  switch (confidence) {
    case "high":
      return EVIDENCE_WEIGHTS.confidence.verified;

    case "medium":
      return EVIDENCE_WEIGHTS.confidence.inferred;

    case "low":
      return EVIDENCE_WEIGHTS.confidence.uncertain;

    default:
      return EVIDENCE_WEIGHTS.confidence.uncertain;
  }
}

export function evaluateEvidence(
  evidence: CandidateEvidence
): EvidenceEvaluationResult {
  const relevanceWeight =
  EVIDENCE_WEIGHTS.relevance[evidence.relevance];

  const experienceMultiplier =
    calculateExperienceMultiplier(
      evidence.yearsOfExperience
    );

  const confidenceMultiplier =
    getConfidenceMultiplier(
      evidence.confidence
    );

  const rawScore =
    relevanceWeight *
    experienceMultiplier *
    confidenceMultiplier *
    100;

  const score = Math.min(
    rawScore,
    EVIDENCE_WEIGHTS.limits.maxSingleEvidenceContribution
  );

  return {
    skill: evidence.skill,

    score: Math.round(score),

    evidenceCount: 1,

    confidence: evidence.confidence,

    explanation:
      `${evidence.relevance} evidence with ` +
      `${evidence.confidence} confidence`
  };
}