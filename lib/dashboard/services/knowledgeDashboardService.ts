/**
 * ============================================================
 * Global Career AI
 * Knowledge Dashboard Service V1.1
 * ============================================================
 *
 * Adapter between Knowledge Intelligence
 * and Dashboard Experience.
 *
 * Responsibilities:
 * - Consume knowledge intelligence output
 * - Transform domain data
 * - Return Dashboard-compatible insight
 *
 * Does not execute knowledge evaluation logic.
 * ============================================================
 */

import { analyzeKnowledgeProfile } from "@/lib/knowledge/services/knowledgeProfileService";

import type { KnowledgeInsight } from "../contracts/dashboardContract";


export interface KnowledgeDashboardContext {
  userId: string;

  tenantId: string;

  professionalText: string;
}


export interface KnowledgeDashboardSource {
  dominantDomains: string[];

  averageScore: number;

  knowledgeGaps: string[];
}


/**
 * ADR-013 Knowledge Intelligence adapter boundary.
 *
 * Dashboard consumes Knowledge Intelligence
 * through the official service layer.
 */
async function getKnowledgeSource(
  context: KnowledgeDashboardContext
): Promise<KnowledgeDashboardSource> {

  const result =
    analyzeKnowledgeProfile(
      context.professionalText,
      {
        userId: context.userId,
        tenantId: context.tenantId,
      }
    );


  return {
    dominantDomains:
      result.profile.domains
        .sort(
          (a, b) =>
            b.score - a.score
        )
        .map(
          domain =>
            domain.domain.name
        ),


    averageScore:
      result.profile.averageScore,


    knowledgeGaps:
  result.analysis.gaps
    ? result.analysis.gaps.map(
        gap =>
          gap.competencyName
      )
    : [],
  };
}


export async function getKnowledgeDashboardInsight(
  context: KnowledgeDashboardContext
): Promise<KnowledgeInsight> {

  const knowledge =
    await getKnowledgeSource(context);


  return {
    dominantDomains:
      knowledge.dominantDomains,

    averageScore:
      knowledge.averageScore,

    knowledgeGaps:
      knowledge.knowledgeGaps,
  };
}