/**
 * ============================================================
 * Semantic Memory Engine — 8C.10
 * ============================================================
 */

export type SemanticMemoryEntry = {
  context: unknown;
  semanticScore: number;
  timestamp: number;
};

const memory: SemanticMemoryEntry[] = [];

/**
 * Store semantic event in memory
 */
export function storeSemanticMemory(entry: SemanticMemoryEntry) {
  memory.push(entry);

  // simple retention control
  if (memory.length > 200) {
    memory.shift();
  }
}

/**
 * Retrieve relevant memory (simplified scoring)
 */
export function recallSemanticMemory(_context: unknown) {
  // placeholder similarity (can be upgraded to embeddings later)
  return memory
    .map((m) => ({
      ...m,
      relevance: Math.random() * m.semanticScore,
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10);
}

/**
 * Compute memory influence on learning
 */
export function computeMemoryDelta(relevant: SemanticMemoryEntry[]) {
  if (relevant.length === 0) {
    return {
      rankingDelta: 0,
      decisionDelta: 0,
    };
  }

  const avg =
    relevant.reduce((acc, m) => acc + m.semanticScore, 0) /
    relevant.length;

  return {
    rankingDelta: avg * 0.05,
    decisionDelta: avg * 0.03,
  };
}