/**
 * ============================================================
 * Global Career AI
 * Knowledge Layer V1
 * Public Entry Point
 * ------------------------------------------------------------
 * This file exposes the public API of the Knowledge Layer.
 * All external modules must import ONLY from here.
 * ============================================================
 */

export type {
  KnowledgeEntry,
  KnowledgeQuery,
  KnowledgeResult,
  KnowledgeStatistics,
  KnowledgeMetadata,
  KnowledgeScores,
  KnowledgeLearning,
  KnowledgeSemantic,
} from "./contracts/knowledge.contracts";

export type { KnowledgeProvider } from "./providers/knowledge.provider";

/**
 * Future exports (reserved for 8C.11B+):
 *
 * export * from "./vector/vectorMemory.engine";
 * export * from "./vector/vectorMemory.similarity";
 * export * from "./vector/vectorMemory.query";
 * export * from "./utils/vector.utils";
 * export { KnowledgeEngine } from "./knowledgeEngine";
 */