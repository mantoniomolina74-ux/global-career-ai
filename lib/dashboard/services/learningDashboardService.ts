
/**
 * ============================================================
 * Global Career AI
 * Learning Dashboard Service V1.1
 * ============================================================
 *
 * Adapter between Learning Intelligence
 * and Dashboard Experience.
 *
 * Responsibilities:
 * - Read persisted learning events
 * - Run Learning Intelligence
 * - Transform domain output
 * - Return Dashboard-compatible structure
 *
 * Does not modify learning behavior.
 * ============================================================
 */

import type { LearningInsight } from "../contracts/dashboardContract";
import { readLearningEvents } from "@/lib/engine/learning/learningEventReader";
import { runLearningIntelligence } from "@/lib/engine/learning/learningIntelligence";


export interface LearningDashboardContext {
  userId: string;

  tenantId: string;
}


export async function getLearningDashboardInsight(
  context: LearningDashboardContext
): Promise<LearningInsight> {

  const events = await readLearningEvents(
    context.userId,
    context.tenantId
  );

  if (events.length === 0) {
    return {
      activePatterns: [],
      learningSignals: [],
      recommendedActions: [],
    };
  }

  const intelligence =
    runLearningIntelligence(events);


  const activePatterns =
    intelligence.patterns.map(
      (pattern) => pattern.description
    );


    const learningSignals =
    Array.from(
      new Set(
        intelligence.patterns.flatMap(
          (pattern) =>
            pattern.signals.map(
              (signal) => signal.description
            )
        )
      )
    );


  const recommendedActions =
    Array.from(
      new Set(
        intelligence.policyAdjustments.map(
          (adjustment) => {
            const actions: string[] = [];

            if (
              adjustment.atsDelta !== undefined &&
              adjustment.atsDelta !== 0
            ) {
              actions.push(
                adjustment.atsDelta > 0
                  ? "Improve ATS performance"
                  : "Address ATS performance gaps"
              );
            }

            if (
              adjustment.rankingDelta !== undefined &&
              adjustment.rankingDelta !== 0
            ) {
              actions.push(
                adjustment.rankingDelta > 0
                  ? "Improve opportunity ranking"
                  : "Review opportunity ranking"
              );
            }

            if (
              adjustment.decisionDelta !== undefined &&
              adjustment.decisionDelta !== 0
            ) {
              actions.push(
                adjustment.decisionDelta > 0
                  ? "Improve career decision confidence"
                  : "Review career decision signals"
              );
            }

            return actions.length > 0
              ? actions.join(" • ")
              : "Continue monitoring career performance";
          }
        )
      )
    );


  return {
    activePatterns,
    learningSignals,
    recommendedActions,
  };
}
