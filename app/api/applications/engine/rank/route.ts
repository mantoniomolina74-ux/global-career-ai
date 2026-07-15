import { NextResponse } from "next/server";
import { saasEngine } from "@/lib/infra/saasEngine";
import { withApiGuard } from "@/lib/api/apiGuard";

export async function POST(req: Request) {
  try {
    const result = await withApiGuard(req, async (ctx, body) => {
      return await saasEngine({
        userId: ctx.userId,
        mode: "rank",
        payload: body,
      });
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unauthorized request";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 401 }
    );
  }
}