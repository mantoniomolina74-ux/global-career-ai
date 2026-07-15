
import { LearningDomainEvent } from "./learningTypes";

/* ============================================================
 * TYPES
 * ============================================================
 */

export interface SkillInsight {
  skill: string;
  occurrences: number;
  successes: number;
  successRate: number;
}

export interface LearningStatistics {
  totalEvents: number;
  atsEvaluations: number;
  recommendationsGenerated: number;
  rankingsGenerated: number;
}

export interface LearningInsight {
  statistics: LearningStatistics;
  topSkills: SkillInsight[];
  weakestSkills: SkillInsight[];
  confidence: number;
  generatedAt: string;
}

/* ============================================================
 * ENGINE
 * ============================================================
 */

export function runLearningIntelligence(
  events: LearningDomainEvent[]
): LearningInsight {
  const statistics: LearningStatistics = {
    totalEvents: events.length,
    atsEvaluations: 0,
    recommendationsGenerated: 0,
    rankingsGenerated: 0
  };

  const skills = new Map<
    string,
    {
      occurrences: number;
      successes: number;
    }
  >();

  for (const event of events) {
    switch (event.type) {
      case "ATS_EVALUATED":
        statistics.atsEvaluations++;
        break;

      case "RECOMMENDATION_CREATED":
        statistics.recommendationsGenerated++;
        break;

      case "RANKING_GENERATED":
        statistics.rankingsGenerated++;
        break;
    }

    const payloadSkills =
      event.context.matchedSkills ?? [];

    const hiringScore =
      Number(event.context.atsScore ?? 0);

    for (const skill of payloadSkills) {
      const current =
        skills.get(skill) || {
          occurrences: 0,
          successes: 0,
        };

      current.occurrences++;

      if (hiringScore >= 70) {
        current.successes++;
      }

      skills.set(skill, current);
    }
  }

  const ranking: SkillInsight[] =
    Array.from(skills.entries()).map(([skill, value]) => ({
      skill,
      occurrences: value.occurrences,
      successes: value.successes,
      successRate:
        value.occurrences === 0
          ? 0
          : Number((value.successes / value.occurrences).toFixed(2)),
    }));

  ranking.sort((a, b) => b.successRate - a.successRate);

  const topSkills = ranking.slice(0, 10);

  const weakestSkills = [...ranking].reverse().slice(0, 10);

  const confidence = Number(
    Math.min(0.95, 0.5 + statistics.totalEvents / 5000).toFixed(2)
  );

  return {
    statistics,
    topSkills,
    weakestSkills,
    confidence,
    generatedAt: new Date().toISOString(),
  };
}