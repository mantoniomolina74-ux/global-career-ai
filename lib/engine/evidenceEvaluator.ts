
import { EVIDENCE_WEIGHTS } from "./weights";
import {
  CandidateEvidence,
  EvidenceEvaluationResult
} from "./matchingTypes";

function calculateExperienceMultiplier(
  yearsOfExperience?: number
): number {
  if (yearsOfExperience === undefined) {
    return 1.0;
  }

  if (yearsOfExperience <= 0) {
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

function getEvidenceLevelMultiplier(
  evidence: CandidateEvidence
): number {
  switch (evidence.evidenceLevel) {
    case "declared":
      return 0.40;

    case "experience_backed":
      return 0.75;

    case "demonstrated":
      return 1.00;

    default:
      return 0.40;
  }
}

function hasContextualProfessionalExperience(
  evidence: CandidateEvidence
): boolean {
  return (
    evidence.evidenceLevel !== "declared" &&
    evidence.evidenceType === "experience" &&
    evidence.source === "work_experience" &&
    Boolean(
      evidence.role ||
      evidence.traceability?.role
    )
  );
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

function getRelevanceWeight(
  evidence: CandidateEvidence
): number {
  if (
    evidence.relevance === "transferable" &&
    evidence.transferableStrength
  ) {
    return evidence.transferableStrength === "strong"
      ? 0.70
      : 0.35;
  }

  return EVIDENCE_WEIGHTS.relevance[evidence.relevance];
}

export function evaluateEvidence(
  evidence: CandidateEvidence
): EvidenceEvaluationResult {
  const relevanceWeight =
    getRelevanceWeight(evidence);

  const evidenceLevelMultiplier =
    getEvidenceLevelMultiplier(evidence);

  const hasContextualExperience =
    hasContextualProfessionalExperience(evidence);

  const experienceMultiplier =
    hasContextualExperience
      ? calculateExperienceMultiplier(
          evidence.yearsOfExperience
        )
      : 1.0;

  const confidenceMultiplier =
    getConfidenceMultiplier(
      evidence.confidence
    );

  const rawScore =
    relevanceWeight *
    evidenceLevelMultiplier *
    experienceMultiplier *
    confidenceMultiplier *
    100;

  const score = Math.min(
    rawScore,
    EVIDENCE_WEIGHTS.limits.maxSingleEvidenceContribution
  );

  return {
    skill: evidence.skill,

    score: Math.round(
      score + Number.EPSILON * Math.abs(score)
    ),

    evidenceCount: 1,

    confidence: evidence.confidence,

    explanation:
      `${evidence.relevance} relevance, ` +
      `${evidence.evidenceLevel} evidence, ` +
      `${evidence.confidence} confidence` +
      (
        hasContextualExperience
          ? ", contextual professional experience"
          : ""
      )
  };
}
