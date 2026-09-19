/**
 * ============================================================
 * Global Career AI
 * Premium Recommendation Contract V1.0
 * ============================================================
 */

import type { MatchingOpportunity } from "@/lib/engine/contracts/intelligence/matchingState";

export type PremiumRecommendationSource =
  | "ats"
  | "matching"
  | "competency"
  | "knowledge"
  | "application";

export interface PremiumRecommendation {
  id: string;
  title: string;
  description: string;
  priority: number;
  source: PremiumRecommendationSource;
}

export interface PremiumRecommendationInsight {
  recommendations: PremiumRecommendation[];
  skillGaps: string[];
  opportunities: MatchingOpportunity[];
  strategy: string;
  generatedAt: string;
}