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
      source: "skills_section",
      relevance: "direct",
      confidence: "high",
    });
  });

  (input.industries ?? []).forEach((industry) => {
    evidences.push({
      skill: industry,
      evidenceType: "experience",
      source: "work_experience",
      relevance: "related",
      confidence: "medium",
    });
  });

  (input.candidateCertifications ?? []).forEach((certification) => {
    evidences.push({
      skill: certification,
      evidenceType: "certification",
      source: "certifications",
      relevance: "direct",
      confidence: "high",
    });
  });

  return evidences;
}
