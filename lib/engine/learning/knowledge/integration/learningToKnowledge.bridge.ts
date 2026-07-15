/**
 * ============================================================
 * Global Career AI
 * 8C.12 — Learning → Knowledge Bridge
 * ============================================================
 */

import type {
  KnowledgeEntry,
  KnowledgeMetadata,
  KnowledgeScores,
  KnowledgeSemantic,
  KnowledgeLearning,
} from "../contracts/knowledge.contracts";

import { KnowledgeEngine } from "../knowledgeEngine";

/**
 * Learning signal input
 */
export type LearningSignalInput = {
  applicationId: string;
  skills: string[];
  industry?: string;
  country?: string;
  success: boolean;
  confidence: number;
  embedding: number[];
  timestamp: Date;
};

/**
 * Convert Learning → KnowledgeEntry
 */
function toKnowledgeEntry(signal: LearningSignalInput): KnowledgeEntry {
  const now = new Date();

  const metadata: KnowledgeMetadata = {
    id: `${signal.applicationId}-${now.getTime()}`,
    applicationId: signal.applicationId,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  const scores: KnowledgeScores = {
    ats: signal.confidence,
    ranking: signal.confidence,
    decision: signal.confidence,
    semantic: signal.confidence,
    confidence: signal.confidence,
  };

  const learning: KnowledgeLearning = {
    signals: [signal.success ? "SUCCESS" : "FAIL"],
    feedbackCount: 1,
    successRate: signal.success ? 1 : 0,
    adaptiveWeights: {},
    lastLearning: now,
  };

  const semantic: KnowledgeSemantic = {
    embedding: signal.embedding,
    skills: signal.skills,
    industry: signal.industry,
    country: signal.country,
    languages: [],
    tags: [],
  };

  return {
    metadata,
    scores,
    learning,
    semantic,
  };
}

/**
 * Bridge Class
 */
export class LearningToKnowledgeBridge {
  constructor(private readonly knowledge: KnowledgeEngine) {}

  ingest(signal: LearningSignalInput): void {
    const entry = toKnowledgeEntry(signal);
    this.knowledge.store(entry);
  }
}