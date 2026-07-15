import { NextResponse } from "next/server";
import { z } from "zod";
import { saasEngine } from "@/lib/infra/saasEngine";

/**
 * =========================================================
 * VALIDATION (RECRUITER REQUEST)
 * =========================================================
 */

const CandidateSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  cvStrengthScore: z.number().optional(),
});

const RecruitRequestSchema = z.object({
  userId: z.string(),
  jobId: z.string(),

  jobTitle: z.string().optional(),
  jobDescription: z.string(),

  candidates: z.array(CandidateSchema),
});

/**
 * =========================================================
 * POST /api/saas/recruit
 * =========================================================
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validated = RecruitRequestSchema.parse(body);

    const result = await saasEngine({
      mode: "recruit",
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