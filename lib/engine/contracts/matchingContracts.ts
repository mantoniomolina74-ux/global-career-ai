/**
 * ============================================================
 * Global Career AI
 * Matching Contracts V1.2
 * ============================================================
 *
 * Contracts representing Matching Engine output.
 *
 * These contracts belong to the engine layer.
 * They are transformed into domain intelligence state
 * through MatchingStateAdapter.
 *
 * No dashboard logic.
 * No persistence.
 * ============================================================
 */

import type {
  JobIntelligence,
} from "./intelligence/jobIntelligence";


export interface MatchingExplanation {
  matched_skills: string[];

  matched_industries: string[];

  certifications: {
    whmis?: boolean;

    csts?: boolean;

    first_aid?: boolean;
  };
}


export interface MatchingResultItem {
  id: string;

  title?: string;

  description?: string;

  industry?: string;

  country?: string;

  category?: string;

  tags?: string;

  /**
   * Structured intelligence derived from the real job.
   *
   * Preserved as job evidence/context for the
   * Intelligence Core.
   *
   * Does not affect match_score.
   */
  jobIntelligence?: JobIntelligence;

  match_score: number;

  evidence_analysis: unknown;

  match_reasons: string[];

  match_explanation: MatchingExplanation;
}


export interface MatchingResult {
  items: MatchingResultItem[];
}