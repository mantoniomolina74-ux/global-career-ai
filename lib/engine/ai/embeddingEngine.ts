import { supabaseServer } from "@/lib/supabase-server";

/**
 * =========================================================
 * SUPABASE CLIENT
 * =========================================================
 */


/**
 * =========================================================
 * TYPES
 * =========================================================
 */

export interface EmbeddingInput {
  id: string;
  text: string;
  type: "job" | "candidate" | "application";
}

export interface VectorMatch {
  id: string;
  similarity: number;
  metadata?: unknown;
}

/**
 * =========================================================
 * EMBEDDING GENERATION (PLACEHOLDER FOR OPENAI)
 * =========================================================
 */

export async function generateEmbedding(text: string): Promise<number[]> {
  /**
   * ⚠️ FASE REAL:
   * aquí conectarás OpenAI embeddings:
   * text-embedding-3-small / large
   */

  // fallback simple hash vector (placeholder estable)
  const vector = Array.from({ length: 64 }, (_, i) => {
    const char = text.charCodeAt(i % text.length) || 1;
    return (char % 10) / 10;
  });

  return vector;
}

/**
 * =========================================================
 * COSINE SIMILARITY
 * =========================================================
 */

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denominator = Math.sqrt(magA) * Math.sqrt(magB);

  return denominator === 0 ? 0 : dot / denominator;
}

/**
 * =========================================================
 * STORE VECTOR
 * =========================================================
 */

export async function storeEmbedding(input: EmbeddingInput) {
  const vector = await generateEmbedding(input.text);

  const { error } = await supabaseServer.from("embeddings").insert({
    entity_id: input.id,
    content: input.text,
    type: input.type,
    embedding: vector,
  });

  if (error) {
    throw new Error(`Embedding insert failed: ${error.message}`);
  }

  return { success: true };
}

/**
 * =========================================================
 * VECTOR SEARCH ENGINE
 * =========================================================
 */

export async function searchSimilar(
  query: string,
  type?: "job" | "candidate" | "application",
  limit: number = 10
): Promise<VectorMatch[]> {
  const queryVector = await generateEmbedding(query);

  let dbQuery =  supabaseServer.from("embeddings").select("*");

  if (type) {
    dbQuery = dbQuery.eq("type", type);
  }

  const { data, error } = await dbQuery;

  if (error) {
    throw new Error(error.message);
  }

  const results: VectorMatch[] = [];

  for (const item of data || []) {
    const similarity = cosineSimilarity(
      queryVector,
      item.embedding
    );

    results.push({
      id: item.entity_id,
      similarity,
      metadata: item,
    });
  }

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * =========================================================
 * JOB ↔ CANDIDATE MATCHING
 * =========================================================
 */

export async function matchJobToCandidates(jobText: string) {
  const matches = await searchSimilar(jobText, "candidate", 20);

  return {
    topMatches: matches,
    bestMatch: matches[0] || null,
  };
}

/**
 * =========================================================
 * CANDIDATE ↔ JOB MATCHING
 * =========================================================
 */

export async function matchCandidateToJobs(candidateText: string) {
  const matches = await searchSimilar(candidateText, "job", 20);

  return {
    topMatches: matches,
    bestMatch: matches[0] || null,
  };
}