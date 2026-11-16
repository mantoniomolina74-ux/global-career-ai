import { NextResponse } from "next/server";

import {
  createSupabaseServerAuth,
} from "@/lib/supabase/server";
import {
  requireEnterprisePermission,
} from "@/lib/enterprise/enterpriseAuthorization";
import {
  getEnterpriseRecruiterIntelligence,
} from "@/lib/enterprise/enterpriseRecruiterService";

type RouteContext = {
  params: Promise<{
    organizationId: string;
    jobId: string;
  }>;
};

export async function POST(
  req: Request,
  context: RouteContext
) {
  try {
    const { organizationId, jobId } = await context.params;

    if (!organizationId || !jobId) {
      return NextResponse.json(
        {
          success: false,
          error: "organizationId and jobId are required",
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerAuth();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await requireEnterprisePermission(
      user.id,
      organizationId,
      "VIEW_CANDIDATE_INTELLIGENCE"
    );

    await req.json().catch(() => ({}));

    const result = await getEnterpriseRecruiterIntelligence({
      organizationId,
      jobId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Enterprise recruiter intelligence failed";

    const status =
      message.includes("not a member") ||
      message.includes("permission") ||
      message.includes("Forbidden")
        ? 403
        : message.includes("not found") ||
            message.includes("required")
          ? 400
          : 500;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}