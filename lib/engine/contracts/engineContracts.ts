import type {
  MatchingResult,
} from "./matchingContracts";

import type {
  EnrichedApplication,
} from "./enrichedApplication";

import type {
  LearningContext,
} from "@/lib/engine/learning/learningIntegration.v1";

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

  hiringScore?: number;

  semanticScore?: number;
}


// ============================
// ATS DOMAIN
// ============================

export interface ATSResult {
  atsScore: number;

  keywordScore: number;

  cvStrengthScore: number;

  semanticScore: number;

  interviewProbability: number;

  offerProbability: number;

  hiringScore: number;

  passProbability: number;

  matchedSkills: string[];

  missingSkills: string[];

  recommendation: string;

  learningSignal: number;
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

  profile?: {
    professionalText?: string;
  };

  applications: CareerApplication[];

  candidateSkills: string[];

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
}


export interface OrchestratorResult {
  userId: string;

  profile?: {
    professionalText?: string;
  };

  ats: ATSResult[];

  applications: EnrichedApplication[];

  ranking: RankingResult;

  matching: MatchingResult;

  applicationInsights?: ApplicationInsightsResult;

  recommendations: unknown;

  knowledge: unknown;

  decision: DecisionOutput;

  context: LearningContext;

  summary: OrchestratorSummary;

  generatedAt: string;

  traceId?: string;
}