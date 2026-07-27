import { UserLearningMemory } from "./learningMemoryTypes";

/**
 * ============================================================
 * UPDATE SKILL EVOLUTION
 * ============================================================
 */

export function updateSkillEvolution(
  memory: UserLearningMemory,
  skills: string[],
  success: boolean
): UserLearningMemory {
  const updated = { ...memory };

  for (const skill of skills) {
    const key = skill.toLowerCase();

    if (!updated.skillEvolution[key]) {
      updated.skillEvolution[key] = {
        skill,
        exposure: 0,
        success: 0,
        lastSeen: new Date().toISOString(),
      };
    }

    updated.skillEvolution[key].exposure += 1;

    if (success) {
      updated.skillEvolution[key].success += 1;
    }

    updated.skillEvolution[key].lastSeen = new Date().toISOString();
  }

  updated.lastUpdated = new Date().toISOString();

  return updated;
}

/**
 * ============================================================
 * UPDATE TRENDS
 * ============================================================
 */

export function updateTrends(
  memory: UserLearningMemory,
  ats?: number,
  ranking?: number,
  recommendation?: number
): UserLearningMemory {

  if (ats !== undefined) {
    memory.atsTrend.push(ats);
    if (memory.atsTrend.length > 50) memory.atsTrend.shift();
  }

  if (ranking !== undefined) {
    memory.rankingTrend.push(ranking);
    if (memory.rankingTrend.length > 50) memory.rankingTrend.shift();
  }

  if (recommendation !== undefined) {
    memory.recommendationTrend.push(recommendation);
    if (memory.recommendationTrend.length > 50)
      memory.recommendationTrend.shift();
  }

  memory.lastUpdated = new Date().toISOString();

  return memory;
}