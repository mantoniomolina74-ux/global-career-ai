/**
 * ============================================================
 * Global Career AI
 * Recommendation Engine V1.1
 * ============================================================
 *
 * Purpose:
 * --------
 * Composes actionable career recommendations from the
 * existing CareerState intelligence.
 *
 * This engine does NOT execute intelligence domains.
 * It does NOT calculate ATS, Matching, Competency, Knowledge,
 * or Learning intelligence.
 *
 * It consumes verified domain signals already present in
 * CareerState and produces deterministic recommendations.
 *
 * Feedback Loop:
 * --------------
 * Application outcomes and application-level intelligence are
 * consumed as evidence for future recommendations.
 *
 * No persistence.
 * No fake scores.
 * No generated opportunities.
 * No causal inference from application outcomes.
 * ============================================================
 */

import type { CareerState } from "@/lib/engine/contracts/careerState";

/* ============================================================
 * OUTPUT
 * ============================================================
 */

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: number;
  source:
    | "ats"
    | "matching"
    | "competency"
    | "knowledge"
    | "application";
}

export interface RecommendationResult {
  recommendations: Recommendation[];

  skillGaps: string[];

  opportunities: CareerState["intelligence"]["matching"] extends infer T
    ? T extends { opportunities: infer O }
      ? O
      : never
    : never;

  strategy: string;

  generatedAt: string;
}

/* ============================================================
 * HELPERS
 * ============================================================
 */

function uniqueStrings(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter(Boolean)
    )
  );
}

function countPositiveApplicationOutcomes(
  statusBreakdown: Record<string, number>
): number {
  return (
    (statusBreakdown["Interview Scheduled"] ?? 0) +
    (statusBreakdown["Final Interview"] ?? 0) +
    (statusBreakdown["Offer Received"] ?? 0) +
    (statusBreakdown["Hired"] ?? 0)
  );
}

/* ============================================================
 * ENGINE
 * ============================================================
 */

export function runRecommendationEngine(
  careerState: CareerState
): RecommendationResult {
  const recommendations: Recommendation[] = [];

  const ats = careerState.intelligence.ats;
  const matching = careerState.intelligence.matching;
  const competency = careerState.intelligence.competency;
  const knowledge = careerState.intelligence.knowledge;
  const application = careerState.intelligence.application;

  /*
   * ----------------------------------------------------------
   * ATS SIGNALS
   * ----------------------------------------------------------
   */

  if (ats?.missingSkills?.length) {
    recommendations.push({
      id: "ats-skill-alignment",
      title: "Improve ATS Skill Alignment",
      description: ats.recommendation,
      priority: 10,
      source: "ats",
    });
  }

  /*
   * ----------------------------------------------------------
   * MATCHING SIGNALS
   * ----------------------------------------------------------
   */

  for (const recommendation of matching?.recommendations ?? []) {
    recommendations.push({
      id: `matching-${recommendation
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`,
      title: "Improve Opportunity Matching",
      description: recommendation,
      priority: 9,
      source: "matching",
    });
  }

  /*
   * ----------------------------------------------------------
   * COMPETENCY SIGNALS
   * ----------------------------------------------------------
   */

  if (competency?.gaps?.length) {
    for (const gap of competency.gaps) {
      recommendations.push({
        id: `competency-${gap
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}`,
        title: "Strengthen Competency",
        description: `Develop competency in ${gap}.`,
        priority: 8,
        source: "competency",
      });
    }
  }

  /*
   * ----------------------------------------------------------
   * KNOWLEDGE SIGNALS
   * ----------------------------------------------------------
   *
   * Knowledge gaps themselves are not reconstructed here.
   * Knowledge Intelligence owns that logic.
   *
   * We only expose low-confidence domain signals when they
   * already exist in the CareerState.
   */

  for (const domain of knowledge?.domains ?? []) {
    if (domain.score < 0.7 && domain.confidence >= 0.6) {
      recommendations.push({
        id: `knowledge-${domain.domain.id}`,
        title: "Strengthen Domain Knowledge",
        description: `Strengthen knowledge in ${domain.domain.name}.`,
        priority: 7,
        source: "knowledge",
      });
    }
  }

  /*
   * ----------------------------------------------------------
   * APPLICATION FEEDBACK LOOP
   * ----------------------------------------------------------
   *
   * Only real application evidence already present in
   * ApplicationState is consumed here.
   *
   * No outcome is treated as proof of causation.
   */

  if (application) {
    const statusBreakdown = application.statusBreakdown;

    const rejectedApplications =
      statusBreakdown["Rejected"] ?? 0;

    const positiveOutcomes =
      countPositiveApplicationOutcomes(statusBreakdown);

    const applicationIntelligence =
      application.applicationIntelligence;

    const applicationEntries = Object.entries(
      applicationIntelligence
    );

    const atsAvailableApplications =
      applicationEntries.filter(
        ([, intelligence]) =>
          intelligence.atsScore !== null
      );

    const highRiskApplications =
      applicationEntries.filter(
        ([, intelligence]) =>
          intelligence.riskLevel === "high"
      );

    const repeatedMissingSkills = uniqueStrings(
      applicationEntries.flatMap(
        ([, intelligence]) =>
          intelligence.missingSkills
      )
    );

    /*
     * --------------------------------------------------------
     * APPLICATION OUTCOME SIGNAL
     * --------------------------------------------------------
     */

    if (rejectedApplications > 0) {
      recommendations.push({
        id: "application-rejection-feedback",
        title: "Review Rejected Application Patterns",
        description:
          rejectedApplications === 1
            ? "One real application has been rejected. Review the opportunity targeting and profile alignment used for that application."
            : `${rejectedApplications} real applications have been rejected. Review recurring opportunity targeting and profile alignment patterns.`,
        priority: 6,
        source: "application",
      });
    }

    /*
     * --------------------------------------------------------
     * POSITIVE OUTCOME SIGNAL
     * --------------------------------------------------------
     */

    if (positiveOutcomes > 0) {
      recommendations.push({
        id: "application-positive-feedback",
        title: "Use Positive Application Outcomes",
        description:
          positiveOutcomes === 1
            ? "One real application has reached an interview or later stage. Use this outcome as evidence when refining future opportunity targeting."
            : `${positiveOutcomes} real applications have reached an interview or later stage. Use these outcomes as evidence when refining future opportunity targeting.`,
        priority: 6,
        source: "application",
      });
    }

    /*
     * --------------------------------------------------------
     * ATS EVIDENCE SIGNAL
     * --------------------------------------------------------
     */

    if (
      atsAvailableApplications.length > 0 &&
      highRiskApplications.length > 0
    ) {
      recommendations.push({
        id: "application-ats-risk-feedback",
        title: "Review Low-ATS Application Patterns",
        description:
          `${highRiskApplications.length} application${highRiskApplications.length === 1 ? "" : "s"} with ATS evidence are classified as high risk. Review the recurring profile-to-opportunity alignment signals before expanding similar applications.`,
        priority: 7,
        source: "application",
      });
    }

    /*
     * --------------------------------------------------------
     * REPEATED GAP SIGNAL
     * --------------------------------------------------------
     */

    if (repeatedMissingSkills.length > 0) {
      recommendations.push({
        id: "application-repeated-gaps",
        title: "Address Repeated Application Gaps",
        description:
          `Application evidence contains recurring missing skills: ${repeatedMissingSkills.join(", ")}.`,
        priority: 7,
        source: "application",
      });
    }
  }

  /*
   * ----------------------------------------------------------
   * DEDUPLICATION
   * ----------------------------------------------------------
   */

  const deduplicatedRecommendations = Array.from(
    new Map(
      recommendations.map((recommendation) => [
        recommendation.id,
        recommendation,
      ])
    ).values()
  ).sort((a, b) => b.priority - a.priority);

  /*
   * ----------------------------------------------------------
   * SKILL GAPS
   * ----------------------------------------------------------
   */

  const skillGaps = uniqueStrings([
    ...(ats?.missingSkills ?? []),
    ...(matching?.weaknesses ?? []),
    ...(competency?.gaps ?? []),
    ...(application
      ? Object.values(
          application.applicationIntelligence
        ).flatMap(
          (intelligence) =>
            intelligence.missingSkills
        )
      : []),
  ]);

  /*
   * ----------------------------------------------------------
   * STRATEGY
   * ----------------------------------------------------------
   */

  let strategy = "Maintain current career strategy.";

  if (deduplicatedRecommendations.length > 0) {
    const highestPriority =
      deduplicatedRecommendations[0]?.priority ?? 0;

    if (highestPriority >= 10) {
      strategy =
        "Prioritize profile alignment before expanding application activity.";
    } else if (highestPriority >= 8) {
      strategy =
        "Strengthen the highest-impact capability gaps before scaling applications.";
    } else {
      strategy =
        "Continue targeted improvement while using real application outcomes to refine strategy.";
    }
  }

  return {
    recommendations: deduplicatedRecommendations,
    skillGaps,
    opportunities: matching?.opportunities ?? [],
    strategy,
    generatedAt: new Date().toISOString(),
  };
}

export default runRecommendationEngine;