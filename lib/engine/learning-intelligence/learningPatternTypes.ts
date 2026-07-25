/**
 * ============================================================
 * Global Career AI
 * ADR-014.2
 * Learning Pattern Types
 * ============================================================
 */

import { LearningSignal } from "./learningIntelligenceTypes";

/**
 * High-level pattern categories detected
 * from learning signals.
 */
export type LearningPatternType =
  | "SUCCESS_PATTERN"
  | "FAILURE_PATTERN"
  | "SKILL_GAP"
  | "IMPROVEMENT"
  | "REGRESSION";

/**
 * Pattern confidence.
 */
export type LearningPatternConfidence =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

/**
 * Canonical Learning Pattern.
 */
export interface LearningPattern {
  id: string;

  type: LearningPatternType;

  description: string;

  confidence: number;

  confidenceLevel: LearningPatternConfidence;

  signals: LearningSignal[];

  createdAt: Date;
}