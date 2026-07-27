import { LearningMemory } from "@/lib/engine/learning/memory/learningMemoryEngine.v2";

export interface LearningMemoryRow {
  user_id: string;
  tenant_id: string;

  trends: LearningMemory["trends"];
  skills: LearningMemory["skills"];
  metadata: LearningMemory["metadata"];

  created_at: string;
  updated_at: string;
}

export interface LearningMemoryRecord extends LearningMemory {
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}