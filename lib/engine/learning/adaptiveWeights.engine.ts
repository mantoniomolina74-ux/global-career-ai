import { buildLearningInsights } from "./learningInsights.engine";

/**
 * ============================================================
 * Global Career AI
 * Adaptive Weight Engine V1
 * ============================================================
 */

export async function getAdaptiveSkillWeights(userId: string) {
  const insights = await buildLearningInsights(userId);

  const baseWeights: Record<string, number> = {
    javascript: 1,
    typescript: 1.1,
    react: 1.2,
    node: 1.1,
    python: 1.2,
  };

  const adjusted: Record<string, number> = { ...baseWeights };

  /**
   * If user has repeated skill gaps → increase penalty (focus training)
   */
  for (const skill in insights.skillWeaknessMap) {
    adjusted[skill] = (adjusted[skill] || 1) + insights.skillWeaknessMap[skill] * 0.05;
  }

  /**
   * If user has high success rate → boost all weights slightly
   */
  if (insights.successRate > 0.7) {
    for (const k in adjusted) {
      adjusted[k] *= 1.05;
    }
  }

  /**
   * If user is failing → tighten scoring model
   */
  if (insights.rejectionRate > 0.7) {
    for (const k in adjusted) {
      adjusted[k] *= 0.95;
    }
  }

  return {
    userId,
    weights: adjusted,
    insights,
  };
}