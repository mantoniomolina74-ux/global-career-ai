/**
 * ============================================================
 * Global Career AI
 * Experience Intelligence Contract V1.0
 * ============================================================
 *
 * Domain contract representing professional experience
 * intelligence evaluated against a real job opportunity.
 *
 * This contract belongs to the Intelligence Core.
 * It does not belong to Dashboard.
 *
 * No business logic.
 * No persistence.
 * No generated experience evidence.
 * ============================================================
 */

export type ExperienceMatchType =
  | "DIRECT"
  | "TRANSFERABLE"
  | "GAP";

export interface ExperienceEvidence {
  /**
   * Evidence supporting the experience assessment.
   */
  text: string;

  /**
   * Origin of the evidence.
   */
  source: string;
}

export interface ExperienceRequirement {
  /**
   * Requirement extracted from the real job.
   */
  requirement: string;

  /**
   * Minimum years required, when explicitly available.
   */
  requiredYears?: number;

  /**
   * Whether the requirement was explicitly stated
   * by the real job.
   */
  explicit: boolean;

  /**
   * Evidence from the real job supporting the requirement.
   */
  evidence: ExperienceEvidence[];
}

export interface CandidateExperience {
  /**
   * Professional experience area or role.
   */
  area: string;

  /**
   * Years of experience in this area, when available.
   */
  years?: number;

  /**
   * Evidence supporting the candidate experience.
   */
  evidence: ExperienceEvidence[];
}

export interface ExperienceAssessment {
  /**
   * Job experience requirement being evaluated.
   */
  requirement: string;

  /**
   * Candidate-side experience considered for the requirement.
   */
  candidateExperience: string[];

  /**
   * Relationship between the requirement and candidate experience.
   */
  matchType: ExperienceMatchType;

  /**
   * Evidence supporting the assessment.
   */
  evidence: ExperienceEvidence[];
}

export interface ExperienceIntelligence {
  /**
   * Real job identifier.
   */
  jobId: string;

  /**
   * Real job title.
   */
  jobTitle: string;

  /**
   * Experience requirements identified from the real job.
   */
  requirements: ExperienceRequirement[];

  /**
   * Candidate professional experience used in the evaluation.
   */
  candidateExperience: CandidateExperience[];

  /**
   * Direct experience matches.
   */
  directExperience: ExperienceAssessment[];

  /**
   * Transferable experience matches.
   */
  transferableExperience: ExperienceAssessment[];

  /**
   * Identified experience gaps.
   */
  experienceGaps: ExperienceAssessment[];

  /**
   * Overall experience coverage percentage.
   *
   * This value represents evaluated experience coverage;
   * it is not an ATS score.
   */
  coverage: number;

  /**
   * Confidence in the available experience evidence.
   */
  confidence: number;
}