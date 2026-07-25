import { adaptLearningEventToSignal } from "../lib/engine/learning-intelligence/learningSignalAdapter";
import { LearningDomainEvent } from "../lib/engine/learning/learningTypes";


const rejectionEvent: LearningDomainEvent = {
  id: "event-001",

  userId: "test-user",

  type: "REJECTION_RECEIVED",

  timestamp: new Date().toISOString(),

  context: {
    action:
      "User application rejected after ranking process",

    applicationId:
      "application-001",

    status:
      "REJECTED",

    matchedSkills: [
      "equipment-operation",
      "safety",
    ],

    missingSkills: [
      "hydraulic-systems",
    ],
  },

  metadata: {
    source: "USER",

    confidence: 0.7,

    traceId:
      "trace-learning-001",
  },
};


const learningSignal =
  adaptLearningEventToSignal(
    rejectionEvent,
  );


console.log(
  JSON.stringify(
    learningSignal,
    null,
    2,
  ),
);