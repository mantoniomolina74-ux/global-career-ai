/**
 * ============================================================
 * Global Career AI
 * Knowledge Layer V1
 * Vector Similarity Engine
 * ------------------------------------------------------------
 * Pure mathematical utilities for vector comparison.
 *
 * This module is completely domain-agnostic.
 * It does NOT depend on Knowledge, Learning, ATS or Ranking.
 * ============================================================
 */

/**
 * Computes dot product between two vectors.
 */
export function dotProduct(a: number[], b: number[]): number {
  let sum = 0;

  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }

  return sum;
}

/**
 * Computes vector magnitude (L2 norm).
 */
export function magnitude(vector: number[]): number {
  let sum = 0;

  for (let i = 0; i < vector.length; i++) {
    sum += vector[i] * vector[i];
  }

  return Math.sqrt(sum);
}

/**
 * Normalizes a vector to unit length.
 */
export function normalize(vector: number[]): number[] {
  const mag = magnitude(vector);

  if (mag === 0) return vector;

  return vector.map((v) => v / mag);
}

/**
 * Computes cosine similarity between two vectors.
 *
 * Result range:
 * - 1 → identical direction
 * - 0 → orthogonal
 * - -1 → opposite direction
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);

  if (magA === 0 || magB === 0) return 0;

  return dotProduct(a, b) / (magA * magB);
}

/**
 * Euclidean distance between two vectors.
 */
export function euclideanDistance(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);

  let sum = 0;

  for (let i = 0; i < len; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Converts distance to similarity score (0–1).
 */
export function distanceToSimilarity(distance: number): number {
  return 1 / (1 + distance);
}