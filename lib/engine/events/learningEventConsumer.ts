import { learningEventBus } from "@/lib/engine/learning/learningEventBus";

import { updateUserEmbeddings } from "@/lib/engine/learning/updateUserEmbeddings";
import { incrementUserSignals } from "@/lib/engine/learning/incrementUserSignals";
import { persistLearningEvent } from "@/lib/engine/learning/persistLearningEvent";
import { runLearningIntelligence } from "@/lib/engine/learning/learningIntelligence";

import { LearningDomainEvent } from "@/lib/engine/learning/learningTypes";

/**
 * =========================================================
 * INIT CONSUMER
 * =========================================================
 */

let consumerInitialized = false;

export function initLearningEventConsumer(): void {
  if (consumerInitialized) {
    return;
  }

  learningEventBus.onEvent(
    "learning:event",
    async (event: LearningDomainEvent) => {
      await handleLearningEvent(event);
    }
  );

  consumerInitialized = true;
}

/**
 * =========================================================
 * PIPELINE HANDLER
 * =========================================================
 */

async function handleLearningEvent(
  event: LearningDomainEvent
): Promise<void> {
  try {
    const {
      userId,
      context,
    } = event;

    /**
     * =====================================================
     * 1. PERSISTENCE LAYER
     * =====================================================
     */
    await persistLearningEvent(event);

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
     * 4. INTELLIGENCE LAYER
     * =====================================================
     */
    const intelligence =
      runLearningIntelligence([event]);

    console.log(
      "[Learning Intelligence Result]",
      intelligence
    );

    console.log(
      "[Learning Policy Adjustments]",
      intelligence.policyAdjustments
    );
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

function shouldUpdateEmbeddings(
  action: string
): boolean {
  const triggers = new Set([
    "profile_updated",
    "job_viewed",
    "application_created",
    "skill_added",
    "career_goal_changed",
  ]);

  return triggers.has(action);
}