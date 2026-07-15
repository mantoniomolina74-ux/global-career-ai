import { NextResponse } from "next/server";
import { z } from "zod";
import { saasEngine } from "@/lib/infra/saasEngine";

/**
 * =========================================================
 * VALIDATION (RANK REQUEST)
 * =========================================================
 */

const ApplicationSchema = z.object({
  id: z.string().optional(),
  candidateSkills: z.array(z.string()).optional(),
  jobDescription: z.string().optional(),
  cvStrengthScore: z.number().optional(),
});

const RankRequestSchema = z.object({
  userId: z.string(),
  jobId: z.string(),

  applications: z.array(ApplicationSchema),

  rankingStrategy: z
    .enum(["default", "skills_weighted", "ai_signals"])
    .optional(),

  topK: z.number().optional(),
});

/**
 * =========================================================
 * POST /api/saas/rank
 * =========================================================
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validated = RankRequestSchema.parse(body);

    const result = await saasEngine({
      mode: "rank",
      userId: validated.userId,
      jobId: validated.jobId,
      payload: validated,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 400 }
    );
  }
}