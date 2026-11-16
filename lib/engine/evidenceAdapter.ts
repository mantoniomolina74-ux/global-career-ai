
import { CandidateEvidence } from "./matchingTypes";

export type CvEvidenceInput = {
  skills?: string[];
  industries?: string[];
  candidateCertifications?: string[];
};

export function buildCandidateEvidence(
  input: CvEvidenceInput
): CandidateEvidence[] {
  const evidences: CandidateEvidence[] = [];

  (input.skills ?? []).forEach((skill) => {
    evidences.push({
      skill,
      evidenceType: "skill",
      evidenceLevel: "declared",
      source: "skills_section",
      relevance: "direct",
      confidence: "medium",
    });
  });

  (input.industries ?? []).forEach((industry) => {
    evidences.push({
      skill: industry,
      evidenceType: "experience",
      evidenceLevel: "declared",
      source: "other",
      relevance: "related",
      confidence: "low",
    });
  });

  (input.candidateCertifications ?? []).forEach((certification) => {
    evidences.push({
      skill: certification,
      evidenceType: "certification",
      evidenceLevel: "declared",
      source: "certifications",
      relevance: "direct",
      confidence: "medium",
    });
  });

  return evidences;
}
