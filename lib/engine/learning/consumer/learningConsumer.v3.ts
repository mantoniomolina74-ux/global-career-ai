import { learningEventBus } from "../learningEventBus";

import {
  loadUserMemory,
  saveUserMemory,
  updateSkillEvolution,
  updateTrends,
  createEmptyMemory,
  LearningMemory,
} from "../memory/learningMemoryEngine.v2";

/**
 * ============================================================
 * Global Career AI
 * Learning Consumer V3 (Reactive Memory System)
 * ============================================================
 */

type LearningConsumerEvent = {
  id: string;
  userId: string;
  type: string;
  payload?: {
    atsScore?: number;
    skills?: string[];
    avgScore?: number;
    decision?: {
      overallScore?: number;
      priority?: string;
    };
    overallScore?: number;
  };
};

export function startLearningConsumerV3() {
  learningEventBus.on("ATS_EVALUATED", handleEvent);
  learningEventBus.on("RANKING_GENERATED", handleEvent);
  learningEventBus.on("DECISION_CREATED", handleEvent);
  learningEventBus.on("RECOMMENDATION_CREATED", handleEvent);

  console.log("🧠 Learning Consumer V3 ACTIVE");
}

/**
 * ============================================================
 * EVENT HANDLER
 * ============================================================
 */

async function handleEvent(event: LearningConsumerEvent) {
  try {
    const { userId, type, payload, id } = event;

    if (!userId) return;

    let memory: LearningMemory | null = await loadUserMemory(userId);

    if (!memory) {
      memory = createEmptyMemory(userId);
    }

    switch (type) {
      /**
       * ============================
       * ATS EVENTS
       * ============================
       */
      case "ATS_EVALUATED": {
        const atsScore = payload?.atsScore ?? 0;
        const skills = payload?.skills ?? [];

        memory = updateTrends(memory, atsScore);
        memory = updateSkillEvolution(memory, skills, atsScore > 70);
        break;
      }

      /**
       * ============================
       * RANKING EVENTS
       * ============================
       */
      case "RANKING_GENERATED": {
        const avgScore =
          typeof payload?.avgScore === "number"
            ? payload.avgScore
            : 0;

        if (!memory?.trends) return;

        memory.trends.rankingHistory ||= [];

        memory = updateTrends(memory, undefined, avgScore);
        break;
      }

      /**
       * ============================
       * DECISION EVENTS
       * ============================
       */
      case "DECISION_CREATED": {
        const decision = payload?.decision;

        memory.trends.decisionHistory.push({
          decisionId: id,
          score: decision?.overallScore ?? 0,
          priority: decision?.priority ?? "LOW",
          timestamp: new Date().toISOString(),
        });

        break;
      }

      /**
       * ============================
       * RECOMMENDATION EVENTS
       * ============================
       */
      case "RECOMMENDATION_CREATED": {
        const score = payload?.overallScore ?? 0;

        // guard clause para evitar contaminación de memory
        if (!memory?.trends) return;

        memory.trends.recommendationHistory ||= [];

        memory = updateTrends(memory, undefined, undefined, score);
        break;
      }

      default:
        break;
    }

    await saveUserMemory(memory);
  } catch (error) {
    console.error("[LearningConsumerV3]", error);
  }
}