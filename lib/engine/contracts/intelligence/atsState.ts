/**
 * ============================================================
 * Global Career AI
 * ATS State Contract V1.1
 * ============================================================
 *
 * Domain contract representing ATS intelligence state.
 *
 * This contract belongs to the Intelligence Core.
 * It does not belong to Dashboard.
 *
 * No business logic.
 * No persistence.
 * ============================================================
 */

export interface ATSState {
  score: number;

  keywordScore: number;

  semanticScore: number;

  hiringScore: number;

  matchedSkills: string[];

  missingSkills: string[];

  recommendation: string;

  confidence: number;
}