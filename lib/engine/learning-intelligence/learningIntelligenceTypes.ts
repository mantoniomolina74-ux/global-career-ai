export type LearningSignalSource =
  | "APPLICATION"
  | "MATCHING"
  | "KNOWLEDGE"
  | "EVIDENCE"
  | "PROFILE"
  | "FEEDBACK";


export type LearningSignalStrength =
  | "LOW"
  | "MEDIUM"
  | "HIGH";


export interface LearningContext {
  userId?: string;
  tenantId?: string;
  careerGoal?: string;
  industry?: string;
  country?: string;
  role?: string;
}


export interface LearningSignal {
  id: string;
  source: LearningSignalSource;
  type: string;
  description: string;
  strength: LearningSignalStrength;
  context?: LearningContext;
  createdAt: Date;
}
