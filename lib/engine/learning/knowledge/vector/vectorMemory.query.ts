
/**
 * ============================================================
 * Global Career AI
 * Knowledge Layer V1
 * Vector Query Engine
 * ------------------------------------------------------------
 * Provides Top-K retrieval and similarity-based ranking.
 *
 * Pure logic layer built on top of similarity engine.
 * ============================================================
 */

import {
  cosineSimilarity,
} from "./vectorMemory.similarity";

/**
 * Generic vector record used for retrieval.
 */
export type VectorRecord<T = unknown> = {
  id: string;
  vector: number[];
  payload: T;
};

/**
 * Result returned after similarity search.
 */
export type VectorSearchResult<T = unknown> = {
  id: string;
  score: number;
  payload: T;
};

/**
 * Options for vector search.
 */
export type VectorSearchOptions = {
  topK?: number;
  threshold?: number;
};

/**
 * Executes a Top-K similarity search over vector space.
 */
export function vectorTopKSearch<T>(
  queryVector: number[],
  dataset: VectorRecord<T>[],
  options: VectorSearchOptions = {}
): VectorSearchResult<T>[] {
  const topK = options.topK ?? 5;
  const threshold = options.threshold ?? 0;

  const results: VectorSearchResult<T>[] = [];

  for (const item of dataset) {
    const score = cosineSimilarity(queryVector, item.vector);

    if (score >= threshold) {
      results.push({
        id: item.id,
        score,
        payload: item.payload,
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Finds the most similar single item.
 */
export function vectorNearest<T>(
  queryVector: number[],
  dataset: VectorRecord<T>[]
): VectorSearchResult<T> | null {
  const results = vectorTopKSearch(queryVector, dataset, {
    topK: 1,
  });

  return results.length > 0 ? results[0] : null;
}

/**
 * Filters dataset by minimum similarity threshold.
 */
export function vectorFilterBySimilarity<T>(
  queryVector: number[],
  dataset: VectorRecord<T>[],
  threshold: number
): VectorSearchResult<T>[] {
  return vectorTopKSearch(queryVector, dataset, {
    topK: dataset.length,
    threshold,
  });
}