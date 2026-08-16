import { supabaseServer } from "@/lib/supabase-server";
import { LearningMemory } from "@/lib/engine/learning/memory/learningMemory.contract";
import { LearningMemoryRow, LearningMemoryRecord } from "./learningMemory.types";

/**
 * ============================================================
 * Global Career AI
 * Learning Memory Repository (Multi-Tenant Ready)
 * ============================================================
 */

function toDomain(row: LearningMemoryRow): LearningMemoryRecord {
  return {
    userId: row.user_id,
    tenantId: row.tenant_id,

    trends: row.trends,
    skills: row.skills,
    metadata: row.metadata,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPersistence(memory: LearningMemoryRecord): LearningMemoryRow {
  return {
    user_id: memory.userId,
    tenant_id: memory.tenantId,

    trends: memory.trends,
    skills: memory.skills,
    metadata: memory.metadata,

    created_at: memory.createdAt,
    updated_at: memory.updatedAt,
  };
}

export async function getLearningMemory(
  userId: string,
  tenantId?: string
): Promise<LearningMemory | null> {
  let query = supabaseServer
    .from("learning_memory_v2")
    .select("*")
    .eq("user_id", userId);

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return null;
  }

  return toDomain(data as LearningMemoryRow);
}

export async function upsertLearningMemory(
  memory: LearningMemoryRecord
): Promise<void> {
  const payload: LearningMemoryRow = toPersistence({
    ...memory,
    updatedAt: new Date().toISOString(),
  });

  const { error } = await supabaseServer
    .from("learning_memory_v2")
    .upsert(payload, {
      onConflict: "user_id,tenant_id",
    });

  if (error) {
    console.error("[DB] upsertLearningMemory error:", error);
  }
}
