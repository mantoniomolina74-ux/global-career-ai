import type { CandidateEvidence } from "@/lib/engine/matchingTypes";
import type { JobIntelligenceRequirement } from "@/lib/engine/contracts/intelligence/jobIntelligence";

/**
 * ============================================================
 * Global Career AI
 * Talent Intelligence Contract V1.0
 * ============================================================
 *
 * Organizational intelligence derived from real candidate
 * supply and real job demand.
 *
 * Responsibilities:
 * - Represent aggregated talent supply.
 * - Represent aggregated job demand.
 * - Represent observable talent gaps.
 * - Preserve traceability to existing CandidateEvidence
 *   and JobIntelligenceRequirement structures.
 *
 * Does NOT:
 * - calculate ATS scores
 * - calculate Matching scores
 * - calculate Ranking
 * - create candidate scores
 * - create market scores
 * - calculate hiring probability
 * - invent candidate or job data
 *
 * ============================================================
 */

/**
 * Talent supply evidence distribution for one capability.
 */
export type TalentSupplyEvidenceBreakdown = {
  direct: number;
  related: number;
  transferable: number;
  irrelevant: number;
};

/**
 * Confidence distribution for the evidence supporting
 * a capability across the candidate population.
 */
export type TalentSupplyConfidenceBreakdown = {
  high: number;
  medium: number;
  low: number;
};

/**
 * Aggregated supply for one capability.
 *
 * A candidate is counted at the population level only through
 * real persisted CandidateEvidence.
 */
export type TalentSupplyCapability = {
  capability: string;

  candidateCount: number;

  directCandidateCount: number;

  transferableCandidateCount: number;

  evidenceCount: number;

  evidence: TalentSupplyEvidenceBreakdown;

  confidence: TalentSupplyConfidenceBreakdown;

  industries: string[];

  roles: string[];
};

/**
 * Aggregated talent supply.
 */
export type TalentSupplyIntelligence = {
  candidatesAnalyzed: number;

  capabilities: TalentSupplyCapability[];
};

/**
 * Aggregated demand for one capability.
 *
 * Demand originates from real Job Intelligence requirements.
 */
export type TalentDemandCapability = {
  capability: string;

  category: JobIntelligenceRequirement["category"];

  jobCount: number;

  requirementCount: number;

  companies: string[];

  countries: string[];
};

/**
 * Aggregated talent demand.
 */
export type TalentDemandIntelligence = {
  jobsAnalyzed: number;

  capabilities: TalentDemandCapability[];
};

/**
 * Classification of an observable talent gap.
 */
export type TalentGapType =
  | "LOW_SUPPLY"
  | "NO_DIRECT_SUPPLY"
  | "TRANSFERABLE_SUPPLY"
  | "BALANCED";

/**
 * Supply/demand relationship for one capability.
 */
export type TalentGap = {
  capability: string;

  category: JobIntelligenceRequirement["category"];

  demandCount: number;

  supplyCandidateCount: number;

  directSupplyCount: number;

  transferableSupplyCount: number;

  gapType: TalentGapType;
};

/**
 * Aggregated talent gap intelligence.
 */
export type TalentGapIntelligence = {
  gaps: TalentGap[];
};

/**
 * Scope of the Talent Intelligence analysis.
 */
export type TalentIntelligenceScope = {
  organizationId: string;

  generatedAt: string;
};

/**
 * Complete Talent Intelligence V1.0 contract.
 *
 * This is an analytical contract only.
 * It does not persist or calculate intelligence by itself.
 */
export type TalentIntelligence = {
  scope: TalentIntelligenceScope;

  supply: TalentSupplyIntelligence;

  demand: TalentDemandIntelligence;

  gaps: TalentGapIntelligence;
};

/**
 * Traceability structure used when a future implementation
 * needs to explain how a Talent Intelligence result was derived.
 */
export type TalentIntelligenceTrace = {
  capability: string;

  candidateEvidence: CandidateEvidence[];

  jobRequirements: JobIntelligenceRequirement[];
};