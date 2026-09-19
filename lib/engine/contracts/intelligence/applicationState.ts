/**
 * ============================================================
 * Global Career AI
 * Application Intelligence State V1.2
 * ============================================================
 *
 * Domain contract representing application intelligence state.
 *
 * This contract belongs to the Intelligence Core.
 * It does not belong to Dashboard.
 *
 * No business logic.
 * No persistence.
 * ============================================================
 */

export interface ApplicationState {
  totalApplications: number;

  activePipeline: number;

  responseRate: number;

  rejectionRate: number;

  conversionRate: number;

  offerRate: number;

  successRate: number;

  statusBreakdown: Record<string, number>;

  applicationScores: Record<string, number>;

  applicationIntelligence: Record<
    string,
    {
      atsScore: number | null;
      riskLevel: "low" | "medium" | "high" | null;
      matchedSkills: string[];
      missingSkills: string[];
    }
  >;

  meta: {
    generatedAt: string;
    source: string;
  };
}