import { NextResponse } from "next/server";
import { z } from "zod";
import { saasEngine } from "@/lib/infra/saasEngine";

/**
 * =========================================================
 * VALIDATION (ZOD)
 * =========================================================
 */

const ScoreRequestSchema = z.object({
  userId: z.string(),
  applicationId: z.string().optional(),

  company: z.string().optional(),
  position: z.string().optional(),

  jobDescription: z.string().min(1),
  requiredSkills: z.array(z.string()).optional(),
  candidateSkills: z.array(z.string()).optional(),

  cvStrengthScore: z.number().optional(),
  status: z
    .enum([
      "applied",
      "in_review",
      "interview",
      "offer",
      "rejected",
    ])
    .optional(),
});

/**
 * =========================================================
 * POST /api/saas/score
 * =========================================================
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validated = ScoreRequestSchema.parse(body);

    const result = await saasEngine({
      mode: "score",
      userId: validated.userId,
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