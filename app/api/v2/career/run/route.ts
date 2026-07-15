import { NextResponse } from "next/server";
import { runCareerEngineV2 } from "./engine";

/**
 * ============================================================
 * Career AI API V2 Route
 * ============================================================
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await runCareerEngineV2({
      userId: body.userId,
      organizationId: body.organizationId,
      mode: body.mode,
      payload: body.payload,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Internal server error";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}