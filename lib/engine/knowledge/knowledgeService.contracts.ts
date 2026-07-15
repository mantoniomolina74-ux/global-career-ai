/**
 * ============================================================
 * Global Career AI
 * Knowledge Service
 * Public Contracts
 * ------------------------------------------------------------
 * Public contracts exposed to the Application Layer.
 *
 * These contracts intentionally hide the internal
 * Knowledge Layer implementation.
 * ============================================================
 */

export interface CareerKnowledgeInsights {
  totalMatches: number;

  averageConfidence: number;

  topSkills: string[];

  industries: string[];

  countries: string[];

  recommendationsFound: boolean;
}

export interface SimilarProfile {
  applicationId: string;

  similarity: number;

  confidence: number;
}

export interface KnowledgeHealth {
  totalEntries: number;

  averageConfidence: number;

  averageScore: number;

  lastUpdated?: Date;
}