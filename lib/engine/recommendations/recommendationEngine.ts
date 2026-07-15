 /**
 * ============================================================
 * Global Career AI
 * Recommendation Engine V1 (Aligned Contract)
 * ============================================================
 *
 * Purpose:
 * --------
 * Generates strategic career recommendations based on
 * multiple scoring signals from the platform.
 *
 * This engine is deterministic and explainable.
 * ============================================================
 */

/* ============================================================
 * INPUT
 * ============================================================
 */

export interface RecommendationInput {
  atsScore: number;
  rankingScore: number;
  recruiterScore: number;
  learningScore: number;

  marketSignals?: number;
  skillCoverage?: number;
}

/* ============================================================
 * OUTPUT (Aligned with Context Engine + Decision Engine)
 * ============================================================
 */

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: number;
}

export interface RecommendationResult {
  overallScore: number;

  recommendations: Recommendation[];

  skillGaps: string[];

  opportunities: string[];

  confidence: number;

  strategy: string;

  generatedAt: string;
}

/* ============================================================
 * ENGINE
 * ============================================================
 */

export function runRecommendationEngine(
  input: RecommendationInput
): RecommendationResult {
  const ats = input.atsScore || 0;
  const ranking = input.rankingScore || 0;
  const recruiter = input.recruiterScore || 0;
  const learning = input.learningScore || 0;
  const market = input.marketSignals || 0;
  const skills = input.skillCoverage || 0;

  const overallScore = Math.round(
    ats * 0.25 +
      ranking * 0.25 +
      recruiter * 0.2 +
      learning * 0.15 +
      market * 0.1 +
      skills * 0.05
  );

  const recommendations: Recommendation[] = [];
  const skillGaps: string[] = [];
  const opportunities: string[] = [];

  let strategy = "Maintain current career strategy.";

  if (overallScore < 50) {
    strategy = "Rebuild profile before scaling applications.";

    recommendations.push({
      id: "profile-rebuild",
      title: "Rebuild Professional Profile",
      description:
        "Improve ATS alignment and strengthen core skills visibility.",
      priority: 10,
    });

    skillGaps.push(
      "Low ATS compatibility",
      "Weak recruiter signal"
    );
  } else if (overallScore < 70) {
    strategy =
      "Focus on targeted upskilling and visibility improvements.";

    recommendations.push({
      id: "upskilling-focus",
      title: "Targeted Upskilling",
      description:
        "Improve high-impact skills based on market demand.",
      priority: 8,
    });

    skillGaps.push("Moderate market positioning");
  } else {
    strategy =
      "Scale applications and optimize targeting strategy.";

    recommendations.push({
      id: "scale-strategy",
      title: "Scale Application Strategy",
      description:
        "Expand applications to high-value opportunities.",
      priority: 6,
    });

    opportunities.push("High recruiter engagement potential");
  }

  const confidence = Math.min(0.98, overallScore / 100 + 0.1);

  return {
    overallScore,
    recommendations,
    skillGaps,
    opportunities,
    confidence: Number(confidence.toFixed(2)),
    strategy,
    generatedAt: new Date().toISOString(),
  };
}

/* ============================================================
 * EXPORT DEFAULT ENGINE
 * ============================================================
 */

export default runRecommendationEngine;