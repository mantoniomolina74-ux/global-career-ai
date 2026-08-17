
/**
 * ============================================================
 * Global Career AI
 * Matching State Adapter V1.2.1
 * ============================================================
 *
 * Transforms Matching Engine output into Matching domain state.
 *
 * Responsibilities:
 * - Aggregate matching results
 * - Normalize intelligence state
 * - Preserve domain boundaries
 *
 * No dashboard logic.
 * No persistence.
 * No engine execution.
 * ============================================================
 */

import type {
  MatchingResultItem,
} from "@/lib/engine/contracts/matchingContracts";

import type {
  MatchingOpportunity,
  MatchingState,
} from "@/lib/engine/contracts/intelligence/matchingState";


export function buildMatchingState(
  results: MatchingResultItem[]
): MatchingState {

  /**
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */

  if (results.length === 0) {
    return {
      score: 0,

      confidence: 0,

      strengths: [],

      weaknesses: [],

      evidence: [],

      recommendations: [],

      targetRoles: [],

      opportunities: [],
    };
  }


  /**
   * ============================================================
   * TOP MATCHES
   * ============================================================
   *
   * The Matching Engine already returns results ordered by
   * match_score descending.
   *
   * The domain score represents the quality of the strongest
   * real opportunities, therefore we use the top 5.
   */

  const bestMatches =
    results.slice(0, 5);


  /**
   * ============================================================
   * MATCHING SCORE
   * ============================================================
   */

  const average = (
    values: number[]
  ) =>
    Math.round(
      values.reduce(
        (sum, value) => sum + value,
        0
      ) / values.length
    );


  const score =
    average(
      bestMatches.map(
        (item) => item.match_score
      )
    );


  /**
   * ============================================================
   * CONFIDENCE
   * ============================================================
   *
   * Confidence reflects the amount of real matching data
   * available to evaluate the candidate.
   */

  const confidence =
    Math.min(
      results.length / 10,
      1
    );


  /**
   * ============================================================
   * STRENGTHS
   * ============================================================
   *
   * Only verified matching signals produced by the engine
   * are exposed as strengths.
   */

  const strengths = [
    ...new Set(
      bestMatches.flatMap(
        (item) =>
          item.match_explanation?.matched_skills ?? []
      )
    ),
  ];


  /**
   * ============================================================
   * WEAKNESSES
   * ============================================================
   *
   * The current Matching Engine does not expose verified
   * candidate-side missing skills.
   *
   * Therefore we must not infer weaknesses from:
   * - matched industries
   * - certifications required by a job
   * - geography
   *
   * No evidence = no weakness.
   */

  const weaknesses: string[] = [];


  /**
   * ============================================================
   * EVIDENCE
   * ============================================================
   */

  const evidence = [
    ...new Set(
      bestMatches.flatMap(
        (item) =>
          item.match_reasons ?? []
      )
    ),
  ];


  /**
   * ============================================================
   * RECOMMENDATIONS
   * ============================================================
   *
   * Preserve the real matching reasons as recommendations.
   * These remain separate from target roles.
   */

  const recommendations = [
    ...new Set(
      bestMatches
        .flatMap(
          (item) =>
            item.match_reasons ?? []
        )
        .filter(
          (reason): reason is string =>
            typeof reason === "string" &&
            reason.trim().length > 0
        )
    ),
  ];


  /**
   * ============================================================
   * TARGET ROLES
   * ============================================================
   *
   * These are real job titles coming directly from the
   * Matching Engine / public.jobs source.
   *
   * No generated or inferred role names.
   */

  const targetRoles = [
    ...new Set(
      bestMatches
        .map(
          (item) => item.title
        )
        .filter(
          (title): title is string =>
            typeof title === "string" &&
            title.trim().length > 0
        )
    ),
  ];


  /**
   * ============================================================
   * REAL OPPORTUNITIES
   * ============================================================
   *
   * Preserve the strongest real opportunities together with
   * the verified signals generated by the Matching Engine.
   *
   * No generated titles.
   * No fabricated explanations.
   * No inferred candidate evidence.
   */

  const opportunities: MatchingOpportunity[] =
    bestMatches
      .filter(
        (
          item
        ): item is MatchingResultItem & {
          title: string;
        } =>
          typeof item.title === "string" &&
          item.title.trim().length > 0
      )
      .map(
        (item) => ({
          id:
            item.id,

          title:
            item.title,

          score:
            item.match_score,

          country:
            item.country,

          reasons:
            (item.match_reasons ?? [])
              .filter(
                (reason): reason is string =>
                  typeof reason === "string" &&
                  reason.trim().length > 0
              ),

          matchedSkills:
            item.match_explanation
              ?.matched_skills ?? [],

          matchedIndustries:
            item.match_explanation
              ?.matched_industries ?? [],
        })
      );


  /**
   * ============================================================
   * FINAL DOMAIN STATE
   * ============================================================
   */

  return {

    score,

    confidence,

    strengths,

    weaknesses,

    evidence,

    recommendations,

    targetRoles,

    opportunities,

  };

}