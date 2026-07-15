import { getLearningEvents } from "./learningMemory.store";

/**
 * ============================================================
 * VECTOR MEMORY ENGINE (CORE SAFE VERSION)
 * ============================================================
 */

export type SemanticVector = {
  userId: string;
  skills: string[];
  successScore: number;
};

let memory: SemanticVector[] = [];

export function buildVectorMemory() {
  const events = getLearningEvents();

  memory = events
    .filter((e) => e.type === "DECISION_CREATED")
    .map((e) => ({
      userId: e.userId,
      skills: [], // SAFE: no assumption on payload structure
      successScore: e.payload?.avgScore || 0,
    }));

  return memory;
}

export function findSimilarProfiles(inputSkills: string[]) {
  if (!memory.length) buildVectorMemory();

  return memory
    .map((m) => {
      const similarity =
        inputSkills.length > 0 ? 0 : 0; // disabled semantic match for now

      return {
        ...m,
        similarity,
        score: similarity * m.successScore,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}