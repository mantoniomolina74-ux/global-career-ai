import { eventBus } from "@/lib/events/core/eventBus";

import { updateUserEmbeddings } from "@/lib/engine/learning/updateUserEmbeddings";
import { incrementUserSignals } from "@/lib/engine/learning/incrementUserSignals";
import { persistLearningEvent } from "@/lib/engine/learning/persistLearningEvent";
import { learningEngineV2 } from "@/lib/engine/learning/learningEngine.v2";
import { runLearningIntelligence } from "@/lib/engine/learning/learningIntelligence";

import { LearningDomainEvent } from "@/lib/engine/learning/learningTypes";

/**
 * =========================================================
 * INIT CONSUMER
 * =========================================================
 */

export function initLearningEventConsumer(): void {
  eventBus.on("learning:event", async (event: LearningDomainEvent) => {
    await handleLearningEvent(event);
  });
}

/**
 * =========================================================
 * PIPELINE HANDLER
 * =========================================================
 */

async function handleLearningEvent(event: LearningDomainEvent): Promise<void> {
  try {
    const { userId, context } = event;

    /**
     * =====================================================
     * 1. PERSISTENCE LAYER
     * =====================================================
     */
    await persistLearningEvent(userId, context);

    /**
     * =====================================================
     * 2. SIGNALS LAYER
     * =====================================================
     */
    await incrementUserSignals(userId, {
      action: context.action,
      context,
      timestamp: Date.now(),
    });

    /**
     * =====================================================
     * 3. EMBEDDINGS (SELECTIVE)
     * =====================================================
     */
    if (shouldUpdateEmbeddings(context.action)) {
      await updateUserEmbeddings(userId, {
        action: context.action,
        context,
        timestamp: Date.now(),
      });
    }

    /**
     * =====================================================
     * 4. ANALYTICS ENGINE (V2)
     * =====================================================
     */
    await learningEngineV2({
      userId,
      applicationId: context.applicationId ?? "",
      atsScore: context.atsScore ?? 0,
      status: context.status ?? "unknown",
      matchedSkills: context.matchedSkills ?? [],
      missingSkills: context.missingSkills ?? [],
    });

    /**
     * =====================================================
     * 5. INTELLIGENCE LAYER
     * =====================================================
     */
    await runLearningIntelligence([event]);
  } catch (error) {
    console.error("[learningEventConsumer]", {
      error,
      userId: event.userId,
      action: event.context?.action,
    });
  }
}

/**
 * =========================================================
 * EMBEDDING TRIGGERS
 * =========================================================
 */

function shouldUpdateEmbeddings(action: string): boolean {
  const triggers = new Set([
    "profile_updated",
    "job_viewed",
    "application_created",
    "skill_added",
    "career_goal_changed",
  ]);

  return triggers.has(action);
}