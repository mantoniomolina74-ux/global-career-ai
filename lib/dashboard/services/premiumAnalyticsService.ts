/**
 * ============================================================
 * Global Career AI
 * Premium Analytics Service V1.0
 * ============================================================
 *
 * Aggregates existing Premium intelligence into a unified
 * analytics view.
 *
 * Analytics does NOT execute ATS, Matching, Competency,
 * Knowledge, Career Health, or Market Readiness engines.
 *
 * Sources:
 * - CareerState
 * - Application Insights
 *
 * No historical trends are generated because persisted
 * historical snapshots do not currently exist.
 * ============================================================
 */

import type { CareerState } from "@/lib/engine/contracts/careerState";
import type {
  PremiumAnalyticsInsight,
  AnalyticsOpportunity,
} from "../contracts/premiumAnalyticsContract";
import {
  getApplicationInsights,
} from "@/lib/engine/applications/applicationInsights";

function uniqueStrings(
  values: string[]
): string[] {

  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function buildOpportunityPerformance(
  careerState: CareerState
) {

  const opportunities =
    careerState.intelligence.matching?.opportunities ?? [];

  const sortedOpportunities =
    [...opportunities].sort(
      (a, b) =>
        b.score - a.score
    );

  const matchedSkills =
    uniqueStrings(
      opportunities.flatMap(
        (opportunity) =>
          opportunity.matchedSkills
      )
    );

  const matchedIndustries =
    uniqueStrings(
      opportunities.flatMap(
        (opportunity) =>
          opportunity.matchedIndustries
      )
    );

  const topOpportunities: AnalyticsOpportunity[] =
    sortedOpportunities
      .slice(0, 5)
      .map(
        (opportunity) => ({
          id: opportunity.id,

          title: opportunity.title,

          score: opportunity.score,

          country: opportunity.country,
        })
      );

  return {

    evaluatedOpportunities:
      opportunities.length,

    averageScore:
      opportunities.length > 0
        ? opportunities.reduce(
            (sum, opportunity) =>
              sum + opportunity.score,
            0
          ) / opportunities.length
        : 0,

    topScore:
      sortedOpportunities.length > 0
        ? sortedOpportunities[0].score
        : 0,

    topOpportunities,

    targetRoles:
      uniqueStrings(
        careerState.intelligence.matching
          ?.targetRoles ?? []
      ),

    matchedSkills,

    matchedIndustries,

  };
}

function buildCareerSignals(
  careerState: CareerState
) {

  const matching =
    careerState.intelligence.matching;

  const competency =
    careerState.intelligence.competency;

  const knowledge =
    careerState.intelligence.knowledge;

  const strengths =
    uniqueStrings([
      ...(matching?.strengths ?? []),
      ...(competency?.strengths ?? []),
    ]);

  const gaps =
    uniqueStrings([
      ...(matching?.weaknesses ?? []),
      ...(competency?.gaps ?? []),
      ...(careerState.gapAnalysis.missingSkills ?? []),
    ]);

    const improvementAreas =
    uniqueStrings([
      ...(careerState.profileIntelligence
        .improvementAreas ?? []),
    ]);

  const recommendations =
    uniqueStrings([
      ...(matching?.recommendations ?? []),
      ...(careerState.readiness
        .recommendations ?? []),
    ]);

  return {
    strengths,
    gaps,
    improvementAreas,
    recommendations,
  };
}

export async function buildPremiumAnalyticsInsight(
  userId: string,
  careerState: CareerState,
  careerHealthScore: number,
  marketReadinessScore: number
): Promise<PremiumAnalyticsInsight> {

  const applicationInsights =
    await getApplicationInsights(
      userId
    );

  const opportunityPerformance =
    buildOpportunityPerformance(
      careerState
    );

  const careerSignals =
    buildCareerSignals(
      careerState
    );

  return {

    careerPerformance: {

      ats:
        careerState.readiness.atsScore,

      matching:
        careerState.intelligence.matching?.score ?? 0,

     competency:
        (careerState.intelligence.competency
          ?.overallScore ?? 0) * 100,

      knowledge:
        (careerState.intelligence.knowledge
          ?.averageScore ?? 0) * 100,

      careerHealth:
        careerHealthScore,

      marketReadiness:
        marketReadinessScore,

    },

    applicationPerformance: {

      totalApplications:
        applicationInsights.performance
          .totalApplications,

      activePipeline:
        applicationInsights.performance
          .activePipeline,

      responseRate:
        applicationInsights.performance
          .responseRate,

      rejectionRate:
        applicationInsights.performance
          .rejectionRate,

      conversionRate:
        applicationInsights.funnel
          .conversionRate,

      offerRate:
        applicationInsights.funnel
          .offerRate,

      successRate:
        applicationInsights.funnel
          .successRate,

      statusBreakdown:
        applicationInsights.statusBreakdown,

    },

    opportunityPerformance,

    careerSignals,

  };
}