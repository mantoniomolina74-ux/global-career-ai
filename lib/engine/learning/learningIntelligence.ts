import { LearningDomainEvent } from "./learningTypes";

import {
  detectLearningPatterns,
} from "../learning-intelligence/learningPatternEngine";

import {
  LearningPattern,
} from "../learning-intelligence/learningPatternTypes";

import {
  LearningSignal as IntelligenceSignal,
} from "../learning-intelligence/learningIntelligenceTypes";

import {
  adaptLearningEventToSignal,
} from "../learning-intelligence/learningSignalAdapter";

import {
  evaluateLearningPolicies,
} from "./policy/learningPolicyEngine";

import {
  LearningSignal as WeightLearningSignal,
} from "./weights/learningWeights.engine";


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

  patterns: LearningPattern[];

  policyAdjustments: WeightLearningSignal[];

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
    rankingsGenerated: 0,
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


    const matchedSkills =
      event.context.matchedSkills ?? [];


    const atsScore =
      Number(event.context.atsScore ?? 0);


    for (const skill of matchedSkills) {

      const current =
        skills.get(skill) ?? {
          occurrences: 0,
          successes: 0,
        };


      current.occurrences++;


      if (atsScore >= 70) {
        current.successes++;
      }


      skills.set(skill, current);
    }
  }


  const ranking: SkillInsight[] =
    Array.from(skills.entries()).map(
      ([skill, value]) => ({
        skill,

        occurrences:
          value.occurrences,

        successes:
          value.successes,

        successRate:
          value.occurrences === 0
            ? 0
            : Number(
                (
                  value.successes /
                  value.occurrences
                ).toFixed(2)
              ),
      })
    );


  ranking.sort(
    (a, b) =>
      b.successRate - a.successRate
  );


  const topSkills =
    ranking.slice(0, 10);


  const weakestSkills =
    [...ranking]
      .reverse()
      .slice(0, 10);


  /**
   * ============================================================
   * ADR-014.2
   * Pattern Detection Integration
   * ============================================================
   */

  const signals: IntelligenceSignal[] =
    events.map(
      adaptLearningEventToSignal
    );


  const patterns =
    detectLearningPatterns(
      signals
    );


  /**
   * ============================================================
   * ADR-014.1
   * Learning Policy Integration
   * ============================================================
   */

  const policyResult =
    evaluateLearningPolicies(
      patterns
    );


  const confidence = Number(
    Math.min(
      0.95,
      0.5 +
        statistics.totalEvents / 5000
    ).toFixed(2)
  );


  return {
    statistics,

    topSkills,

    weakestSkills,

    patterns,

    policyAdjustments:
      policyResult.signals,

    confidence,

    generatedAt:
      new Date().toISOString(),
  };
}