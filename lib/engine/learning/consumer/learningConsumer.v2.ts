import { learningEventBus } from "../learningEventBus";

import {
  loadUserMemory,
  saveUserMemory,
} from "../memory/learningMemoryEngine";

import {
  updateSkillEvolution,
  updateTrends,
} from "../memory/memoryOperations";

/**
 * ============================================================
 * Global Career AI
 * Learning Consumer V2 (Event-driven Memory Builder)
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

export function startLearningConsumerV2() {
  learningEventBus.on("ATS_EVALUATED", handleEvent);
  learningEventBus.on("RANKING_GENERATED", handleEvent);
  learningEventBus.on("DECISION_CREATED", handleEvent);
  learningEventBus.on("RECOMMENDATION_CREATED", handleEvent);

  console.log("🧠 Learning Consumer V2 started");
}

/**
 * ============================================================
 * EVENT HANDLER
 * ============================================================
 */

async function handleEvent(event: LearningConsumerEvent) {
  try {
    const userId = event.userId;
    if (!userId) return;

    let memory = await loadUserMemory(userId);

    /**
     * ============================================================
     * SAFE INITIAL MEMORY (INLINE FALLBACK)
     * ============================================================
     */
    if (!memory) {
      memory = {
        userId,
        skillEvolution: {},
        decisionHistory: [],
        atsTrend: [],
        rankingTrend: [],
        recommendationTrend: [],
        lastUpdated: new Date().toISOString(),
      };
    }

    switch (event.type) {
      /**
       * ============================
       * ATS EVENTS
       * ============================
       */
      case "ATS_EVALUATED": {
        const atsScore = event.payload?.atsScore ?? 0;
        const skills = event.payload?.skills ?? [];

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
        const avgScore = event.payload?.avgScore ?? 0;

        memory = updateTrends(memory, undefined, avgScore);
        break;
      }

      /**
       * ============================
       * DECISION EVENTS
       * ============================
       */
      case "DECISION_CREATED": {
        const decision = event.payload?.decision;

        memory.decisionHistory.push({
          decisionId: event.id,
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
        const score = event.payload?.overallScore ?? 0;

        memory = updateTrends(memory, undefined, undefined, score);
        break;
      }

      default:
        break;
    }

    await saveUserMemory(memory);
  } catch (error) {
    console.error("[LearningConsumerV2]", error);
  }
}