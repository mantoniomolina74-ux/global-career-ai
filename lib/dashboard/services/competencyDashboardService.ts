/**
 * ============================================================
 * Global Career AI
 * Competency Dashboard Service V1.1
 * ============================================================
 *
 * Adapter between Competency Intelligence
 * and Dashboard Experience.
 *
 * Responsibilities:
 * - Read competency intelligence results
 * - Transform domain output
 * - Return Dashboard-compatible structure
 *
 * Does not modify competency evaluation behavior.
 * ============================================================
 */

import { analyzeCompetencyProfile } from "@/lib/knowledge/services/competencyProfileService";

import type { CompetencyInsight } from "../contracts/dashboardContract";


export interface CompetencyDashboardContext {
  userId: string;

  tenantId: string;

  professionalText: string;
}


export async function getCompetencyDashboardInsight(
  context: CompetencyDashboardContext
): Promise<CompetencyInsight> {

  const competency =
    analyzeCompetencyProfile(
      context.professionalText
    );

  const strongestCompetencies =
    [...competency.competencies]
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 5)
      .map(
        item => item.id
      );

  const competencyGaps =
    [...competency.competencies]
      .sort(
        (a, b) =>
          a.score - b.score
      )
      .slice(0, 5)
      .map(
        item => item.id
      );

  return {
    overallScore:
      competency.averageScore,

    strongestCompetencies,

    competencyGaps,
  };
}