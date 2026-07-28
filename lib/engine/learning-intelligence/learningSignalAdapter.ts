import {
  LearningDomainEvent,
} from "../learning/learningTypes";

import {
  LearningSignal,
  LearningSignalSource,
  LearningSignalStrength,
} from "./learningIntelligenceTypes";


function resolveSource(
  event: LearningDomainEvent,
): LearningSignalSource {
  switch (event.metadata?.source) {
    case "ATS":
  return "MATCHING";

    case "RANKING":
      return "MATCHING";

    case "RECOMMENDATION":
      return "PROFILE";

    case "DECISION":
      return "FEEDBACK";

    case "KNOWLEDGE":
      return "KNOWLEDGE";

    default:
      return "FEEDBACK";
  }
}


function resolveStrength(
  event: LearningDomainEvent,
): LearningSignalStrength {
  if (event.metadata?.confidence) {
    if (event.metadata.confidence >= 0.8) {
      return "HIGH";
    }

    if (event.metadata.confidence >= 0.5) {
      return "MEDIUM";
    }
  }

  return "LOW";
}


export function adaptLearningEventToSignal(
  event: LearningDomainEvent,
): LearningSignal {
  return {
    id:
      event.id ??
      `signal-${Date.now()}`,

    source: resolveSource(event),

    type: event.type,

    description:
      event.context.action,

    strength:
      resolveStrength(event),

    context: {
      userId: event.userId,

       tenantId: event.tenantId,

      industry:
        typeof event.context.industry === "string"
          ? event.context.industry
          : undefined,

      country:
        typeof event.context.country === "string"
          ? event.context.country
          : undefined,
    },

    createdAt:
      new Date(event.timestamp),
  };
}