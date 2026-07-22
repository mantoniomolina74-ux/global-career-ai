import { CandidateEvidence } from "./matchingTypes";

export type CvEvidenceInput = {
  skills?: string[];
  industries?: string[];
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

  return evidences;
}