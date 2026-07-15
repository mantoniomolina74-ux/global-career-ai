/**
 * ============================================================
 * Global Career AI
 * Knowledge Layer V1
 * Knowledge Engine (Facade)
 * ------------------------------------------------------------
 * Single entry point for all Knowledge operations.
 *
 * This layer orchestrates:
 * - Contracts
 * - Vector Memory Engine
 * - Query Engine
 * - Similarity Engine
 *
 * It does NOT contain business logic.
 * ============================================================
 */

import type {
  KnowledgeEntry,
  KnowledgeQuery,
  KnowledgeResult,
  KnowledgeStatistics,
} from "./contracts/knowledge.contracts";

import {
  upsertVectorRecord,
  deleteVectorRecord,
  getVectorRecord,
  getAllVectorRecords,
  searchSimilarVectors,
  getVectorMemorySize,
  clearVectorMemory,
} from "./vector/vectorMemory.engine";

import type {
  VectorRecord,
} from "./vector/vectorMemory.query";

/**
 * ------------------------------------------------------------
 * Internal Mapper: KnowledgeEntry → VectorRecord
 * ------------------------------------------------------------
 */
function toVectorRecord(entry: KnowledgeEntry): VectorRecord<KnowledgeEntry> {
  return {
    id: entry.metadata.id,
    vector: entry.semantic.embedding,
    payload: entry,
  };
}

/**
 * ------------------------------------------------------------
 * Knowledge Engine (Facade)
 * ------------------------------------------------------------
 */
export class KnowledgeEngine {

  /**
   * Stores or updates a knowledge entry.
   */
  store(entry: KnowledgeEntry): void {
    const record = toVectorRecord(entry);
    upsertVectorRecord(record.id, record.vector, record.payload);
  }

  /**
   * Deletes a knowledge entry.
   */
  delete(id: string): void {
    deleteVectorRecord(id);
  }

  /**
   * Finds a knowledge entry by ID.
   */
  find(id: string): KnowledgeEntry | null {
    const record = getVectorRecord<KnowledgeEntry>(id);
    return record ? record.payload : null;
  }

  /**
   * Executes semantic search over knowledge space.
   */
  query(query: KnowledgeQuery): KnowledgeResult[] {
    const all = getAllVectorRecords<KnowledgeEntry>();

    const dataset = all.map((r) => ({
      id: r.id,
      vector: r.vector,
      payload: r.payload,
    }));

    // If query has embedding-less filters only → skip vector search
    const filtered = dataset.filter((item) => {
      const entry = item.payload;

      if (query.industry && entry.semantic.industry !== query.industry) {
        return false;
      }

      if (query.country && entry.semantic.country !== query.country) {
        return false;
      }

      if (query.skills && query.skills.length > 0) {
        const hasSkill = query.skills.some((s) =>
          entry.semantic.skills.includes(s)
        );
        if (!hasSkill) return false;
      }

      if (
        query.minimumScore &&
        entry.scores.confidence < query.minimumScore
      ) {
        return false;
      }

      return true;
    });

    return filtered.slice(0, query.limit ?? 10).map((item) => ({
      entry: item.payload,
      confidence: item.payload.scores.confidence,
      similarity: 1, // baseline until vector query refinement in next iteration
    }));
  }

  /**
   * Semantic similarity search.
   */
  similar(
    id: string,
    limit: number = 5
  ): KnowledgeResult[] {
    const record = getVectorRecord<KnowledgeEntry>(id);

    if (!record) return [];

    const results = searchSimilarVectors<KnowledgeEntry>(
      record.vector,
      limit,
      0
    );

    return results.map((r) => ({
      entry: r.payload,
      similarity: r.score,
      confidence: r.payload.scores.confidence,
    }));
  }

  /**
   * Returns system statistics.
   */
  statistics(): KnowledgeStatistics {
    const all = getAllVectorRecords<KnowledgeEntry>();

    const total = all.length;

    const avgScore =
      total === 0
        ? 0
        : all.reduce((sum, r) => sum + r.payload.scores.confidence, 0) /
          total;

    const avgConfidence = avgScore;

    return {
      totalEntries: total,
      averageScore: avgScore,
      averageConfidence: avgConfidence,
      lastUpdated: new Date(),
    };
  }

  /**
   * Clears entire knowledge base.
   */
  clear(): void {
    clearVectorMemory();
  }

  /**
   * Returns current memory size.
   */
  size(): number {
    return getVectorMemorySize();
  }
}