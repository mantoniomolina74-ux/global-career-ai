import { LearningMemory } from "../memory/learningMemory.contract";

/**
 * ============================================================
 * Global Career AI
 * Learning Signal Engine V1 (Pattern Extractor Layer)
 * ============================================================
 */

export interface LearningSignals {
  userId: string;

  performance: {
    avgATS: number;
    avgRanking: number;
    avgRecommendation: number;
    trend: "UP" | "DOWN" | "STABLE";
  };

  skills: {
    topSkills: string[];
    weakSkills: string[];
    successCorrelations: Record<string, number>;
  };

  decisions: {
    highPriorityCount: number;
    successScoreAvg: number;
  };

  insights: string[];
}

/**
 * ============================================================
 * MAIN ENGINE
 * ============================================================
 */

export function generateLearningSignals(
  memory: LearningMemory
): LearningSignals {

  const ats = memory.trends.atsHistory || [];
  const ranking = memory.trends.rankingHistory || [];
  const rec = memory.trends.recommendationHistory || [];

  /**
   * ============================================================
   * PERFORMANCE METRICS
   * ============================================================
   */

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const avgATS = avg(ats);
  const avgRanking = avg(ranking);
  const avgRecommendation = avg(rec);

  const trend =
    ats.length < 2
      ? "STABLE"
      : ats[ats.length - 1] > ats[0]
      ? "UP"
      : ats[ats.length - 1] < ats[0]
      ? "DOWN"
      : "STABLE";

  /**
   * ============================================================
   * SKILL ANALYSIS
   * ============================================================
   */

  const skillsEntries = Object.entries(memory.skills.evolution || {});

  const sortedSkills = skillsEntries.sort(
    (a, b) => b[1].successRate - a[1].successRate
  );

  const topSkills = sortedSkills.slice(0, 5).map(([k]) => k);

  const weakSkills = sortedSkills
    .slice(-5)
    .map(([k]) => k);

  const successCorrelations: Record<string, number> = {};

  for (const [skill, data] of skillsEntries) {
    successCorrelations[skill] = Number(data.successRate.toFixed(2));
  }

  /**
   * ============================================================
   * DECISION ANALYSIS
   * ============================================================
   */

  const decisions = memory.trends.decisionHistory || [];

  const highPriorityCount = decisions.filter(
    (d) => d.priority === "HIGH" || d.priority === "CRITICAL"
  ).length;

  const successScoreAvg =
    decisions.length === 0
      ? 0
      : decisions.reduce((acc, d) => acc + d.score, 0) /
        decisions.length;

  /**
   * ============================================================
   * INSIGHTS GENERATION (RULE-BASED V1)
   * ============================================================
   */

  const insights: string[] = [];

  if (avgATS < 50) {
    insights.push("ATS score consistently below threshold");
  }

  if (avgRanking < 60) {
    insights.push("Ranking performance indicates weak market positioning");
  }

  if (trend === "DOWN") {
    insights.push("Performance trend is declining over time");
  }

  if (highPriorityCount > 3) {
    insights.push("User frequently triggers high-risk decisions");
  }

  if (topSkills.length === 0) {
    insights.push("No dominant skill pattern detected");
  }

  if (avgRecommendation > 70) {
    insights.push("Strong recommendation alignment detected");
  }

  /**
   * ============================================================
   * OUTPUT
   * ============================================================
   */

  return {
    userId: memory.userId,

    performance: {
      avgATS,
      avgRanking,
      avgRecommendation,
      trend,
    },

    skills: {
      topSkills,
      weakSkills,
      successCorrelations,
    },

    decisions: {
      highPriorityCount,
      successScoreAvg,
    },

    insights,
  };
}
