/**
 * ADR-013.5
 * Knowledge Gap Analysis & Learning Recommendations
 */

/**
 * Knowledge proficiency level.
 */
export type KnowledgeLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

/**
 * Strong knowledge domain.
 */
export interface KnowledgeStrength {
  domainId: string;
  domainName: string;
  score: number;
  level: KnowledgeLevel;
}

/**
 * Weak knowledge domain.
 */
export interface KnowledgeWeakness {
  domainId: string;
  domainName: string;
  score: number;
  level: KnowledgeLevel;
}

/**
 * Missing or underdeveloped competency.
 */
export interface KnowledgeGap {
  competencyId: string;
  competencyName: string;

  domainId: string;

  importance: number;

  currentScore: number;

  targetScore: number;

  gapScore: number;
}

/**
 * Learning priority ranking.
 */
export interface LearningPriority {
  competencyId: string;

  priorityScore: number;

  estimatedImpact: number;
}

/**
 * Personalized recommendation.
 */
export interface LearningRecommendation {
  id: string;

  title: string;

  description: string;

  competencyIds: string[];

  domainIds: string[];

  estimatedScoreImprovement: number;

  priority: number;
}

/**
 * Overall improvement estimation.
 */
export interface KnowledgeImprovementEstimate {
  currentScore: number;

  projectedScore: number;

  improvement: number;
}

/**
 * Complete knowledge gap analysis result.
 */
export interface KnowledgeGapResult {
  strengths: KnowledgeStrength[];

  weaknesses: KnowledgeWeakness[];

  gaps: KnowledgeGap[];

  priorities: LearningPriority[];

  recommendations: LearningRecommendation[];

  improvement: KnowledgeImprovementEstimate;
}