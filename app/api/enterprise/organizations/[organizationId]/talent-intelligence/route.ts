import { NextResponse } from "next/server";

import {
  getTalentIntelligence,
} from "@/lib/enterprise/talentIntelligenceService";

import {
  requireEnterprisePermission,
} from "@/lib/enterprise/enterpriseAuthorization";

import {
  createSupabaseServerAuth,
} from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    organizationId: string;
  }>;
}

async function getAuthenticatedUser() {
  const supabase =
    await createSupabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Authentication required"
    );
  }

  return user;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const user =
      await getAuthenticatedUser();

    const {
      organizationId,
    } = await context.params;

    if (!organizationId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Organization is required",
        },
        { status: 400 }
      );
    }

    await requireEnterprisePermission(
      user.id,
      organizationId,
      "VIEW_TALENT_INTELLIGENCE"
    );

    const intelligence =
      await getTalentIntelligence(
        user.id,
        organizationId
      );

    return NextResponse.json(
      {
        success: true,
        intelligence,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Talent Intelligence request failed";

    if (
      message ===
      "Authentication required"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: 401 }
      );
    }

    if (
      message.includes(
        "User is not a member of this organization"
      ) ||
      message.includes(
        "Insufficient enterprise permission"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}