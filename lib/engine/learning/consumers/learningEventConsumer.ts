
import {
  applyLearningStep,
  WeightState,
  LearningSignal,
} from "../weights/learningWeights.engine";

import {
  computeSemanticSignal,
  semanticToLearningDelta,
} from "../semantic/semanticSignal.engine";

import {
  storeSemanticMemory,
  recallSemanticMemory,
  computeMemoryDelta,
} from "../semanticMemory/semanticMemory.engine";

// ============================================================
// Knowledge Layer Integration (8C.12B)
// ============================================================
import { KnowledgeEngine } from "../knowledge/knowledgeEngine";
import { LearningToKnowledgeBridge } from "../knowledge/integration/learningToKnowledge.bridge";

const knowledgeEngine = new KnowledgeEngine();
const bridge = new LearningToKnowledgeBridge(knowledgeEngine);

/**
 * Dynamic learning payload structure
 */
type LearningPayload = Record<string, unknown>;

/**
 * Learning event structure
 */
type LearningEvent = {
  type: string;
  payload: LearningPayload;
  timestamp: number;
};

function getBoolean(
  value: unknown,
  fallback = false
): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function getNumber(
  value: unknown,
  fallback = 0
): number {
  return typeof value === "number" ? value : fallback;
}

function getObject(
  value: unknown
): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : {};
}

/**
 * Convert event → learning signal
 * Structural + Semantic + Memory fusion layer (8C.10)
 */
function mapEventToSignal(event: LearningEvent): LearningSignal {
  switch (event.type) {
    case "DECISION_CREATED": {
      const baseSignal: LearningSignal = {
        decisionDelta: getBoolean(event.payload.success) ? 0.05 : -0.05,
        weight: 1,
      };

      const semanticCtx = getObject(event.payload.context);

      const semantic = computeSemanticSignal(semanticCtx);
      const semanticDelta = semanticToLearningDelta(semantic);

      storeSemanticMemory({
        context: semanticCtx,
        semanticScore: semantic.semanticRelevance,
        timestamp: event.timestamp,
      });

      const memory = recallSemanticMemory(semanticCtx);
      const memoryDelta = computeMemoryDelta(memory);

      /**
       * ============================================================
       * Knowledge Bridge Injection (8C.12B)
       * ============================================================
       */
      bridge.ingest({
        applicationId:
          typeof semanticCtx.applicationId === "string"
            ? semanticCtx.applicationId
            : "unknown",
        skills: Array.isArray(semanticCtx.skills)
          ? semanticCtx.skills
          : [],
        industry:
          typeof semanticCtx.industry === "string"
            ? semanticCtx.industry
            : undefined,
        country:
          typeof semanticCtx.country === "string"
            ? semanticCtx.country
            : undefined,
        success: getBoolean(event.payload.success),
        confidence: getNumber(event.payload.confidence),
        embedding: semanticToVectorFallback(semanticCtx),
        timestamp: new Date(event.timestamp),
      });

      return {
        ...baseSignal,
        ...semanticDelta,
        ...memoryDelta,
      };
    }

    case "ATS_SCORE_CALCULATED":
      return {
        atsDelta: getNumber(event.payload.impact),
        weight: 0.8,
      };

    case "RANKING_UPDATED":
      return {
        rankingDelta: getNumber(event.payload.delta),
        weight: 0.7,
      };

    default:
      return {};
  }
}

/**
 * Deterministic fallback embedding generator
 * (temporary until real embedding model is integrated)
 */
function semanticToVectorFallback(
  ctx: Record<string, unknown>
): number[] {
  const base = JSON.stringify(ctx ?? "");

  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }

  return Array.from({ length: 8 }, (_, i) => {
    return ((hash >> i) & 255) / 255;
  });
}

/**
 * Main consumer entry point
 */
export function processLearningEventBatch(
  events: LearningEvent[],
  currentState: WeightState,
  history: WeightState[]
): WeightState {
  const signals: LearningSignal[] = events.map(mapEventToSignal);

  return applyLearningStep(currentState, signals, history);
}