import { emitLearning } from "@/lib/engine/learning/learningEventBus";
import type { KnowledgeGapResult } from "../gapAnalysisTypes";
import type { LearningDomainEvent } from "@/lib/engine/learning/learningTypes";

/**
 * ============================================================
 * ADR-013.6
 * Knowledge → Learning Adapter
 * ============================================================
 * Translates Knowledge Gap Analysis results into
 * Learning System events.
 * ============================================================
 */

export function emitKnowledgeLearningEvent(
  userId: string,
  tenantId: string,
  analysis: KnowledgeGapResult
): void {
  const event: LearningDomainEvent = {
    userId,

    tenantId,

    type: "LEARNING_EVENT",

    timestamp: new Date().toISOString(),

    context: {
      action: "KNOWLEDGE_GAP_ANALYSIS",

      matchedSkills: analysis.strengths.map(
        strength => strength.domainName
      ),

      missingSkills: analysis.gaps.map(
        gap => gap.competencyName
      )
    },

    payload: {
      knowledgeAnalysis: {
        totalGaps: analysis.gaps.length,

        currentScore: analysis.improvement.currentScore,

        projectedScore: analysis.improvement.projectedScore,

        improvement: analysis.improvement.improvement,

        gaps: analysis.gaps,

        priorities: analysis.priorities,

        recommendations: analysis.recommendations
      }
    },

    metadata: {
      source: "KNOWLEDGE"
    }
  };

  emitLearning(event);
}