import { supabaseServer } from "@/lib/supabase-server";
import { LearningDomainEvent } from "./learningTypes";

/**
 * Event Store base
 * Guarda todos los learning events para auditoría + replay futuro
 */
export async function persistLearningEvent(
  userId: string,
  payload: LearningDomainEvent["context"]
): Promise<void> {
  const { error } = await supabaseServer.from("learning_events").insert({
    user_id: userId,
    action: payload.action,
    context: payload,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[persistLearningEvent] Supabase error:", error);
    throw error;
  }
}