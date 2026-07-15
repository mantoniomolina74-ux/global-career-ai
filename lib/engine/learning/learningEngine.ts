import type { LearningEventType } from "@/lib/engine/learning/learningTypes";

export interface LearningEvent {
  id: string;
  type: LearningEventType;
  userId: string;
  organizationId?: string;
  timestamp: Date;
  payload: Record<string, unknown>;
}

export interface LearningSignal {
  id: string;
  sourceEventId: string;
  userId: string;
  organizationId?: string;
  signalType: LearningEventType;
  confidence: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface LearningEngineResult {
  success: boolean;
  signal?: LearningSignal;
  reason?: string;
}

function generateSignalId(): string {
  return crypto.randomUUID();
}

export function runLearningEngine(
  event: LearningEvent
): LearningEngineResult {
  if (!event.id) {
    return {
      success: false,
      reason: "Missing event id",
    };
  }

  if (!event.userId) {
    return {
      success: false,
      reason: "Missing user id",
    };
  }

  const signal: LearningSignal = {
    id: generateSignalId(),
    sourceEventId: event.id,
    userId: event.userId,
    organizationId: event.organizationId,
    signalType: event.type,
    confidence: 1,
    metadata: {
      ...event.payload,
    },
    createdAt: new Date(),
  };

  return {
    success: true,
    signal,
  };
}