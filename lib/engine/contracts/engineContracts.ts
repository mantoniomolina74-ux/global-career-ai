import type {
  MatchingResult,
} from "./matchingContracts";

import type {
  EnrichedApplication,
} from "./enrichedApplication";

import type {
  LearningWeights,
} from "@/lib/engine/learning/learningWeights.bridge";

import type {
  JobIntelligence,
} from "./intelligence/jobIntelligence";

import type {
  CandidateEvidence,
} from "@/lib/engine/matchingTypes";

/**
 * ============================================================
 * Global Career AI
 * Engine Contracts (SOURCE OF TRUTH - V8.1)
 * ============================================================
 *
 * Central contracts shared across the Engine Layer.
 *
 * This file represents the official boundary between:
 * - ATS
 * - Ranking
 * - Decision
 * - Orchestration
 * - Core Engine flows
 *
 * ============================================================
 */

// ============================
// SHARED TYPES
// ============================

export interface CareerApplication {
  /**
   * ============================================================
   * APPLICATION IDENTITY
   * ============================================================
   */

  applicationId: string;

  /**
   * Real job information.
   *
   * These fields originate from the real job/application
   * and must be preserved through the Engine Layer.
   */

  title?: string;

  industry?: string;

  country?: string;

  category?: string;

    tags?: string;

  /**
   * ============================================================
   * JOB INTELLIGENCE
   * ============================================================
   *
   * Structured intelligence derived from the real job.
   */

  jobIntelligence?: JobIntelligence;

  /**
   * ============================================================
   * CANDIDATE / JOB MATCHING INPUT
   * ============================================================
   */

  candidateSkills?: string[];

  jobDescription?: string;

  /**
   * ============================================================
   * CV / ATS INPUT
   * ============================================================
   */

  cvStrengthScore?: number;

  /**
   * ============================================================
   * ATS ENRICHMENT
   * ============================================================
   */

  atsScore?: number;

  semanticScore?: number;
}


// ============================
// ATS DOMAIN
// ============================

export type ATSMatchType =
  | "direct"
  | "related"
  | "transferable"
  | "missing";


export type ATSCriticality =
  | "critical"
  | "important"
  | "supporting";

export type ATSRequirementCategory =
  | "technical"
  | "experience"
  | "education"
  | "domain"
  | "responsibility"
  | "language"
  | "certification"
  | "soft_skill";


export interface ATSRequirement {
  /**
   * Requirement as expressed or normalized from the real job.
   */
  requirement: string;

  /**
   * Functional category of the requirement.
   */
  category: ATSRequirementCategory;

  /**
   * Importance of the requirement for the opportunity.
   */
  criticality: ATSCriticality;

  /**
   * Type of evidence that should be evaluated.
   */
  evidenceRequired: string[];

  /**
   * Relevant job context in which the requirement was detected.
   */
  context: string;
}


export interface ATSEvidence {
  /**
   * Real requirement extracted from the job.
   */
  requirement: string;

  /**
   * Evidence found in the candidate's profile/CV.
   * Null when the requirement has no supporting evidence.
   */
  evidence: string | null;

  /**
   * Nature of the candidate-to-requirement relationship.
   */
  matchType: ATSMatchType;

  /**
   * Strength of the evidence, normalized to 0..1.
   */
  strength: number;

  /**
   * Confidence in the evidence evaluation, normalized to 0..1.
   */
  confidence: number;

  /**
   * Importance of the requirement for the opportunity.
   */
  criticality: ATSCriticality;
}


export interface ATSResult {
  atsScore: number;

  keywordScore: number;

  cvStrengthScore: number;

  semanticScore: number;

  matchedSkills: string[];

  missingSkills: string[];

  recommendation: string;

  /**
   * Evidence-based Premium ATS enrichment.
   *
   * Optional during the migration so existing ATS consumers
   * remain compatible while the ATS engine is upgraded.
   */
  evidence?: ATSEvidence[];
}


export interface ATSMetadata {
  engine: string;

  version: string;

  generatedAt: string;

  executionTimeMs: number;
}


export interface ATSResponse {
  data: ATSResult;

  metadata: ATSMetadata;

  success: boolean;
}


// ============================
// SCORING DOMAIN
// ============================

export interface ScoringResultItem {
  applicationId: string;

  score: number;

  breakdown: Record<string, number>;

  signals: string[];
}


export interface ScoringMetadata {
  processedAt: string;

  modelVersion: string;
}


export interface ScoringResult {
  items: ScoringResultItem[];

  metadata: ScoringMetadata;
}


// ============================
// RANKING DOMAIN
// ============================

export interface RankingResultItem {
  applicationId: string;

  finalScore: number;

  rank: number;

  delta?: number;
}


export interface RankingMetadata {
  strategy:
    | "score_desc"
    | "weighted"
    | "hybrid";

  processedAt: string;
}


export interface RankingResult {
  items: RankingResultItem[];

  metadata: RankingMetadata;
}


 // ============================
// DECISION DOMAIN
// ============================

export type DecisionType =
  | "SHORTLIST"
  | "REJECT"
  | "INTERVIEW";


export type DecisionPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";


export interface DecisionOutput {
  applicationId: string;

  decision: DecisionType;

  priority: DecisionPriority;

  score: number;

  reasoning: string[];
}


// ============================
// ORCHESTRATOR INPUT
// ============================

export interface CareerOrchestratorInput {

  userId: string;

  tenantId: string;

  /**
   * Persisted CV analysis used as candidate evidence source.
   * Optional to preserve compatibility with existing callers.
   */
  cvAnalysisId?: string;

  profile?: {
    professionalText?: string;
  };

  applications: CareerApplication[];

  /**
   * ============================================================
   * JOB INTELLIGENCE
   * ============================================================
   *
   * Structured intelligence derived from the real job.
   *
   * Optional to preserve compatibility with existing
   * orchestrator consumers during the V1.0 integration.
   */

  jobIntelligence?: JobIntelligence;

  candidateSkills: string[];

  candidateCertifications: string[];

  requiredSkills: string[];

  jobDescription: string;

  cvStrengthScore: number;

  // Knowledge Layer enrichment
  industry?: string;

  country?: string;
}


// ============================
// ORCHESTRATOR OUTPUT
// ============================

export interface OrchestratorSummary {

  totalApplications: number;

  averageATS: number;

  topScore: number;

  systemConfidence: number;
}


export interface ApplicationInsightsResult {

  funnel: {

    conversionRate: number;

    offerRate: number;

    successRate: number;
  };

  performance: {

    totalApplications: number;

    activePipeline: number;

    responseRate: number;

    rejectionRate: number;
  };

  statusBreakdown: Record<string, number>;

  applicationScores: Record<number, number>;

  applicationIntelligence: Record<
    number,
    {
      atsScore: number | null;
      riskLevel: "low" | "medium" | "high" | null;
      matchedSkills: string[];
      missingSkills: string[];
    }
  >;

  meta: {
    generatedAt: string;
    source: string;
  };
}


export interface OrchestratorResult {
  userId: string;

    candidateCertificationCount: number;

  /**
   * Structured candidate evidence with source traceability.
   */
  candidateEvidence?: CandidateEvidence[];

  profile?: {
    professionalText?: string;
  };

  ats: ATSResult[];

  applications: EnrichedApplication[];

  ranking: RankingResult;

  matching: MatchingResult;

  applicationInsights?: ApplicationInsightsResult;

  recommendations: unknown;

  decision: DecisionOutput;

  context: LearningWeights;

  summary: OrchestratorSummary;

  generatedAt: string;

  traceId?: string;
}