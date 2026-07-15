export type HiringOutcome = "HIRED" | "REJECTED" | "NO_RESPONSE";

export interface LearningFeedback {
  userId: string;
  applicationId: string;

  systemDecision: "SHORTLIST" | "REJECT" | "INTERVIEW";
  realOutcome: HiringOutcome;

  atsScore: number;
  rankingScore: number;

  timestamp: string;
}