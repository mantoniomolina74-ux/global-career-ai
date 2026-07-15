import { generateUserAnalytics } from "@/lib/analytics/analyticsEngine.v1";
import { getLearningMemory } from "@/lib/db/repositories/learningMemoryRepo";

/**
 * ============================================================
 * Global Career AI
 * Dashboard Adapter V1 (Product Read Layer) — STABLE
 * ============================================================
 */

export async function getDashboardData(userId: string, tenantId?: string) {
  const memory = await getLearningMemory(userId, tenantId);

  if (!memory) {
    return {
      userId,
      empty: true,
      message: "No data available yet",
    };
  }

  /**
   * ============================================================
   * SAFE MEMORY WRAPPER (STABILITY LAYER)
   * ============================================================
   */

  const safeMemory = {
    ...memory,
    trends: {
      atsHistory: memory?.trends?.atsHistory ?? [],
      rankingHistory: memory?.trends?.rankingHistory ?? [],
      decisionHistory: memory?.trends?.decisionHistory ?? [],
      recommendationHistory: memory?.trends?.recommendationHistory ?? [],
    },
  };

  /**
   * ============================================================
   * ANALYTICS ENGINE
   * ============================================================
   */

  const analytics = generateUserAnalytics(safeMemory);

  /**
   * ============================================================
   * SAFE UI DERIVATION
   * ============================================================
   */

  const hireProbability =
    analytics?.funnel?.estimatedHireProbability ?? 0;

  return {
    userId,
    analytics,

    ui: {
      status:
        hireProbability > 0.6
          ? "HIGH_POTENTIAL"
          : hireProbability > 0.3
          ? "MID_POTENTIAL"
          : "LOW_POTENTIAL",
    },
  };
}