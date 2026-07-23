import type { KnowledgeProfile } from "./knowledgeTypes";

import {
  KnowledgeGapResult,
  KnowledgeStrength,
  KnowledgeWeakness,
  KnowledgeGap,
  LearningPriority,
  LearningRecommendation,
  KnowledgeImprovementEstimate,
  KnowledgeLevel,
} from "./gapAnalysisTypes";

/**
 * Converts a numeric score into a knowledge level.
 */
function getKnowledgeLevel(score: number): KnowledgeLevel {
  if (score >= 90) return "expert";
  if (score >= 70) return "advanced";
  if (score >= 40) return "intermediate";
  return "beginner";
}

/**
 * ADR-013.5
 * Knowledge Gap Analysis Engine
 */
export function analyzeKnowledgeGaps(
  profile: KnowledgeProfile
): KnowledgeGapResult {
  const strengths: KnowledgeStrength[] = [];

  const weaknesses: KnowledgeWeakness[] = [];

  for (const domain of profile.domains) {
    const level = getKnowledgeLevel(domain.score);

    if (domain.score >= 70) {
      strengths.push({
        domainId: domain.domain.id,
        domainName: domain.domain.name,
        score: domain.score,
        level,
      });
    } else {
      weaknesses.push({
        domainId: domain.domain.id,
        domainName: domain.domain.name,
        score: domain.score,
        level,
      });
    }
  }

  const gaps: KnowledgeGap[] = [];

  const priorities: LearningPriority[] = [];

  const recommendations: LearningRecommendation[] = [];

  const improvement: KnowledgeImprovementEstimate = {
    currentScore: profile.averageScore,
    projectedScore: profile.averageScore,
    improvement: 0,
  };

  return {
    strengths,
    weaknesses,
    gaps,
    priorities,
    recommendations,
    improvement,
  };
}