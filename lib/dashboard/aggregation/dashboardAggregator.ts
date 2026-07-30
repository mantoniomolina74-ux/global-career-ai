
/**
 * ============================================================
 * Global Career AI
 * Dashboard Aggregator V1.1
 * ============================================================
 *
 * Responsible for coordinating Dashboard data generation.
 *
 * Responsibilities:
 * - Coordinate Dashboard services
 * - Build Dashboard response flow
 * - Preserve tenant context
 *
 * This layer does not contain intelligence logic.
 * ============================================================
 */

import type { DashboardContract } from "../contracts/dashboardContract";

import { getATSDashboardInsight } from "../services/atsDashboardService";
import { getMatchingDashboardInsight } from "../services/matchingDashboardService";
import { getCompetencyDashboardInsight } from "../services/competencyDashboardService";
import { getKnowledgeDashboardInsight } from "../services/knowledgeDashboardService";
import { getLearningDashboardInsight } from "../services/learningDashboardService";

import { buildDashboardContract } from "../builders/dashboardContractBuilder";


export interface DashboardContext {
  userId: string;

  tenantId: string;

  professionalText?: string;
}


export async function aggregateDashboard(
  context: DashboardContext
): Promise<DashboardContract> {

  const [
    atsInsight,
    matchingInsight,
    competencyInsight,
    knowledgeInsight,
    learningInsight,
  ] = await Promise.all([
    getATSDashboardInsight(context),
    getMatchingDashboardInsight(context),
    getCompetencyDashboardInsight({
  ...context,
  professionalText: context.professionalText ?? "",
}),

getKnowledgeDashboardInsight({
  ...context,
  professionalText: context.professionalText ?? "",
}),
    getLearningDashboardInsight(context),
  ]);


  return buildDashboardContract({

    metadata: {
      version: "1.1",
      userId: context.userId,
      tenantId: context.tenantId,
      generatedAt: new Date().toISOString(),
    },


    executiveSummary: {
      overallScore: 0,

      careerPosition: "INITIALIZING",

      mainStrengths: [],

      improvementAreas: [],
    },


    intelligence: {

      ats: atsInsight,

      matching: matchingInsight,

      competency: competencyInsight,

      knowledge: knowledgeInsight,

      learning: learningInsight,

      decision: {
        confidence: 0,

        recommendations: [],
      },
    },


    recommendations: {
      priorityActions: [],

      quickWins: [],

      longTermGoals: [],
    },


    evidence: {
      items: [],

      overallConfidence: 0,
    },


    timeline: {
      snapshots: [],

      milestones: [],

      improvements: [],

      evolutionTrend: "STARTING",
    },


    diagnostics: {
      traceId: crypto.randomUUID(),

      processingTime: 0,

      executionStatus: "SUCCESS",

      engineVersions: {},

      warnings: [],

      dataQuality: {
        completeness: 0,

        confidence: 0,

        partialData: true,
      },
    },

  });

}

