import { NextResponse } from "next/server";
import { saasEngine } from "@/lib/infra/saasEngine";
import { withApiGuard } from "@/lib/api/apiGuard";

export async function POST(req: Request) {
  try {
    const result = await withApiGuard(req, async (ctx, body) => {
      return await saasEngine({
        userId: ctx.userId,
        mode: "score",
        payload: body,
      });
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 401 }
    );
  }
}