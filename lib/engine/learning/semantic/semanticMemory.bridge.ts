import type { SemanticSignal } from "./semanticSignal";

/**
 * ============================================================
 * SEMANTIC MEMORY BRIDGE (V2 READY CONTRACT)
 * ============================================================
 *
 * This is the ONLY public interface for semantic memory.
 *
 * Implementation can be:
 * - local vector memory (current)
 * - OpenAI embeddings (future)
 * - pgvector / Supabase (future)
 *
 * The rest of the system must NOT depend on implementation.
 * ============================================================
 */

export interface SemanticMemoryProvider {
  search(input: {
    candidateSkills: string[];
    userId?: string;
  }): Promise<SemanticSignal>;
}

/**
 * Active provider (swap point for V2)
 */
let provider: SemanticMemoryProvider | null = null;

/**
 * ============================================================
 * REGISTER PROVIDER
 * ============================================================
 */
export function registerSemanticProvider(
  p: SemanticMemoryProvider
) {
  provider = p;
}

/**
 * ============================================================
 * MAIN ENTRYPOINT (STABLE API)
 * ============================================================
 */
export async function querySemanticMemory(input: {
  candidateSkills: string[];
  userId?: string;
}): Promise<SemanticSignal> {
  if (!provider) {
    return {
      matchedProfiles: 0,
      averageHistoricalScore: 0,
      confidence: 0,
      influence: 0,
      inferredPatterns: [],
    };
  }

  return provider.search(input);
}