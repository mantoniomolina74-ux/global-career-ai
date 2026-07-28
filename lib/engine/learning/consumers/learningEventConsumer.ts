import {
  applyLearningStep,
  WeightState,
  LearningSignal as WeightLearningSignal,
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

import { KnowledgeEngine } from "../knowledge/knowledgeEngine";
import { LearningToKnowledgeBridge } from "../knowledge/integration/learningToKnowledge.bridge";

import {
  adaptLearningEventToSignal,
} from "../../learning-intelligence/learningSignalAdapter";

import {
  LearningDomainEvent,
} from "../learningTypes";


const knowledgeEngine = new KnowledgeEngine();

const bridge =
  new LearningToKnowledgeBridge(
    knowledgeEngine,
  );


type LearningPayload =
  Record<string, unknown>;


type LearningEvent = LearningDomainEvent;


function getBoolean(
  value: unknown,
  fallback = false,
): boolean {
  return typeof value === "boolean"
    ? value
    : fallback;
}


function getNumber(
  value: unknown,
  fallback = 0,
): number {
  return typeof value === "number"
    ? value
    : fallback;
}


function getObject(
  value: unknown,
): Record<string, unknown> {
  return typeof value === "object" &&
    value !== null
    ? value as Record<string, unknown>
    : {};
}


/**
 * Existing Adaptive Weight signal mapping
 */

function mapEventToSignal(
  event: LearningEvent,
): WeightLearningSignal {

  const payload = event.payload ?? {};

  switch (event.type) {
    case "DECISION_CREATED": {
      const baseSignal: WeightLearningSignal = {
        decisionDelta:
          getBoolean(payload.success)
            ? 0.05
            : -0.05,

        weight: 1,
      };
      const semanticCtx =
        getObject(payload.context);


      const semantic =
        computeSemanticSignal(
          semanticCtx,
        );


      const semanticDelta =
        semanticToLearningDelta(
          semantic,
        );


      storeSemanticMemory({
        context: semanticCtx,
        semanticScore:
          semantic.semanticRelevance,
         timestamp:
  new Date(event.timestamp).getTime(),
      });


      const memory =
        recallSemanticMemory(
          semanticCtx,
        );


      const memoryDelta =
        computeMemoryDelta(
          memory,
        );


      bridge.ingest({
        applicationId:
          typeof semanticCtx.applicationId === "string"
            ? semanticCtx.applicationId
            : "unknown",

        skills:
          Array.isArray(semanticCtx.skills)
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

        success:
          getBoolean(
            payload.success,
          ),

        confidence:
          getNumber(
            payload.confidence,
          ),

        embedding:
          semanticToVectorFallback(
            semanticCtx,
          ),

        timestamp:
          new Date(
            event.timestamp,
          ),
      });


      return {
        ...baseSignal,
        ...semanticDelta,
        ...memoryDelta,
      };
    }


    case "ATS_EVALUATED":
      return {
        atsDelta:
          getNumber(
            payload.impact,
          ),

        weight: 0.8,
      };


    case "RANKING_GENERATED":
      return {
        rankingDelta:
          getNumber(
            payload.delta,
          ),

        weight: 0.7,
      };


    default:
      return {};
  }
}


/**
 * ADR-014 Learning Intelligence bridge
 */
function mapEventToLearningSignal(
  event: LearningEvent,
) {

  const payload = event.payload ?? {};

  const domainEvent: LearningDomainEvent = {
  userId: event.userId,
  tenantId: event.tenantId,

  type:
    event.type as LearningDomainEvent["type"],

    timestamp:
      new Date(
        event.timestamp,
      ).toISOString(),

    context: {
  action:
    event.type,

  ...event.payload,

  ...( 
    typeof payload.context === "object" &&
payload.context !== null
  ? payload.context
      : {}
  ),
},

    payload:
      event.payload,

      metadata: {
  source: "USER",

  confidence:
    getNumber(
      payload.confidence,
    ),
},
  };


  return adaptLearningEventToSignal(
    domainEvent,
  );
}


/**
 * Deterministic fallback embedding
 */
function semanticToVectorFallback(
  ctx: Record<string, unknown>,
): number[] {
  const base =
    JSON.stringify(ctx ?? "");

  let hash = 0;

  for (
    let i = 0;
    i < base.length;
    i++
  ) {
    hash =
      (hash << 5) -
      hash +
      base.charCodeAt(i);

    hash |= 0;
  }


  return Array.from(
    { length: 8 },
    (_, i) =>
      ((hash >> i) & 255) / 255,
  );
}


/**
 * Main consumer
 */
export function processLearningEventBatch(
  events: LearningEvent[],
  currentState: WeightState,
  history: WeightState[],
): WeightState {

  const weightSignals:
    WeightLearningSignal[] =
      events.map(
        mapEventToSignal,
      );


  const intelligenceSignals =
    events.map(
      mapEventToLearningSignal,
    );


  console.log(
    "Learning Intelligence Signals:",
    intelligenceSignals,
  );


  return applyLearningStep(
    currentState,
    weightSignals,
    history,
  );
}