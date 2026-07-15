import { calculateATS } from "@/lib/engine/applications/atsEngine";
import { runRankingEngine } from "@/lib/engine/applications/rankingEngine";
import { runRecommendationEngine } from "@/lib/engine/recommendations/recommendationEngine";
import { runDecisionEngineV2 } from "@/lib/engine/decision/decisionEngine.v2";

import { buildCareerContext } from "@/lib/engine/context/contextEngine";

import { learningEventBus } from "@/lib/engine/learning/learningEventBus";
import { KnowledgeService } from "@/lib/engine/knowledge/knowledgeService";

import type {
  CareerOrchestratorInput,
  ATSResult,
} from "@/lib/engine/contracts/engineContracts";

/**
 * ============================================================
 * Orchestrator V5
 * Knowledge Layer Integration (Phase 1)
 * ============================================================
 */

const knowledgeService = new KnowledgeService();

export async function runCareerOrchestrator(
  input: CareerOrchestratorInput
) {
  const context = buildCareerContext({
    userId: input.userId,
    atsScore: 0,
    rankingScore: 0,
    recommendationScore: 0,
    candidateSkills: input.candidateSkills,
    requiredSkills: input.requiredSkills,
    jobDescription: input.jobDescription,
    cvStrengthScore: input.cvStrengthScore,
  });

  const atsResults: ATSResult[] = [];

  /**
   * ============================================================
   * STEP 1 — ATS ENGINE
   * ============================================================
   */

  for (const app of input.applications) {
    const atsResult = await calculateATS(
      input.requiredSkills || [],
      input.candidateSkills || app.candidateSkills || [],
      input.jobDescription || app.jobDescription || "",
      input.cvStrengthScore || app.cvStrengthScore || 50
    );

    const ats = atsResult.data;

    atsResults.push(ats);

    learningEventBus.emitLearning({
      id: `ats-${app.applicationId || Math.random()}`,
      userId: input.userId,
      type: "ATS_EVALUATED",
      timestamp: new Date().toISOString(),
      context: {
        action: "ATS_EVALUATED",
        applicationId: app.applicationId,
        atsScore: ats.atsScore,
      },
      payload: {
        applicationId: app.applicationId,
        atsScore: ats.atsScore,
        hiringScore: ats.hiringScore,
      },
      metadata: {
        source: "ATS",
        confidence: 0.8,
      },
    });
  }

  /**
   * ============================================================
   * STEP 2 — RANKING ENGINE
   * ============================================================
   */

  const rankingInput = {
    items: atsResults.map((r, idx) => ({
      applicationId: input.applications[idx]?.applicationId ?? `app-${idx}`,
      score: r.atsScore,
      breakdown: {},
      signals: [],
    })),
    metadata: {
      processedAt: new Date().toISOString(),
      modelVersion: "v1",
    },
  };

  const ranking = runRankingEngine(rankingInput);

  const avgRanking =
    ranking.items.reduce((acc, r) => acc + r.finalScore, 0) /
    (ranking.items.length || 1);

  learningEventBus.emitLearning({
    id: `ranking-${input.userId}-${Date.now()}`,
    userId: input.userId,
    type: "RANKING_GENERATED",
    timestamp: new Date().toISOString(),
    context: {
      action: "RANKING_GENERATED",
      avgScore: avgRanking,
      total: ranking.items.length,
    },
    payload: {
      avgScore: avgRanking,
      total: ranking.items.length,
    },
    metadata: {
      source: "RANKING",
      confidence: 0.85,
    },
  });

  /**
   * ============================================================
   * STEP 3 — ATS AGGREGATION
   * ============================================================
   */

  const averageATS =
    atsResults.length === 0
      ? 0
      : atsResults.reduce((acc, r) => acc + r.atsScore, 0) /
        atsResults.length;

  const topScore =
    atsResults.length === 0
      ? 0
      : Math.max(...atsResults.map((r) => r.atsScore));

  /**
   * ============================================================
   * STEP 4 — RECOMMENDATION ENGINE
   * ============================================================
   */

  const recommendationResult = runRecommendationEngine({
    atsScore: averageATS,
    rankingScore: avgRanking,
    recruiterScore: 70,
    learningScore: 70,
  });

  /**
   * ============================================================
   * STEP 4.5 — KNOWLEDGE SERVICE
   * ============================================================
   */

  const knowledgeInsights = knowledgeService.getCareerInsights({
    candidateSkills: input.candidateSkills ?? [],
    industry: input.industry,
    country: input.country,
    minimumConfidence: 0.6,
    limit: 10,
  });

  /**
   * ============================================================
   * STEP 5 — CONTEXT ENRICHMENT
   * ============================================================
   */

  const enrichedContext = {
    ...context,
    signals: {
      atsScore: averageATS,
      rankingScore: avgRanking,
      recommendationScore: recommendationResult.overallScore,
    },
  };

  /**
   * ============================================================
   * STEP 6 — DECISION ENGINE
   * ============================================================
   */

  const decision = runDecisionEngineV2(
    enrichedContext,
    recommendationResult.overallScore
  );

  learningEventBus.emitLearning({
    id: `decision-${input.userId}-${Date.now()}`,
    userId: input.userId,
    type: "DECISION_CREATED",
    timestamp: new Date().toISOString(),
    context: {
      action: "DECISION_CREATED",
      decision,
    },
    payload: {
  decision: JSON.stringify(decision),
},
    metadata: {
      source: "DECISION",
      confidence: decision.confidence,
    },
  });

  /**
   * ============================================================
   * FINAL SYSTEM CONFIDENCE
   * ============================================================
   */

  const systemConfidence = Math.min(
    0.95,
    (averageATS + avgRanking) / 200
  );

  return {
    userId: input.userId,
    ats: atsResults,
    ranking,
    recommendations: recommendationResult,
    knowledge: knowledgeInsights,
    decision,
    context: enrichedContext,
    summary: {
      totalApplications: input.applications.length,
      averageATS: Math.round(averageATS),
      topScore,
      systemConfidence: Number(systemConfidence.toFixed(2)),
    },
    generatedAt: new Date().toISOString(),
  };
}