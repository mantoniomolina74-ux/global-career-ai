import { z } from "zod";

/**
 * ============================================================
 * Global Career AI
 * API Schema Layer V1
 * ============================================================
 */

export const CareerRunSchema = z.object({
  userId: z.string(),

  profile: z.object({
    professionalText: z.string().optional(),
  }).optional(),

  applications: z.array(
    z.object({
      applicationId: z.string().optional(),
      candidateSkills: z.array(z.string()).optional(),
      jobDescription: z.string().optional(),
      cvStrengthScore: z.number().optional(),
    })
  ),

  requiredSkills: z.array(z.string()).optional(),
  candidateSkills: z.array(z.string()).optional(),
  jobDescription: z.string().optional(),

  cvStrengthScore: z.number().optional(),

  rankingStrategy: z.enum(["default", "ats", "hybrid"]).optional(),
  topK: z.number().optional(),
});

export type CareerRunInput = z.infer<typeof CareerRunSchema>;
