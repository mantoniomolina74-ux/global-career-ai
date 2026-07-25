/**
 * =========================================================
 * Global Career AI
 * Learning Engine V2
 * ADR-014 Aligned Analytics Layer
 * =========================================================
 *
 * This engine:
 *
 * - Receives learning events.
 * - Computes immediate analytical insights.
 * - Does not persist data.
 * - Does not depend on deprecated analytics tables.
 *
 * Historical storage:
 * learning_events
 *
 * Intelligence layer:
 * learningIntelligence.ts
 *
 * =========================================================
 */


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


/**
 * =========================================================
 * CORE LEARNING ENGINE V2
 * =========================================================
 */

export async function learningEngineV2(
  event: LearningEvent
) {

  /**
   * =====================================================
   * 1. DEFINE OUTCOME SIGNAL
   * =====================================================
   */

  const success =
    event.status === "offer" ||
    event.status === "interview";


  /**
   * =====================================================
   * 2. COMPUTE SKILL INSIGHTS
   * =====================================================
   */

  const insights: LearningInsight[] =
    event.matchedSkills.map(
      (skill) => {

        const successRate =
          success
            ? 1
            : 0;


        return {
          skill,

          successRate,

          weightAdjustment:
            successRate > 0.7
              ? 1.2
              : successRate < 0.3
              ? 0.8
              : 1.0,
        };
      }
    );


  /**
   * =====================================================
   * 3. RETURN ANALYTICAL RESULT
   * =====================================================
   */

  return {
    success,

    processed:
      true,

    insights,

    meta: {
      version:
        "learning-v2-adr014",

      processedAt:
        new Date().toISOString(),
    },
  };
}