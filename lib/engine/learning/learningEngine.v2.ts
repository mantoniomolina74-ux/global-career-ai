
import { supabase } from "@/lib/supabase";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

export interface LearningEvent {
  userId: string;

  organizationId?: string;

  applicationId: string;
  atsScore: number;
  status: string;

  matchedSkills: string[];
  missingSkills: string[];

  createdAt?: string;
}

export interface LearningInsight {
  skill: string;
  successRate: number;
  weightAdjustment: number;
}

type SkillLearningStat = {
  skill: string;
  total_success: number;
  success_count: number;
};

/**
 * =========================================================
 * CORE LEARNING ENGINE V2 (ANALYTICS MODE)
 * =========================================================
 *
 * IMPORTANT:
 * This engine is now READ-ONLY.
 *
 * It does NOT persist or mutate data.
 * It ONLY computes insights from already stored learning data.
 */

export async function learningEngineV2(event: LearningEvent) {
  /**
   * =====================================================
   * 1. DEFINE OUTCOME SIGNAL
   * =====================================================
   */

  const success =
    event.status === "offer" || event.status === "interview";

  /**
   * =====================================================
   * 2. EXTRACT SIGNALS (FOR FUTURE ANALYTICS USE)
   * =====================================================
   */

  /**
   * =====================================================
   * 3. LOAD HISTORICAL SKILL DATA
   * =====================================================
   */

  const { data: skillStats, error: statsError } = await supabase
    .from("skill_learning_stats")
    .select("*");

  if (statsError) {
    console.error("[learningEngineV2] stats error:", statsError);
  }

  /**
   * =====================================================
   * 4. COMPUTE ADAPTIVE INSIGHTS (ANALYTICS LAYER)
   * =====================================================
   */

  const insights: LearningInsight[] = (
    skillStats as SkillLearningStat[] | null || []
  ).map((row: SkillLearningStat) => {
    const successRate =
      row.total_success > 0
        ? row.success_count / row.total_success
        : 0;

    return {
      skill: row.skill,
      successRate,
      weightAdjustment:
        successRate > 0.7
          ? 1.2
          : successRate < 0.3
          ? 0.8
          : 1.0,
    };
  });

  /**
   * =====================================================
   * 5. RETURN LEARNING SIGNALS
   * =====================================================
   */

  return {
    success,
    processed: true,
    insights,

    meta: {
      version: "learning-v2-analytics",
      processedAt: new Date().toISOString(),
    },
  };
}