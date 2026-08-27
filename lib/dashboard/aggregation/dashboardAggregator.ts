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
 * - Integrate CareerState intelligence
 *
 * This layer does not contain intelligence logic.
 * ============================================================
 */

import type {
  DashboardContract,
  DashboardIntelligence,
} from "../contracts/dashboardContract";

import type {
  CareerState,
} from "@/lib/engine/contracts/careerState";

import {
  getATSDashboardInsight,
} from "../services/atsDashboardService";

import {
  getMatchingDashboardInsight,
} from "../services/matchingDashboardService";

import {
  getCompetencyDashboardInsight,
} from "../services/competencyDashboardService";

import {
  getKnowledgeDashboardInsight,
} from "../services/knowledgeDashboardService";

import {
  getLearningDashboardInsight,
} from "../services/learningDashboardService";

import {
  adaptCareerStateToDashboard,
} from "../adapters/careerState/careerStateDashboardAdapter";

import {
  buildDashboardContract,
} from "../builders/dashboardContractBuilder";

import {
  getApplicationInsights,
} from "@/lib/engine/applications/applicationInsights";


export interface DashboardContext {

  userId: string;

  tenantId: string;

  applicationId?: string;

  professionalText?: string;

  careerState?: CareerState;

}


export async function aggregateDashboard(
  context: DashboardContext
): Promise<DashboardContract> {

  /**
   * ==========================================================
   * CAREER STATE PATH
   * ==========================================================
   *
   * CareerState is the primary source of intelligence.
   *
   * When available, do not execute Dashboard services again.
   * CareerState already contains:
   *
   * - ATSState
   * - MatchingState
   * - CompetencyState
   * - KnowledgeState
   * - ApplicationState
   * - Learning
   * - Decision
   *
   * This prevents duplicate intelligence execution.
   */

  if (context.careerState) {

    const dashboardIntelligence =
      adaptCareerStateToDashboard(
        context.careerState
      );

    return buildDashboardContract({

      metadata: {

        version: "1.1",

        userId:
          context.userId,

        tenantId:
          context.tenantId,

        generatedAt:
          new Date().toISOString(),

      },

      executiveSummary: {

        overallScore: 0,

        careerPosition:
          "INITIALIZING",

        mainStrengths: [],

        improvementAreas: [],

      },

      intelligence:
        dashboardIntelligence,

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

        evolutionTrend:
          "STARTING",

      },

      diagnostics: {

        traceId:
          crypto.randomUUID(),

        processingTime: 0,

        executionStatus:
          "SUCCESS",

        engineVersions: {},

        warnings: [],

        dataQuality: {

          completeness: 0,

          confidence: 0,

          partialData: false,

        },

      },

    });

  }


  /**
   * ==========================================================
   * LEGACY FALLBACK PATH
   * ==========================================================
   *
   * Preserved temporarily for consumers that do not yet
   * provide CareerState.
   */

  const [
    applicationInsights,
    atsInsight,
    matchingInsight,
    competencyInsight,
    knowledgeInsight,
    learningInsight,
  ] = await Promise.all([

    getApplicationInsights(
      context.userId
    ),

    getATSDashboardInsight(
      context
    ),

    getMatchingDashboardInsight(
      context
    ),

    getCompetencyDashboardInsight({

      ...context,

      professionalText:
        context.professionalText ?? "",

    }),

    getKnowledgeDashboardInsight({

      ...context,

      professionalText:
        context.professionalText ?? "",

    }),

    getLearningDashboardInsight(
      context
    ),

  ]);


  const dashboardIntelligence: DashboardIntelligence = {

    ats:
      atsInsight,

    matching:
      matchingInsight,

    competency:
      competencyInsight,

    knowledge:
      knowledgeInsight,

    application: {

      totalApplications:
        applicationInsights.performance.totalApplications,

      activePipeline:
        applicationInsights.performance.activePipeline,

      responseRate:
        applicationInsights.performance.responseRate,

      rejectionRate:
        applicationInsights.performance.rejectionRate,

      conversionRate:
        applicationInsights.funnel.conversionRate,

      offerRate:
        applicationInsights.funnel.offerRate,

      successRate:
        applicationInsights.funnel.successRate,

    },

    learning:
      learningInsight,

    decision: {

      recommendations: [],

    },

  };


  return buildDashboardContract({

    metadata: {

      version: "1.1",

      userId:
        context.userId,

      tenantId:
        context.tenantId,

      generatedAt:
        new Date().toISOString(),

    },

    executiveSummary: {

      overallScore: 0,

      careerPosition:
        "INITIALIZING",

      mainStrengths: [],

      improvementAreas: [],

    },

    intelligence:
      dashboardIntelligence,

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

      evolutionTrend:
        "STARTING",

    },

    diagnostics: {

      traceId:
        crypto.randomUUID(),

      processingTime: 0,

      executionStatus:
        "SUCCESS",

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