
import { createClient } from "@supabase/supabase-js";

/**
 * ============================================================
 * Global Career AI
 * Learning Memory Repository (Supabase)
 * ============================================================
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function saveLearningEventToDB(event: {
  userId: string;
  signalType: string;
  weight: number;
  metadata: Record<string, unknown>;
}) {
  const { error } = await supabase.from("learning_events").insert({
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
  const { data, error } = await supabase
    .from("learning_events")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[LearningMemory] DB fetch error:", error);
    return [];
  }

  return data;
}