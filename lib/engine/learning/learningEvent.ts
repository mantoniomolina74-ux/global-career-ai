export type LearningEventType =
  | "ATS_EVALUATED"
  | "RANKING_GENERATED"
  | "DECISION_CREATED";

export interface LearningEvent {
  id: string;
  userId: string;
  type: LearningEventType;
  timestamp: string;

  payload: {
    applicationId?: string;
    atsScore?: number;
    hiringScore?: number;
    decision?: string;
    avgScore?: number;
    total?: number;
  };

  metadata: {
    source: "ATS" | "RANKING" | "DECISION";
    confidence: number;
  };
}