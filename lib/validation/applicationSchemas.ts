import { z } from "zod";

/**
 * =========================================================
 * COMMON TYPES
 * =========================================================
 */

export const SkillSchema = z.string().min(1).max(100);

export const UUIDSchema = z.string().min(1);

/**
 * =========================================================
 * CORE AI SIGNALS (EXTENSIBLE FOR LEARNING ENGINE V2)
 * =========================================================
 */

export const AISignalSchema = z.object({
  name: z.string(),
  weight: z.number().min(0).max(1).default(0.5),
  value: z.number().min(0).max(100).default(0),
});

/**
 * =========================================================
 * SCORE PIPELINE INPUT (ATS + SCORING v3 READY)
 * =========================================================
 */

export const ScoreSchema = z.object({
  id: UUIDSchema.optional(),
  userId: UUIDSchema,

  company: z.string().optional(),
  position: z.string().optional(),

  jobDescription: z.string().min(1),

  requiredSkills: z.array(SkillSchema).default([]),
  candidateSkills: z.array(SkillSchema).default([]),

  cvStrengthScore: z.number().min(0).max(100).default(50),

  /**
   * =========================================================
   * V3 EXTENSION LAYER (for scoringPipeline v3 + learningEngine v2)
   * =========================================================
   */

  aiSignals: z.array(AISignalSchema).default([]),

  experienceYears: z.number().min(0).max(60).optional(),

  educationLevel: z.enum([
    "none",
    "high_school",
    "associate",
    "bachelor",
    "master",
    "phd",
  ]).optional(),

  matchConfidence: z.number().min(0).max(1).default(0.5),
});

/**
 * =========================================================
 * RANK PIPELINE INPUT (rankingEngine v3 READY)
 * =========================================================
 */

export const RankSchema = z.object({
  jobId: UUIDSchema.optional(),
  userId: UUIDSchema,

  applications: z.array(ScoreSchema),

  /**
   * Ranking context (v3 upgrade)
   */
  rankingStrategy: z.enum([
    "default",
    "skills_weighted",
    "ai_signals",
    "experience_bias",
  ]).default("default"),

  topK: z.number().min(1).max(100).default(10),
});

/**
 * =========================================================
 * RECRUITER AGENT INPUT (recruiterAgent v2 READY)
 * =========================================================
 */

export const RecruitSchema = z.object({
  jobId: UUIDSchema,
  jobTitle: z.string().optional(),
  jobDescription: z.string().min(1),

  userId: UUIDSchema,

  candidates: z.array(ScoreSchema),

  /**
   * AI recruiter behavior layer (v2)
   */
  screeningMode: z.enum([
    "fast",
    "balanced",
    "deep",
  ]).default("balanced"),

  shortlistSize: z.number().min(1).max(50).default(10),
});

/**
 * =========================================================
 * SAFE TYPES EXPORT
 * =========================================================
 */

export type ScoreInput = z.infer<typeof ScoreSchema>;
export type RankInput = z.infer<typeof RankSchema>;
export type RecruitInput = z.infer<typeof RecruitSchema>;