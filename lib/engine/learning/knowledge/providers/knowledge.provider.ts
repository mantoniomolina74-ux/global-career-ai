/**
 * ============================================================
 * Global Career AI
 * Knowledge Layer V1
 * Knowledge Provider Contract
 * ------------------------------------------------------------
 * Defines the public persistence contract for the Knowledge Layer.
 *
 * Providers abstract the underlying storage implementation
 * (Memory, Supabase, PostgreSQL, pgvector, Pinecone, etc.).
 *
 * No implementation should exist in this file.
 * ============================================================
 */

import type {
  KnowledgeEntry,
  KnowledgeQuery,
  KnowledgeResult,
  KnowledgeStatistics,
} from "../contracts/knowledge.contracts";

export interface KnowledgeProvider {
  /**
   * Stores a new knowledge entry.
   */
  store(entry: KnowledgeEntry): Promise<void>;

  /**
   * Updates an existing knowledge entry.
   */
  update(entry: KnowledgeEntry): Promise<void>;

  /**
   * Deletes a knowledge entry by its identifier.
   */
  delete(id: string): Promise<void>;

  /**
   * Finds a knowledge entry by its identifier.
   */
  find(id: string): Promise<KnowledgeEntry | null>;

  /**
   * Executes a filtered query.
   */
  query(query: KnowledgeQuery): Promise<KnowledgeResult[]>;

  /**
   * Returns entries similar to the specified entry.
   */
  similar(
    id: string,
    limit?: number
  ): Promise<KnowledgeResult[]>;

  /**
   * Returns provider statistics.
   */
  statistics(): Promise<KnowledgeStatistics>;

  /**
   * Removes every stored entry.
   * Mainly intended for testing and development.
   */
  clear(): Promise<void>;
}