
/**
 * ============================================================
 * Global Career AI
 * Candidate Evidence Builder V1.0
 * ============================================================
 *
 * Builds CandidateEvidence from real persisted candidate data.
 *
 * Sources:
 * - cv_analyses.skills
 * - cv_analyses.industries
 * - real CV professional text
 * - profiles.experience_years
 *
 * Responsibilities:
 * - Convert real candidate data into CandidateEvidence.
 * - Reuse the existing evidence contract.
 * - Preserve direct and related evidence.
 * - Preserve real candidate experience years.
 * - Allow approved transferable evidence to be generated
 *   by the existing transferable evidence builder.
 *
 * Does NOT:
 * - calculate ATS
 * - calculate Matching
 * - calculate Ranking
 * - persist data
 * - create transferable relationships
 * - invent certifications
 * ============================================================
 */

import type { CandidateEvidence } from "@/lib/engine/matchingTypes";

import {
  buildCandidateEvidence,
} from "@/lib/engine/evidenceAdapter";

import {
  buildTransferableEvidence,
} from "@/lib/engine/matchingTransferableEvidence";

export type CandidateEvidenceBuilderInput = {
  candidateSkills?: string[];
  candidateIndustries?: string[];
  professionalText?: string;
  candidateCertifications?: string[];
  jobText?: string;
  experienceYears?: number | null;
};

function normalizeValues(
  values: string[] | undefined
): string[] {
  return (values ?? [])
    .map((value) => value.trim())
    .filter(Boolean);
}

function uniqueEvidence(
  evidence: CandidateEvidence[]
): CandidateEvidence[] {
  const seen = new Set<string>();

  return evidence.filter((item) => {
    const key = [
      item.skill.trim().toLowerCase(),
      item.evidenceType,
      item.evidenceLevel,
      item.source,
      item.relevance,
      item.transferableStrength ?? "",
      item.yearsOfExperience ?? "",
      item.role ?? "",
      item.industry ?? "",
      item.traceability?.recordId ?? "",
      item.traceability?.documentId ?? "",
      item.traceability?.section ?? "",
      item.traceability?.page ?? "",
      item.traceability?.excerpt ?? "",
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function buildCandidateEvidenceForJob(
  input: CandidateEvidenceBuilderInput
): CandidateEvidence[] {
  const candidateSkills = normalizeValues(
    input.candidateSkills
  );

  const candidateIndustries = normalizeValues(
    input.candidateIndustries
  );

  const candidateCertifications = normalizeValues(
    input.candidateCertifications
  );

  const professionalText =
    input.professionalText?.trim() ?? "";

  const jobText =
    input.jobText?.trim() ?? "";

  const directEvidence = buildCandidateEvidence({
    skills: candidateSkills,
    industries: candidateIndustries,
    candidateCertifications,
  });

  const experienceEvidence: CandidateEvidence[] =
    typeof input.experienceYears === "number" &&
    Number.isFinite(input.experienceYears) &&
    input.experienceYears >= 0
      ? [
          {
            skill: "professional experience",
            evidenceType: "experience",
            evidenceLevel: "declared",
            source: "other",
            relevance: "related",
            confidence: "medium",
            yearsOfExperience: input.experienceYears,
            details:
              "Persisted profile experience_years. " +
              "General professional experience; not linked " +
              "to a specific role, industry or skill.",
          },
        ]
      : [];

  const transferableEvidence = buildTransferableEvidence({
    candidateSkills,
    professionalText,
    jobText,
  });

  return uniqueEvidence([
    ...directEvidence,
    ...experienceEvidence,
    ...transferableEvidence,
  ]);
}
