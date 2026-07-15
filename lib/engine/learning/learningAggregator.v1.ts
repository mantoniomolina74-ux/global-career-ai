
import { LearningDomainEvent } from "./learningTypes";

export interface LearningState {
  totalEvents: number;
  avgATS: number;
  avgDecisionScore: number;
  successSignals: number;
  rejectionSignals: number;
}

export function aggregateLearningEvents(
  events: LearningDomainEvent[]
): LearningState {
  if (!events || events.length === 0) {
    return {
      totalEvents: 0,
      avgATS: 0,
      avgDecisionScore: 0,
      successSignals: 0,
      rejectionSignals: 0,
    };
  }

  const atsEvents = events.filter(
    (event) => event.type === "ATS_EVALUATED"
  );

  const decisionEvents = events.filter(
    (event) => event.type === "DECISION_CREATED"
  );

  const atsScores = atsEvents.map(
    (event) => event.context.atsScore ?? 0
  );

  const decisionScores: number[] = decisionEvents.map(
  (event) =>
    typeof event.context.decision === "string"
      ? 50
      : 0
);

  return {
    totalEvents: events.length,

    avgATS:
      atsScores.length > 0
        ? atsScores.reduce((total, score) => total + score, 0) /
          atsScores.length
        : 0,

    avgDecisionScore:
      decisionScores.length > 0
        ? decisionScores.reduce((total, score) => total + score, 0) /
          decisionScores.length
        : 0,

    successSignals: decisionEvents.filter((event) =>
      JSON.stringify(event.context).includes("INTERVIEW")
    ).length,

    rejectionSignals: decisionEvents.filter((event) =>
      JSON.stringify(event.context).includes("REJECT")
    ).length,
  };
}