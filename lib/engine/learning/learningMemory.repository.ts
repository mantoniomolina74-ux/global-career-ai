import { supabaseServer } from "@/lib/supabase-server";

/**
 * ============================================================
 * Global Career AI
 * Learning Memory Repository (Supabase)
 * ============================================================
 */

export async function saveLearningEventToDB(event: {
  tenantId: string;
  userId: string;
  signalType: string;
  weight: number;
  metadata: Record<string, unknown>;
}) {
  const { error } = await supabaseServer.from("learning_events").insert({
    tenant_id: event.tenantId,
    user_id: event.userId,
    signal_type: event.signalType,
    weight: event.weight,
    metadata: event.metadata,
  });

  if (error) {
    console.error("[LearningMemory] DB insert error:", error);
  }
}

export async function getLearningEventsByUser(userId: string) {
  const { data, error } = await supabaseServer
    .from("learning_events")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[LearningMemory] DB fetch error:", error);
    return [];
  }

  return data;
}
