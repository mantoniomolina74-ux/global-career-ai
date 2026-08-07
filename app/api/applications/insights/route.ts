import { NextResponse } from "next/server";
import { getApplicationInsights } from "@/lib/engine/applications/applicationInsights";
import { buildRequestContext } from "@/lib/api/middleware/saasGuard";

export async function GET(req: Request) {
  try {
    const context = await buildRequestContext(req);

    const insights = await getApplicationInsights(
      context.userId
    );

    return NextResponse.json({
      applicationScores: insights.applicationScores,
      applicationIntelligence:
        insights.applicationIntelligence,
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