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
      return "EVIDENCE";
  }
}


function resolveStrength(
  event: LearningDomainEvent,
): LearningSignalStrength {
  const confidence =
    event.metadata?.confidence;

  if (typeof confidence === "number") {
    if (confidence >= 0.8) {
      return "HIGH";
    }

    if (confidence >= 0.5) {
      return "MEDIUM";
    }
  }

  return "LOW";
}


function resolveSignalType(
  event: LearningDomainEvent,
): string {
  switch (event.type) {
    case "ATS_EVALUATED":
      return "PROFILE_EVALUATED";

    case "RANKING_GENERATED":
      return "COMPETITIVE_POSITION_EVALUATED";

    case "RECOMMENDATION_CREATED":
      return "CAREER_RECOMMENDATION";

    case "DECISION_CREATED":
      return "CAREER_DECISION";

    case "APPLICATION_SUBMITTED":
      return "APPLICATION_SUBMITTED";

    case "INTERVIEW_RECEIVED":
      return "INTERVIEW_RECEIVED";

    case "OFFER_RECEIVED":
      return "OFFER_RECEIVED";

    case "REJECTION_RECEIVED":
      return "REJECTION_RECEIVED";

    default:
      return "LEARNING_EVIDENCE";
  }
}


function resolveDescription(
  event: LearningDomainEvent,
): string {
  switch (event.type) {
    case "ATS_EVALUATED":
      return "Profile evaluated against an opportunity.";

    case "RANKING_GENERATED":
      return "Competitive position evaluated against an opportunity.";

    case "RECOMMENDATION_CREATED":
      return "Career recommendation generated from profile evidence.";

    case "DECISION_CREATED":
      return "Career decision generated from evaluation evidence.";

    case "APPLICATION_SUBMITTED":
      return "Application submitted for an opportunity.";

    case "INTERVIEW_RECEIVED":
      return "Interview received for an application.";

    case "OFFER_RECEIVED":
      return "Offer received for an application.";

    case "REJECTION_RECEIVED":
      return "Application rejection received.";

    default:
      return event.context.action;
  }
}


export function adaptLearningEventToSignal(
  event: LearningDomainEvent,
): LearningSignal {
  return {
    id:
      event.id ??
      `signal-${Date.now()}`,

    source:
      resolveSource(event),

    type:
      resolveSignalType(event),

    description:
      resolveDescription(event),

    strength:
      resolveStrength(event),

    context: {
      userId:
        event.userId,

      tenantId:
        event.tenantId,

      careerGoal:
        typeof event.context.careerGoal === "string"
          ? event.context.careerGoal
          : undefined,

      industry:
        typeof event.context.industry === "string"
          ? event.context.industry
          : undefined,

      country:
        typeof event.context.country === "string"
          ? event.context.country
          : undefined,

      role:
        typeof event.context.role === "string"
          ? event.context.role
          : undefined,
    },

    createdAt:
      new Date(event.timestamp),
  };
}