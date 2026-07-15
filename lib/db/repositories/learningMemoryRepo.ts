import { supabase } from "../supabaseClient";
import { LearningMemory } from "@/lib/engine/learning/memory/learningMemoryEngine.v2";

/**
 * ============================================================
 * Global Career AI
 * Learning Memory Repository (Multi-Tenant Ready)
 * ============================================================
 */

export async function getLearningMemory(
  userId: string,
  tenantId?: string
): Promise<LearningMemory | null> {

  let query = supabase
    .from("learning_memory_v2")
    .select("*")
    .eq("userId", userId);

  if (tenantId) {
    query = query.eq("tenantId", tenantId);
  }

  const { data, error } = await query.single();

  if (error) return null;

  return data as LearningMemory;
}

export async function upsertLearningMemory(
  memory: LearningMemory,
  tenantId?: string
) {
  const payload = {
    ...memory,
    tenantId: tenantId || "default",
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("learning_memory_v2")
    .upsert(payload, {
      onConflict: "userId,tenantId",
    });

  if (error) {
    console.error("[DB] upsertLearningMemory error:", error);
  }
}