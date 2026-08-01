/**
 * ============================================================
 * Competency State Contract (V1.1)
 * ============================================================
 * Domain contract representing the competency intelligence
 * inside CareerState.
 *
 * Source:
 * Knowledge Intelligence → CompetencyProfile
 * ============================================================
 */

export interface CompetencyState {
  overallScore: number;

  competencies: {
    id: string;
    score: number;
    matchedPatterns: string[];
  }[];

  strengths: string[];

  gaps: string[];

  confidence: number;
}