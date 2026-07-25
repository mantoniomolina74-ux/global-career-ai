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


export type LearningPatternType =
  | "IMPROVEMENT"
  | "GAP"
  | "SUCCESS"
  | "FAILURE"
  | "TREND";


export interface LearningPattern {
  id: string;
  type: LearningPatternType;
  description: string;
  confidence: number;
  signals: LearningSignal[];
}


export type LearningInsightType =
  | "RECOMMENDATION"
  | "WARNING"
  | "OPPORTUNITY";


export interface LearningInsight {
  id: string;
  type: LearningInsightType;
  title: string;
  description: string;
  confidence: number;
  pattern: LearningPattern;
}