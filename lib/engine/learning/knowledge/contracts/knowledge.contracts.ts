/**
 * ============================================================
 * Global Career AI
 * Knowledge Layer V1
 * Domain Contracts
 * ------------------------------------------------------------
 * Single Source of Truth for the Knowledge Layer.
 *
 * This file contains only domain contracts.
 * No runtime logic should exist here.
 * ============================================================
 */

export const KNOWLEDGE_SCHEMA_VERSION = 1 as const;

/**
 * ------------------------------------------------------------
 * Shared Types
 * ------------------------------------------------------------
 */

export type KnowledgeWeights = Record<string, number>;

/**
 * ------------------------------------------------------------
 * Metadata
 * ------------------------------------------------------------
 */

export type KnowledgeMetadata = {
  id: string;
  applicationId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * ------------------------------------------------------------
 * Scores
 * ------------------------------------------------------------
 */

export type KnowledgeScores = {
  ats: number;
  ranking: number;
  decision: number;
  semantic: number;
  confidence: number;
};

/**
 * ------------------------------------------------------------
 * Learning
 * ------------------------------------------------------------
 */

export type KnowledgeLearning = {
  signals: string[];
  feedbackCount: number;
  successRate: number;
  adaptiveWeights: KnowledgeWeights;
  lastLearning?: Date;
};

/**
 * ------------------------------------------------------------
 * Semantic
 * ------------------------------------------------------------
 */

export type KnowledgeSemantic = {
  embedding: number[];
  skills: string[];
  industry?: string;
  country?: string;
 education?: string;
  experience?: string;
  languages: string[];
  tags: string[];
};

/**
 * ------------------------------------------------------------
 * Knowledge Entry
 * ------------------------------------------------------------
 */

export type KnowledgeEntry = {
  metadata: KnowledgeMetadata;
  scores: KnowledgeScores;
  learning: KnowledgeLearning;
  semantic: KnowledgeSemantic;
};

/**
 * ------------------------------------------------------------
 * Query
 * ------------------------------------------------------------
 */

export type KnowledgeQuery = {
  skills?: string[];
  industry?: string;
  country?: string;
  minimumScore?: number;
  limit?: number;
  offset?: number;
};

/**
 * ------------------------------------------------------------
 * Query Result
 * ------------------------------------------------------------
 */

export type KnowledgeResult = {
  entry: KnowledgeEntry;
  similarity?: number;
  confidence?: number;
  reason?: string;
};

/**
 * ------------------------------------------------------------
 * Statistics
 * ------------------------------------------------------------
 */

export type KnowledgeStatistics = {
  totalEntries: number;
  averageScore: number;
  averageConfidence: number;
  lastUpdated?: Date;
};