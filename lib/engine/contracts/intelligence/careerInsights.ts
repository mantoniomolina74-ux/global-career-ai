export type CareerRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type ActionPriority = "LOW" | "MEDIUM" | "HIGH";

export type GapImpact = "LOW" | "MEDIUM" | "HIGH";

export interface CareerGap {
  category: string;
  title: string;
  impact: GapImpact;
  source: string;
}

export interface CareerAction {
  title: string;
  priority: ActionPriority;
  estimatedImpact: number;
  source: string;
}

export interface CareerInsights {
  overallHealth: number;

  marketReadiness: number;

  applicationReadiness: number;

  careerMomentum: number;

  riskLevel: CareerRiskLevel;

  confidence: number;

  priorityGaps: CareerGap[];

  recommendedActions: CareerAction[];
}