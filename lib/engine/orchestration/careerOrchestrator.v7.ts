import { calculateATS } from "@/lib/engine/applications/atsEngine";
import { runScoringPipeline } from "@/lib/engine/applications/scoringPipeline";
import { runRankingEngine } from "@/lib/engine/applications/rankingEngine";
import { resolveDecision } from "@/lib/engine/contracts/resolvers/decisionResolver";

import { buildLearningContext } from "@/lib/engine/learning/learningIntegration.v1";
import { getLearningEvents } from "@/lib/engine/learning/learningMemory.store";

import {
  initialize,
  searchSimilar,
} from "@/lib/engine/learning/semantic/semanticMemory.service";

import {
  CareerOrchestratorInput,
  OrchestratorResult,
} from "@/lib/engine/contracts/engineContracts";

import { emitLearning } from "@/lib/engine/learning/learningEventBus";

/**
 * ============================================================
 * Global Career AI
 * Career Orchestrator V7 — HARDENED (8C.14)
 * ============================================================
 */

export async function runCareerOrchestratorV7(
  input: CareerOrchestratorInput
): Promise<OrchestratorResult> {

  /**
   * ============================================================
   * TRACE CONTEXT (NEW — OBSERVABILITY)
   * ============================================================
   */
  const traceId = `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  /**
   * ============================================================
   * STEP 0 — LEARNING CONTEXT (CACHED PER REQUEST)
   * ============================================================
   */
  const learningContext = buildLearningContext(getLearningEvents());
  const weights = learningContext.weights;

  /**
   * ============================================================
   * STEP 0B — SEMANTIC MEMORY
   * ============================================================
   */
  initialize();

  const semanticContext = searchSimilar({
    candidateSkills: input.candidateSkills || [],
  });

  /**
   * ============================================================
   * STEP 0.75 — KNOWLEDGE (UNIFIED WITH SEMANTIC)
   * ============================================================
   */
  const knowledgeContext = semanticContext;

  /**
   * ============================================================
   * STEP 1 — ATS ENRICHMENT
   * ============================================================
   */
  const enrichedApplications = await Promise.all(
  (input.applications || []).map(async (app) => {
    const ats = await calculateATS(
      input.requiredSkills || [],
      app.candidateSkills || input.candidateSkills || [],
      app.jobDescription || input.jobDescription || "",
      app.cvStrengthScore || input.cvStrengthScore || 50,
      undefined,
      {
        userId: input.userId,
        applicationId: app.applicationId,
      }
    );

    return {
  ...app,

  atsResult: {
    ...ats.data,
  },

  atsScore: Math.round(
    ats.data.atsScore * weights.atsMultiplier
  ),

  hiringScore: ats.data.hiringScore,

  semanticScore: ats.data.semanticScore,
};
  })
);

  const atsScores = enrichedApplications.map((a) => a.atsScore || 0);

  const averageATS =
    atsScores.length > 0
      ? atsScores.reduce((a, b) => a + b, 0) / atsScores.length
      : 0;

  const topScore =
    atsScores.length > 0 ? Math.max(...atsScores) : 0;

  /**
   * ============================================================
   * ATS EVENT (HARDENED WITH TRACE)
   * ============================================================
   */
  emitLearning({
  id: `ats-${Date.now()}`,
  userId: input.userId,
  tenantId: input.tenantId,
  type: "ATS_EVALUATED",
  timestamp: new Date().toISOString(),
  context: {
    action: "ATS_EVALUATED",
    atsScore: averageATS,
  },
  payload: {
    atsScore: averageATS,
  },
  metadata: {
    source: "ATS",
    confidence: weights.atsMultiplier || 0.8,
    traceId,
  },
});

  /**
   * ============================================================
   * STEP 2 — SCORING
   * ============================================================
   */
  const scoring = await runScoringPipeline({
    applications: enrichedApplications,
    knowledgeContext,
  });

  /**
   * ============================================================
   * STEP 3 — RANKING
   * ============================================================
   */
  const ranking = runRankingEngine(scoring);

  /**
   * ============================================================
   * RANKING EVENT (HARDENED)
   * ============================================================
   */
  emitLearning({
  id: `ranking-${Date.now()}`,
  userId: input.userId,
  tenantId: input.tenantId,
  type: "RANKING_GENERATED",
  timestamp: new Date().toISOString(),
  context: {
    action: "RANKING_GENERATED",
    avgScore: averageATS,
    total: ranking.items.length,
  },
  payload: {
    avgScore: averageATS,
    total: ranking.items.length,
  },
  metadata: {
    source: "RANKING",
    confidence: weights.rankingMultiplier || 0.85,
    traceId,
  },
});

  /**
   * ============================================================
   * STEP 4 — DECISION
   * ============================================================
   */
  const decisions = ranking.items.map((item) =>
    resolveDecision(item)
  );

  /**
   * ============================================================
   * SYSTEM CONFIDENCE
   * ============================================================
   */
  const systemConfidence =
    ranking.items.length > 1
      ? Math.min(
          0.95,
          (1 -
            ranking.items.reduce(
              (acc, r) =>
                acc + Math.pow(r.finalScore - averageATS, 2),
              0
            ) /
              (ranking.items.length * 1000)) *
            weights.decisionSensitivity
        )
      : 0.8;

  /**
   * ============================================================
   * DECISION EVENT (HARDENED)
   * ============================================================
   */
  emitLearning({
  id: `decision-${Date.now()}`,
  userId: input.userId,
  tenantId: input.tenantId,
  type: "DECISION_CREATED",
  timestamp: new Date().toISOString(),
  context: {
    action: "DECISION_CREATED",
    decision: decisions,
    semanticContext,
    knowledgeContext,
  },
  payload: {
    decision: "DECISION_CREATED",
  },
  metadata: {
    source: "DECISION",
    confidence: systemConfidence,
    traceId,
  },
});

  /**
   * ============================================================
   * FINAL OUTPUT
   * ============================================================
   */
  return {
  userId: input.userId,

  ats: enrichedApplications.map(
    (app) => app.atsResult
  ),

  ranking,

  recommendations: {
    strategy: "Generated from ranking and decision signals",
    confidence: systemConfidence,
  },

  knowledge: knowledgeContext,

  decision: decisions[0],

  context: {
    semanticContext,
    knowledgeContext,
  },

  summary: {
    totalApplications: input.applications?.length || 0,
    averageATS: Math.round(averageATS),
    topScore,
    systemConfidence: Number(systemConfidence.toFixed(2)),
  },

  generatedAt: new Date().toISOString(),

  traceId,
};
}