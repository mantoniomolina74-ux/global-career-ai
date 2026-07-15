import { getLearningEventsByUser } from "./learningMemory.repository";

/**
 * ============================================================
 * Global Career AI
 * Learning Insights Engine V1
 * ============================================================
 */

export type LearningInsights = {
  userId: string;
  avgSuccessScore: number;
  skillWeaknessMap: Record<string, number>;
  rejectionRate: number;
  successRate: number;
  dominantSignal: "IMPROVE_SCORING" | "SKILL_GAP" | "SUCCESS_PATTERN" | "BALANCED";
};

export async function buildLearningInsights(userId: string): Promise<LearningInsights> {
  const events = await getLearningEventsByUser(userId);

  if (!events.length) {
    return {
      userId,
      avgSuccessScore: 0,
      skillWeaknessMap: {},
      rejectionRate: 0,
      successRate: 0,
      dominantSignal: "BALANCED",
    };
  }

  let success = 0;
  const total = events.length;

  const skillMap: Record<string, number> = {};

  for (const e of events) {
    if (e.signal_type === "SUCCESS_PATTERN") success++;

    const meta = e.metadata || {};

    if (meta.missingSkills) {
      for (const skill of meta.missingSkills) {
        skillMap[skill] = (skillMap[skill] || 0) + 1;
      }
    }
  }

  const successRate = success / total;
  const rejectionRate = 1 - successRate;

  const dominantSignal =
    successRate > 0.6
      ? "SUCCESS_PATTERN"
      : rejectionRate > 0.6
      ? "IMPROVE_SCORING"
      : Object.keys(skillMap).length > 0
      ? "SKILL_GAP"
      : "BALANCED";

  return {
    userId,
    avgSuccessScore: Math.round(successRate * 100),
    skillWeaknessMap: skillMap,
    rejectionRate,
    successRate,
    dominantSignal,
  };
}