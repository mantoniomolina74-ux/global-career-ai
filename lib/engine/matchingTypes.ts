export type EvidenceType =
  | "experience"
  | "project"
  | "certification"
  | "skill"
  | "education"
  | "course"
  | "keyword";

export type EvidenceSource =
  | "work_experience"
  | "projects"
  | "certifications"
  | "skills_section"
  | "education_section"
  | "courses_section"
  | "other";

export type EvidenceConfidence =
  | "high"
  | "medium"
  | "low";

export type EvidenceRelevance =
  | "direct"
  | "related"
  | "transferable"
  | "irrelevant";

export type CandidateEvidence = {
  skill: string;

  evidenceType: EvidenceType;

  source: EvidenceSource;

  relevance: EvidenceRelevance;

  details?: string;

  yearsOfExperience?: number;

  role?: string;

  industry?: string;

  confidence: EvidenceConfidence;
};

export type SkillEvidenceProfile = {
  skill: string;

  evidences: CandidateEvidence[];
};

export type EvidenceEvaluationResult = {
  skill: string;

  score: number;

  evidenceCount: number;

  confidence: EvidenceConfidence;

  explanation: string;
};

export type EvidenceAccumulationResult = {
  skill: string;

  totalScore: number;

  evidenceCount: number;

  contributingEvidence: number;

  explanation: string;

  transparency: EvidenceTransparency;
};

export type EvidenceTransparency = {
  relevanceBreakdown: {
    direct: number;
    related: number;
    transferable: number;
    irrelevant: number;
  };

  confidenceBreakdown: {
    high: number;
    medium: number;
    low: number;
  };

  sourceBreakdown: Partial<Record<EvidenceSource, number>>;

  evidenceTypeBreakdown: Partial<Record<EvidenceType, number>>;
};

/**
 * Overall evidence quality classification.
 */
export type EvidenceStrength =
  | "low"
  | "medium"
  | "high";

/**
 * Aggregated analytics produced by the Evidence Analytics Layer.
 *
 * This structure summarizes the overall quality of the evidence collected
 * during a matching evaluation without affecting the official match_score.
 *
 * Generated in Shadow Mode for monitoring, validation and future
 * adaptive calibration.
 */
export type EvidenceAnalyticsResult = {
  /**
   * Total number of skills evaluated.
   */
  totalSkillsEvaluated: number;

  /**
   * Total number of evidence items collected.
   */
  totalEvidenceItems: number;

  /**
   * Average evidence score across all evaluated skills.
   * Range: 0–100.
   */
  averageEvidenceScore: number;

  /**
   * Percentage of required skills supported by evidence.
   * Range: 0–100.
   */
  evidenceCoverage: number;

  /**
   * Overall confidence of the evaluation.
   * Range: 0–100.
   */
  confidenceScore: number;

  /**
   * Percentage of uncovered requirements.
   * Range: 0–100.
   */
  evidenceGap: number;

  /**
   * Skills with the strongest evidence.
   */
  strongestSkills: string[];

  /**
   * Skills with the weakest evidence.
   */
  weakestSkills: string[];

  /**
   * Required skills that have no supporting evidence.
   */
  missingEvidence: string[];

  /**
   * Overall evidence quality classification.
   */
  evidenceStrength: EvidenceStrength;
};

