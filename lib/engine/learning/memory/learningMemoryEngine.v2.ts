import { supabase } from "@/lib/supabase";
export interface LearningMemory {
  userId: string;

  trends: {
    atsHistory: number[];
    rankingHistory: number[];
    recommendationHistory: number[];
    decisionHistory: {
      decisionId: string;
      score: number;
      priority: string;
      timestamp: string;
    }[];
  };

  skills: {
    evolution: Record<
      string,
      {
        successRate: number;
        occurrences: number;
      }
    >;
  };

  metadata: {
    lastUpdated: string;
  };
}

export async function loadUserMemory(
  userId: string
): Promise<LearningMemory | null> {
  const { data } = await supabase
    .from("learning_memory_v2")
    .select("*")
    .eq("userId", userId)
    .single();

  return data || null;
}

export function createEmptyMemory(userId: string): LearningMemory {
  return {
    userId,
    trends: {
      atsHistory: [],
      rankingHistory: [],
      recommendationHistory: [],
      decisionHistory: [],
    },
    skills: {
      evolution: {},
    },
    metadata: {
      lastUpdated: new Date().toISOString(),
    },
  };
}

export async function saveUserMemory(memory: LearningMemory) {
  memory.metadata.lastUpdated = new Date().toISOString();

  await supabase
    .from("learning_memory_v2")
    .upsert(memory, { onConflict: "userId" });
}

export function updateTrends(
  memory: LearningMemory,
  ats?: number,
  ranking?: number,
  recommendation?: number
): LearningMemory {
  if (ats !== undefined) memory.trends.atsHistory.push(ats);
  if (ranking !== undefined) memory.trends.rankingHistory.push(ranking);
  if (recommendation !== undefined)
    memory.trends.recommendationHistory.push(recommendation);

  return memory;
}

export function updateSkillEvolution(
  memory: LearningMemory,
  skills: string[],
  success: boolean
): LearningMemory {
  for (const skill of skills) {
    const key = skill.toLowerCase();

    if (!memory.skills.evolution[key]) {
      memory.skills.evolution[key] = {
        successRate: 0,
        occurrences: 0,
      };
    }

    const entry = memory.skills.evolution[key];

    entry.occurrences += 1;

    const successFactor = success ? 1 : 0;

    entry.successRate =
      (entry.successRate * (entry.occurrences - 1) + successFactor) /
      entry.occurrences;
  }

  return memory;
}