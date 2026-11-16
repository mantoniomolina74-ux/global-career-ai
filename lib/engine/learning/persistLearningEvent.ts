
import { supabaseServer } from "@/lib/supabase-server";
import { LearningDomainEvent } from "./learningTypes";

/**
 * ============================================================
 * Learning Event Persistence
 * ============================================================
 *
 * Persists the original event trace inside the existing
 * context column, without requiring database schema changes.
 * ============================================================
 */

export async function persistLearningEvent(
  event: LearningDomainEvent
): Promise<void> {
  const persistedContext = {
    ...event.context,
    __learningEventId: event.id ?? null,
    __learningEventType: event.type,
    __learningEventTimestamp: event.timestamp,
    __learningEventMetadata: event.metadata ?? null,
  };

  const { error } = await supabaseServer
    .from("learning_events")
    .insert({
      tenant_id: event.tenantId,
      user_id: event.userId,
      action: event.context.action,
      context: persistedContext,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("[persistLearningEvent] Supabase error:", error);
    throw error;
  }
}
