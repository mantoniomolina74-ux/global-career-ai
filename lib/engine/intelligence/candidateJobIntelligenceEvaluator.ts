/**
 * ============================================================
 * Global Career AI
 * Candidate ↔ Job Intelligence Evaluator V1.0
 * ============================================================
 *
 * Evaluates real candidate evidence against real Job
 * Intelligence requirements.
 *
 * Responsibilities:
 * - Evaluate each job requirement.
 * - Reuse existing CandidateEvidence.
 * - Distinguish direct, transferable, partial and missing
 *   evidence.
 * - Evaluate structured experience evidence against
 *   explicit experience requirements.
 * - Produce the Candidate ↔ Job Intelligence contract.
 *
 * Does NOT:
 * - calculate ATS
 * - calculate Matching
 * - calculate Ranking
 * - persist data
 * - create transferable relationships
 * - modify existing engine weights
 * ============================================================
 */

import type { CandidateEvidence } from "@/lib/engine/matchingTypes";

import type {
  CandidateJobIntelligence,
  CandidateJobRequirementEvaluation,
  CandidateRequirementMatch,
} from "@/lib/engine/contracts/intelligence/candidateJobIntelligence";

import type {
  JobIntelligence,
  JobIntelligenceRequirement,
} from "@/lib/engine/contracts/intelligence/jobIntelligence";

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function conceptMatches(
  candidateValue: string,
  requirementValue: string
): boolean {
  const candidate = normalize(candidateValue);
  const requirement = normalize(requirementValue);

  if (!candidate || !requirement) {
    return false;
  }

  if (candidate === requirement) {
    return true;
  }

  const candidateWords = candidate.split(/\s+/);
  const requirementWords = requirement.split(/\s+/);

  if (
    requirementWords.every((word) =>
      candidateWords.includes(word)
    )
  ) {
    return true;
  }

  return (
    candidate.includes(` ${requirement} `) ||
    requirement.includes(` ${candidate} `)
  );
}

/**
 * Extracts the highest explicit years requirement from the
 * requirement context.
 *
 * Examples:
 * - "8+ years" -> 8
 * - "3+ years" -> 3
 * - "10+ years" -> 10
 */
function extractRequiredYears(
  requirement: JobIntelligenceRequirement
): number | null {
  const context = normalize(requirement.evidence);

  if (!context) {
    return null;
  }

  const matches = Array.from(
    context.matchAll(
      /\b(\d+)\s*\+?\s*years?\b/g
    )
  );

  if (matches.length === 0) {
    return null;
  }

  const years = matches
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value));

  if (years.length === 0) {
    return null;
  }

  return Math.max(...years);
}

/**
 * Evaluates an EXPERIENCE requirement using the candidate's
 * real structured years of experience.
 *
 * Important:
 * - Meeting the explicit years requirement is DIRECT evidence.
 * - Having real experience but falling below the explicit
 *   minimum remains PARTIAL.
 * - If the minimum cannot be determined, real experience
 *   remains PARTIAL until the requirement can be verified.
 * - No structured experience evidence remains NO_EVIDENCE.
 */
function evaluateExperienceEvidence(
  requirement: JobIntelligenceRequirement,
  evidence: CandidateEvidence[]
): CandidateRequirementMatch {
  const experienceEvidence = evidence.filter(
    (item) =>
      item.evidenceType === "experience" &&
      typeof item.yearsOfExperience === "number" &&
      Number.isFinite(item.yearsOfExperience)
  );

  if (experienceEvidence.length === 0) {
    return "NO_EVIDENCE";
  }

  const candidateYears = Math.max(
    ...experienceEvidence.map(
      (item) => item.yearsOfExperience ?? 0
    )
  );

  const requiredYears = extractRequiredYears(requirement);

  if (requiredYears === null) {
    return "PARTIAL";
  }

  if (candidateYears >= requiredYears) {
    return "DIRECT";
  }

  return "PARTIAL";
}

function evaluateEvidence(
  requirement: JobIntelligenceRequirement,
  evidence: CandidateEvidence[]
): CandidateRequirementMatch {
  if (requirement.category === "EXPERIENCE") {
    return evaluateExperienceEvidence(
      requirement,
      evidence
    );
  }

  const directEvidence = evidence.some(
    (item) =>
      item.relevance === "direct" &&
      conceptMatches(item.skill, requirement.name)
  );

  if (directEvidence) {
    return "DIRECT";
  }

  const transferableEvidence = evidence.some(
    (item) =>
      item.relevance === "transferable" &&
      conceptMatches(item.skill, requirement.name)
  );

  if (transferableEvidence) {
    return "TRANSFERABLE";
  }

  const relatedEvidence = evidence.some(
    (item) =>
      item.relevance === "related" &&
      conceptMatches(item.skill, requirement.name)
  );

  if (relatedEvidence) {
    return "PARTIAL";
  }

  return "NO_EVIDENCE";
}

function collectEvidence(
  requirement: JobIntelligenceRequirement,
  evidence: CandidateEvidence[]
): CandidateEvidence[] {
  if (requirement.category === "EXPERIENCE") {
    return evidence.filter(
      (item) =>
        item.evidenceType === "experience" &&
        typeof item.yearsOfExperience === "number" &&
        Number.isFinite(item.yearsOfExperience)
    );
  }

  return evidence.filter((item) => {
    if (
      item.relevance === "direct" ||
      item.relevance === "related" ||
      item.relevance === "transferable"
    ) {
      return conceptMatches(
        item.skill,
        requirement.name
      );
    }

    return false;
  });
}

function evaluateRequirement(
  requirement: JobIntelligenceRequirement,
  evidence: CandidateEvidence[]
): CandidateJobRequirementEvaluation {
  const matchingEvidence = collectEvidence(
    requirement,
    evidence
  );

  return {
    requirement,
    match: evaluateEvidence(
      requirement,
      matchingEvidence
    ),
    evidence: matchingEvidence,
  };
}

export function evaluateCandidateJobIntelligence(
  candidateId: string,
  job: JobIntelligence,
  candidateEvidence: CandidateEvidence[]
): CandidateJobIntelligence {
  const evaluations = job.requirements.map(
    (requirement) =>
      evaluateRequirement(
        requirement,
        candidateEvidence
      )
  );

  return {
    candidateId,
    jobId: job.id,
    job,
    evaluations,
    matchedRequirements: evaluations.filter(
      (item) => item.match === "DIRECT"
    ).length,
    transferableRequirements: evaluations.filter(
      (item) => item.match === "TRANSFERABLE"
    ).length,
    partialRequirements: evaluations.filter(
      (item) => item.match === "PARTIAL"
    ).length,
    missingRequirements: evaluations.filter(
      (item) => item.match === "NO_EVIDENCE"
    ).length,
  };
}