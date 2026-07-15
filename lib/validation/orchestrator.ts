import { z } from "zod";
import type { LearningMemory } from "@/lib/engine/learning/memory/learningMemoryEngine.v2";

/**
 * =========================================================
 * Career Orchestrator Validation Schema (Runtime Safety Layer)
 * =========================================================
 */

export const ApplicationReferenceSchema = z.object({
  applicationId: z.string(),
  userId: z.string(),

  company: z.string().optional(),
  position: z.string().optional(),

  jobDescription: z.string().optional(),

  requiredSkills: z.array(z.string()).optional(),
  candidateSkills: z.array(z.string()).optional(),

  cvStrengthScore: z.number().optional(),

  createdAt: z.string().optional(),
});

export const LearningMemorySchema: z.ZodType<LearningMemory> = z.object({
  userId: z.string(),

  trends: z.object({
    atsHistory: z.array(z.number()),
    rankingHistory: z.array(z.number()),
    recommendationHistory: z.array(z.number()),
    decisionHistory: z.array(
      z.object({
        decisionId: z.string(),
        score: z.number(),
        priority: z.string(),
        timestamp: z.string(),
      })
    ),
  }),

  skills: z.object({
    evolution: z.record(
      z.string(),
      z.object({
        successRate: z.number(),
        occurrences: z.number(),
      })
    ),
  }),

  metadata: z.object({
    lastUpdated: z.string(),
  }),
});

export const CareerOrchestratorInputSchema = z.object({
  userId: z.string(),

  applications: z.array(ApplicationReferenceSchema),

  candidateSkills: z.array(z.string()),
requiredSkills: z.array(z.string()),
jobDescription: z.string(),

cvStrengthScore: z.number().min(0).max(100),

industry: z.string().optional(),
country: z.string().optional(),

rankingStrategy: z.enum(["default", "ats", "hybrid"]).optional(),

topK: z.number().int().positive().optional(),

memory: LearningMemorySchema.optional(),
});

/**
 * Runtime validator helper
 */
export function validateCareerOrchestratorInput(
  input: unknown
): z.infer<typeof CareerOrchestratorInputSchema> {
  return CareerOrchestratorInputSchema.parse(input);
}