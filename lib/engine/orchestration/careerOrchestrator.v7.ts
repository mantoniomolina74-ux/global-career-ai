import { calculateATS } from "@/lib/engine/applications/atsEngine";
import { runScoringPipeline } from "@/lib/engine/applications/scoringPipeline";
import { runRankingEngine } from "@/lib/engine/applications/rankingEngine";
import { getApplicationInsights } from "@/lib/engine/applications/applicationInsights";

import {
  resolveDecision,
} from "@/lib/engine/contracts/resolvers/decisionResolver";

import {
  CareerOrchestratorInput,
  OrchestratorResult,
} from "@/lib/engine/contracts/engineContracts";

import {
  buildMatchingInput,
} from "@/lib/engine/adapters/intelligence/matchingInputAdapter";

import {
  analyzeMatchingProfile,
} from "@/lib/engine/services/matchingProfileService";

import { getLearningWeights } from "@/lib/engine/learning/learningWeights.bridge";



import { emitLearning } from "@/lib/engine/learning/learningEventBus";

/**
 * ============================================================
 * Global Career AI
 * Career Orchestrator V7 â€” HARDENED (8C.14)
 * ============================================================
 */

export async function runCareerOrchestratorV7(
  input: CareerOrchestratorInput
): Promise<OrchestratorResult> {

  const traceId =
    `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`;


  /**
   * ============================================================
   * STEP 0 â€” LEARNING CONTEXT
   * ============================================================
   */

  const weights = getLearningWeights();

  /**
   * ============================================================
   * STEP 1 â€” ATS ENRICHMENT
   * ============================================================
   */

  const enrichedApplications =
    await Promise.all(
      (input.applications || []).map(
        async (app) => {

          const ats =
  await calculateATS(
    input.requiredSkills || [],
    app.candidateSkills ||
      input.candidateSkills ||
      [],
    app.jobDescription ||
      input.jobDescription ||
      "",
    app.cvStrengthScore ||
      input.cvStrengthScore ||
      50,
    undefined,
    {
      userId: input.userId,
      applicationId:
        app.applicationId,
    },
    input.profile?.professionalText ?? ""
  );


          return {
            ...app,

            atsResult: {
              ...ats.data,
            },

            atsScore:
              Math.round(
                ats.data.atsScore *
                weights.atsMultiplier
              ),
            semanticScore:
              ats.data.semanticScore,
          };
        }
      )
    );


  const atsScores =
    enrichedApplications.map(
      (a) => a.atsScore || 0
    );


  const averageATS =
    atsScores.length > 0
      ? atsScores.reduce(
          (a, b) => a + b,
          0
        ) / atsScores.length
      : 0;


  const topScore =
    atsScores.length > 0
      ? Math.max(...atsScores)
      : 0;


  emitLearning({
    id: `ats-${Date.now()}`,
    userId: input.userId,
    tenantId: input.tenantId,
    type: "ATS_EVALUATED",
    timestamp:
      new Date().toISOString(),

    context: {
      action: "ATS_EVALUATED",
      atsScore: averageATS,
    },

    metadata: {
      source: "ATS",
      confidence:
        weights.atsMultiplier || 0.8,
      traceId,
    },
  });


  /**
   * ============================================================
   * STEP 2 â€” MATCHING INTELLIGENCE
   * ============================================================
   */

  const matchingInput =
    buildMatchingInput(
      input.applications || [],
      {
        skills:
          input.candidateSkills || [],

        industries:
          input.industry
            ? [input.industry]
            : [],

        candidateCertifications:
          input.candidateCertifications || [],

        professionalText:
          input.profile?.professionalText ?? "",
      }
    );


    const matching =
    analyzeMatchingProfile(
      matchingInput.jobs,
      matchingInput.cv
    );

  console.log("=== PREMIUM MATCHING DEBUG ===", {
  jobsCount: matchingInput.jobs.length,

  candidateSkills:
    matchingInput.cv.skills,

  candidateIndustries:
    matchingInput.cv.industries,

  jobs:
    matchingInput.jobs.slice(0, 5).map((job) => ({
      id: job.id,
      title: job.title,
      industry: job.industry,
      category: job.category,
      tags: job.tags,
      descriptionLength:
        job.description?.length ?? 0,
    })),

  matches:
    matching.bestMatches.slice(0, 5).map((item) => ({
      id: item.id,
      title: item.title,
      match_score: item.match_score,
      matched_skills:
        item.match_explanation?.matched_skills ?? [],
      matched_industries:
        item.match_explanation?.matched_industries ?? [],
      match_reasons:
        item.match_reasons ?? [],
        evidence_analysis:
      JSON.stringify(
        item.evidence_analysis,
    null,
    2
  ),
    })),
});


  /**
   * ============================================================
   * STEP 3 â€” SCORING
   * ============================================================
   */

  const scoring =
    await runScoringPipeline({
      applications:
        enrichedApplications,
    });


  /**
   * ============================================================
   * STEP 4 â€” RANKING
   * ============================================================
   */

  const ranking =
    runRankingEngine(
      scoring
    );


  emitLearning({
    id: `ranking-${Date.now()}`,
    userId: input.userId,
    tenantId: input.tenantId,
    type: "RANKING_GENERATED",
    timestamp:
      new Date().toISOString(),

    context: {
      action: "RANKING_GENERATED",
      avgScore: averageATS,
      total:
        ranking.items.length,
    },

    metadata: {
      source: "RANKING",
      confidence:
        weights.rankingMultiplier || 0.85,
      traceId,
    },
  });


  /**
   * ============================================================
   * STEP 5 â€” DECISION
   * ============================================================
   */

  const decisions =
    ranking.items.map(
      (item) =>
        resolveDecision(item)
    );


  const systemConfidence =
    ranking.items.length > 1
      ? Math.min(
          0.95,
          (
            1 -
            ranking.items.reduce(
              (acc, r) =>
                acc +
                Math.pow(
                  r.finalScore -
                  averageATS,
                  2
                ),
              0
            ) /
            (
              ranking.items.length *
              1000
            )
          ) *
          weights.decisionSensitivity
        )
      : 0.8;


  emitLearning({
    id: `decision-${Date.now()}`,
    userId: input.userId,
    tenantId: input.tenantId,
    type: "DECISION_CREATED",
    timestamp:
      new Date().toISOString(),

    context: {
      action: "DECISION_CREATED",
      decision: decisions,
    },

    metadata: {
      source: "DECISION",
      confidence:
        systemConfidence,
      traceId,
    },
  });

  const applicationInsights =
  await getApplicationInsights(input.userId);


  /**
   * ============================================================
   * FINAL OUTPUT
   * ============================================================
   */

  return {
  userId:
    input.userId,

  profile:
    input.profile,

  ats:
    enrichedApplications.map(
      (app) =>
        app.atsResult
    ),

    applications: enrichedApplications,

       applicationInsights,

        ranking,


    matching: {
      items:
        matching.bestMatches,
    },


    recommendations: {
      strategy:
        "Generated from ranking and decision signals",

      confidence:
        systemConfidence,
    },
    decision:
      decisions[0],


    context: weights,


    summary: {
      totalApplications:
        input.applications?.length || 0,

      averageATS:
        Math.round(
          averageATS
        ),

      topScore,

      systemConfidence:
        Number(
          systemConfidence.toFixed(2)
        ),
    },


    generatedAt:
      new Date().toISOString(),


    traceId,
  };
}
