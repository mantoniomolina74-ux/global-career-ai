/**
 * ============================================================
 * Global Career AI
 * Matching State Contract V1.1
 * ============================================================
 *
 * Domain contract representing Matching intelligence state.
 *
 * This contract belongs to the Intelligence Core.
 * It does not belong to Dashboard.
 *
 * No business logic.
 * No persistence.
 * ============================================================
 */

export interface MatchingState {
  score: number;

  confidence: number;

  strengths: string[];

  weaknesses: string[];

  evidence: string[];

  recommendations: string[];
}