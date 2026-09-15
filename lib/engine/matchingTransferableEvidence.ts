
/**
 * ============================================================
 * Global Career AI
 * Matching Transferable Evidence V1.0
 * ============================================================
 *
 * Discovers transferable candidate evidence for Premium Matching.
 *
 * Responsibilities:
 * - Compare approved transferable relations against job text.
 * - Verify the source signal exists in candidate skills or
 *   professional CV text.
 * - Produce CandidateEvidence with transferable relevance.
 *
 * Does NOT:
 * - calculate match_score
 * - modify ATS
 * - modify Matching weights
 * - persist data
 * - create new transferable relationships
 * ============================================================
 */

import type {
  CandidateEvidence,
} from "./matchingTypes";

import {
  MATCHING_TRANSFERABLE_RELATIONS,
} from "./matchingTransferableRelations";

import {
  normalizeText,
} from "./matchingConcepts";

export type TransferableEvidenceInput = {
  candidateSkills?: string[];
  professionalText?: string;
  jobText?: string;
};

function containsConcept(
  text: string,
  concept: string
): boolean {
  const normalizedText = normalizeText(text);
  const normalizedConcept = normalizeText(concept);

  if (!normalizedText || !normalizedConcept) {
    return false;
  }

  const words = normalizedText.split(/\s+/);

  if (words.includes(normalizedConcept)) {
    return true;
  }

  return normalizedText.includes(
    ` ${normalizedConcept} `
  );
}

function getConfidence(
  source: "skills" | "professionalText"
): "high" | "medium" {
  return source === "skills" ? "high" : "medium";
}

export function buildTransferableEvidence(
  input: TransferableEvidenceInput
): CandidateEvidence[] {
  const evidences: CandidateEvidence[] = [];

  const candidateSkills = input.candidateSkills ?? [];
  const professionalText = input.professionalText ?? "";
  const jobText = input.jobText ?? "";

  if (!jobText.trim()) {
    return evidences;
  }

  MATCHING_TRANSFERABLE_RELATIONS.forEach((relation) => {
    if (!containsConcept(jobText, relation.target)) {
      return;
    }

    const skillMatch = candidateSkills.find((skill) =>
      containsConcept(skill, relation.source)
    );

    if (skillMatch) {
      evidences.push({
        skill: relation.target,
        evidenceType: "skill",
        source: "skills_section",
        relevance: "transferable",
        transferableStrength: relation.strength,
        confidence: getConfidence("skills"),
        details:
          `${skillMatch} transferable to ${relation.target} ` +
          `(${relation.strength})`,
      });

      return;
    }

    if (containsConcept(professionalText, relation.source)) {
      evidences.push({
        skill: relation.target,
        evidenceType: "experience",
        source: "work_experience",
        relevance: "transferable",
        transferableStrength: relation.strength,
        confidence: getConfidence("professionalText"),
        details:
          `${relation.source} evidence transferable to ` +
          `${relation.target} (${relation.strength})`,
      });
    }
  });

  return evidences;
}
