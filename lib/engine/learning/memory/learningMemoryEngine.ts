import { supabaseServer } from "@/lib/supabase-server";
import { UserLearningMemory } from "./learningMemoryTypes";
import { updateSkillEvolution, updateTrends } from "./memoryOperations";

/**
 * ============================================================
 * LOAD MEMORY
 * ============================================================
 */

export async function loadUserMemory(userId: string) {
  const { data } = await supabaseServer
    .from("learning_memory")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data as UserLearningMemory | null;
}

/**
 * ============================================================
 * UPSERT MEMORY
 * ============================================================
 */

export async function saveUserMemory(memory: UserLearningMemory) {
  const { error } = await supabaseServer
    .from("learning_memory")
    .upsert({
      user_id: memory.userId,
      data: memory,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("[LearningMemory] save error:", error.message);
  }
}
