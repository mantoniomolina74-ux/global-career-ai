/**
 * ============================================================
 * Global Career AI
 * Semantic Signal Engine — 8C.9B
 * ============================================================
 */

export type SemanticContext = {
  text?: string;
  embeddingScore?: number; // future vector similarity
  intentMatch?: number;
  contextFit?: number;
};

export type SemanticSignal = {
  semanticRelevance: number;
  intentMatch: number;
  contextFit: number;
};

/**
 * Normalize semantic input into stable signal
 */
export function computeSemanticSignal(
  ctx: SemanticContext
): SemanticSignal {
  const semanticRelevance = ctx.embeddingScore ?? 0;

  const intentMatch = ctx.intentMatch ?? 0;

  const contextFit = ctx.contextFit ?? 0;

  return {
    semanticRelevance: clamp01(semanticRelevance),
    intentMatch: clamp01(intentMatch),
    contextFit: clamp01(contextFit),
  };
}

/**
 * Convert semantic signal → learning influence
 */
export function semanticToLearningDelta(signal: SemanticSignal) {
  const combined =
    signal.semanticRelevance * 0.5 +
    signal.intentMatch * 0.3 +
    signal.contextFit * 0.2;

  return {
    rankingDelta: combined * 0.1,
    decisionDelta: combined * 0.05,
  };
}

/**
 * Safety clamp
 */
function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}