import { NextResponse } from "next/server";
import { getApplicationInsights } from "@/lib/engine/applications/applicationInsights";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const insights = await getApplicationInsights(userId);

    return NextResponse.json({
      applicationScores: insights.applicationScores,
      applicationIntelligence: insights.applicationIntelligence,
      statusBreakdown: insights.statusBreakdown,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}