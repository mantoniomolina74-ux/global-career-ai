import { LearningFeedback } from "./learningFeedback.types";
import { getLearningEvents } from "./learningMemory.store";
import { LearningDomainEvent } from "./learningTypes";

/**
 * ============================================================
 * Learning Feedback Engine V3 (Stable + Aggregated Learning)
 * ============================================================
 */

const feedbackStore: LearningFeedback[] = [];

function hasFeedbackPayload(
  event: LearningDomainEvent
): event is LearningDomainEvent & {
  payload: {
    realOutcome?: string;
    systemDecision?: string;
  };
} {
  return (
    typeof event.payload?.realOutcome === "string" &&
    typeof event.payload?.systemDecision === "string"
  );
}

/**
 * ============================================================
 * PUBLIC API
 * ============================================================
 */

export function submitLearningFeedback(feedback: LearningFeedback) {
  feedbackStore.push(feedback);

  return processFeedback(feedback);
}

/**
 * ============================================================
 * CORE PROCESSOR (STABLE LEARNING LOGIC)
 * ============================================================
 */

function processFeedback(feedback: LearningFeedback) {
  const history = getLearningEvents?.() || [];

  const recent = history.slice(-50);

  const total = recent.length || 1;

  const feedbackEvents = recent.filter(hasFeedbackPayload);

  const positiveRatio =
    feedbackEvents.filter(
      (event) =>
        event.payload.realOutcome === "HIRED" &&
        event.payload.systemDecision === "INTERVIEW"
    ).length / total;

  const negativeRatio =
    feedbackEvents.filter(
      (event) =>
        event.payload.realOutcome === "REJECTED" &&
        event.payload.systemDecision !== "REJECT"
    ).length / total;

  const baseAdjustment =
    positiveRatio > 0.6
      ? 1.05
      : negativeRatio > 0.4
      ? 0.95
      : 1.0;

  const individualSignal =
    feedback.realOutcome === "HIRED" &&
    feedback.systemDecision === "INTERVIEW"
      ? 1.02
      : feedback.realOutcome === "REJECTED" &&
        feedback.systemDecision !== "REJECT"
      ? 0.98
      : 1.0;

  const adjustment = Number(
    (baseAdjustment * individualSignal).toFixed(3)
  );

  return {
    success: true,
    adjustment,
    confidence: Math.min(0.95, positiveRatio + 0.5),
    windowSize: total,
    message: "stable aggregated learning applied",
  };
}

/**
 * ============================================================
 * ACCESSORS
 * ============================================================
 */

export function getFeedbackHistory() {
  return feedbackStore;
}