/**
 * ============================================================
 * Global Career AI
 * Candidate ↔ Job Intelligence Contract V1.0
 * ============================================================
 *
 * Contract representing the relationship between:
 *
 * - A real candidate
 * - A real job
 * - Job Intelligence requirements
 * - Candidate evidence
 *
 * This contract belongs to the Intelligence Core.
 *
 * It does not:
 * - calculate ATS
 * - calculate Matching
 * - calculate Ranking
 * - persist data
 * - create transferable relations
 * - execute engine logic
 * ============================================================
 */

import type { CandidateEvidence } from "@/lib/engine/matchingTypes";

import type {
  JobIntelligence,
  JobIntelligenceRequirement,
} from "@/lib/engine/contracts/intelligence/jobIntelligence";

/**
 * How strongly candidate evidence satisfies a job requirement.
 */
export type CandidateRequirementMatch =
  | "DIRECT"
  | "TRANSFERABLE"
  | "PARTIAL"
  | "NO_EVIDENCE";

/**
 * Evaluation of one job requirement against candidate evidence.
 */
export type CandidateJobRequirementEvaluation = {
  requirement: JobIntelligenceRequirement;
  match: CandidateRequirementMatch;
  evidence: CandidateEvidence[];
};

/**
 * Candidate ↔ Job Intelligence result.
 *
 * This is an evaluation contract only.
 */
export type CandidateJobIntelligence = {
  candidateId: string;
  jobId: string;

  job: JobIntelligence;

  evaluations: CandidateJobRequirementEvaluation[];

  matchedRequirements: number;
  transferableRequirements: number;
  partialRequirements: number;
  missingRequirements: number;
};