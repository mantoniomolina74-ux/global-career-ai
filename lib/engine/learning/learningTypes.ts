export type LearningEventType =
  | "ATS_EVALUATED"
  | "RANKING_GENERATED"
  | "RECOMMENDATION_CREATED"
  | "DECISION_CREATED"
  | "APPLICATION_SUBMITTED"
  | "INTERVIEW_RECEIVED"
  | "OFFER_RECEIVED"
  | "REJECTION_RECEIVED";

/**
 * =========================================================
 * CANONICAL DOMAIN EVENT (ONLY EVENT MODEL)
 * =========================================================
 */
export interface LearningDomainEvent {
  id?: string;

  userId: string;

  tenantId: string;

  type:
    | LearningEventType
    | "LEARNING_EVENT";

  timestamp: string;

  context: {
    action: string;

    applicationId?: string;
    atsScore?: number;
    status?: string;

    matchedSkills?: string[];
    missingSkills?: string[];

    [key: string]: unknown;
};

  metadata?: {
  source:
    | "ATS"
    | "RANKING"
    | "RECOMMENDATION"
    | "DECISION"
    | "ORCHESTRATOR"
    | "USER"
    | "KNOWLEDGE";

  confidence?: number;

  traceId?: string;
};

}